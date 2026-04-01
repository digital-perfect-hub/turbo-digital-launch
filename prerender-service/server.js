import crypto from "node:crypto";
import express from "express";
import { chromium } from "playwright";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true);

const PORT = Number(process.env.PORT || 3000);
const HOST = (process.env.HOST || "0.0.0.0").trim() || "0.0.0.0";
const PRERENDER_SECRET_TOKEN = (process.env.PRERENDER_SECRET_TOKEN || "").trim();
const RENDER_TIMEOUT_MS = Number(process.env.RENDER_TIMEOUT_MS || 45000);
const POST_LOAD_STABILIZE_MS = Number(process.env.POST_LOAD_STABILIZE_MS || 1500);
const MAX_CONCURRENT_RENDERS = Math.max(1, Number(process.env.MAX_CONCURRENT_RENDERS || 2));
const BROWSER_RESTART_AFTER_N_RENDERS = Math.max(10, Number(process.env.BROWSER_RESTART_AFTER_N_RENDERS || 100));
const BLOCK_RESOURCE_TYPES = new Set(["image", "media", "font"]);
const ALLOWED_TARGET_HOSTS = (process.env.ALLOWED_TARGET_HOSTS || "digital-perfect.com,www.digital-perfect.com")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);
const ALLOWED_TARGET_HOST_SUFFIXES = (process.env.ALLOWED_TARGET_HOST_SUFFIXES || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

let browserPromise = null;
let activeRenders = 0;
let completedRendersSinceLaunch = 0;
let isShuttingDown = false;
const waitingResolvers = [];

const safeEqual = (left, right) => {
  const a = Buffer.from(left || "", "utf8");
  const b = Buffer.from(right || "", "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const isAllowedHost = (hostname) => {
  const normalized = (hostname || "").trim().toLowerCase();
  if (!normalized) return false;
  if (ALLOWED_TARGET_HOSTS.includes(normalized)) return true;
  return ALLOWED_TARGET_HOST_SUFFIXES.some((suffix) => suffix && normalized.endsWith(suffix));
};

const validateTargetUrl = (value) => {
  const candidate = (value || "").trim();
  if (!candidate) {
    throw new Error("Missing url query parameter.");
  }

  let targetUrl;
  try {
    targetUrl = new URL(candidate);
  } catch {
    throw new Error("Invalid target url.");
  }

  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    throw new Error("Only http and https target urls are allowed.");
  }

  if (!isAllowedHost(targetUrl.hostname)) {
    throw new Error("Target host is not allowed.");
  }

  return targetUrl;
};

const ensureAuthorized = (req, res, next) => {
  if (!PRERENDER_SECRET_TOKEN) {
    return res.status(500).send("Missing PRERENDER_SECRET_TOKEN.");
  }

  const provided = (req.get("x-prerender-token") || "").trim();
  if (!provided || !safeEqual(provided, PRERENDER_SECRET_TOKEN)) {
    return res.status(401).send("Unauthorized.");
  }

  return next();
};

const acquireRenderSlot = async () => {
  if (isShuttingDown) {
    throw new Error("Server is shutting down.");
  }

  if (activeRenders < MAX_CONCURRENT_RENDERS) {
    activeRenders += 1;
    return;
  }

  await new Promise((resolve) => waitingResolvers.push(resolve));

  if (isShuttingDown) {
    throw new Error("Server is shutting down.");
  }

  activeRenders += 1;
};

const releaseRenderSlot = () => {
  activeRenders = Math.max(0, activeRenders - 1);
  const next = waitingResolvers.shift();
  if (next) next();
};

const launchBrowser = async () => {
  console.log("[prerender] launching Chromium browser...");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-breakpad",
      "--disable-component-update",
      "--disable-domain-reliability",
      "--disable-renderer-backgrounding",
      "--mute-audio",
      "--no-first-run",
      "--disable-extensions",
    ],
  });

  browser.on("disconnected", () => {
    console.warn("[prerender] browser disconnected, clearing cached instance.");
    browserPromise = null;
    completedRendersSinceLaunch = 0;
  });

  return browser;
};

const getBrowser = async () => {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error) => {
      browserPromise = null;
      throw error;
    });
  }

  return browserPromise;
};

const closeBrowser = async () => {
  const current = browserPromise;
  browserPromise = null;
  completedRendersSinceLaunch = 0;

  if (!current) return;

  try {
    const browser = await current;
    await browser.close();
  } catch {
    // Ignore close errors.
  }
};

const maybeRecycleBrowser = async () => {
  if (activeRenders > 0) return;
  if (completedRendersSinceLaunch < BROWSER_RESTART_AFTER_N_RENDERS) return;

  console.log(`[prerender] recycling Chromium after ${completedRendersSinceLaunch} renders.`);
  await closeBrowser();
};

const waitForStableDom = async (page) => {
  await page.waitForLoadState("domcontentloaded", { timeout: RENDER_TIMEOUT_MS });
  await page.waitForLoadState("networkidle", { timeout: RENDER_TIMEOUT_MS }).catch(() => undefined);
  await page.waitForFunction(() => {
    const root = document.querySelector("#root");
    return !!root && root.childElementCount > 0;
  }, { timeout: RENDER_TIMEOUT_MS }).catch(() => undefined);
  await page.waitForTimeout(POST_LOAD_STABILIZE_MS);
};

const injectPrerenderMetadata = async (page, originalUrl) => {
  await page.addInitScript((url) => {
    window.__PRERENDER_ORIGINAL_URL__ = url;

    const ensureMeta = () => {
      let meta = document.querySelector('meta[name="prerender-original-url"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "prerender-original-url");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", url);
      document.documentElement.dataset.prerenderOriginalUrl = url;
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ensureMeta, { once: true });
    } else {
      ensureMeta();
    }
  }, originalUrl);
};

const rewriteCanonicalTags = async (page, originalUrl) => {
  await page.evaluate((url) => {
    const upsertMeta = (property, content) => {
      let tag = document.head.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", url);
    upsertMeta("og:url", url);
  }, originalUrl);
};

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    shuttingDown: isShuttingDown,
    activeRenders,
    maxConcurrentRenders: MAX_CONCURRENT_RENDERS,
  });
});

app.get("/ready", (_req, res) => {
  if (isShuttingDown || !PRERENDER_SECRET_TOKEN) {
    return res.status(503).json({ ok: false });
  }

  return res.json({ ok: true });
});

app.get("/render", ensureAuthorized, async (req, res) => {
  let context;
  let page;

  try {
    await acquireRenderSlot();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server is not ready.";
    return res.status(503).send(message);
  }

  try {
    const targetUrl = validateTargetUrl(String(req.query.url || ""));
    const browser = await getBrowser();

    context = await browser.newContext({
      ignoreHTTPSErrors: false,
      serviceWorkers: "block",
      viewport: { width: 1440, height: 2400 },
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      extraHTTPHeaders: {
        "x-prerender-bypass": "1",
        "x-prerender-token": PRERENDER_SECRET_TOKEN,
        "x-prerender-original-url": targetUrl.toString(),
      },
    });

    page = await context.newPage();
    page.setDefaultNavigationTimeout(RENDER_TIMEOUT_MS);
    page.setDefaultTimeout(RENDER_TIMEOUT_MS);

    await injectPrerenderMetadata(page, targetUrl.toString());

    await page.route("**/*", async (route) => {
      const request = route.request();
      const requestUrl = request.url();

      if (BLOCK_RESOURCE_TYPES.has(request.resourceType())) {
        return route.abort();
      }

      if (requestUrl.includes("/functions/v1/track-view")) {
        return route.abort();
      }

      return route.continue();
    });

    const response = await page.goto(targetUrl.toString(), { waitUntil: "domcontentloaded" });
    await waitForStableDom(page);
    await rewriteCanonicalTags(page, targetUrl.toString());

    const html = await page.content();
    const status = response?.status() || 200;

    res.status(status);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=604800, stale-while-revalidate=86400");
    res.send(`<!DOCTYPE html>${html}`);

    completedRendersSinceLaunch += 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown prerender error.";
    console.error("[prerender] render failed:", message);
    res.status(500).send(message);
  } finally {
    await page?.close().catch(() => undefined);
    await context?.close().catch(() => undefined);
    releaseRenderSlot();
    await maybeRecycleBrowser();
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[prerender] listening on http://${HOST}:${PORT}`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[prerender] received ${signal}, shutting down gracefully...`);

  server.close(async () => {
    await closeBrowser();
    process.exit(0);
  });

  while (waitingResolvers.length > 0) {
    const resolve = waitingResolvers.shift();
    if (resolve) resolve();
  }

  setTimeout(async () => {
    await closeBrowser();
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("uncaughtException", async (error) => {
  console.error("[prerender] uncaughtException:", error);
  await closeBrowser();
  process.exit(1);
});
process.on("unhandledRejection", async (error) => {
  console.error("[prerender] unhandledRejection:", error);
  await closeBrowser();
  process.exit(1);
});
