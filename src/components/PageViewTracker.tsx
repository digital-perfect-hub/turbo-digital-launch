import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { COOKIE_CONSENT_EVENT, readCookieConsent } from "@/lib/cookie-consent";

const SESSION_KEY = "dp.analytics.sessionId";
const LAST_TRACKED_PREFIX = "dp.analytics.lastTracked:";

const getSessionId = () => {
  if (typeof window === "undefined") return "server";
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, next);
  return next;
};

const getPageType = (pathname: string) => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/forum")) return "forum";
  if (pathname.startsWith("/produkt/")) return "product";
  return "page";
};

const getReferrerHost = () => {
  if (!document.referrer) return null;

  try {
    return new URL(document.referrer).hostname;
  } catch {
    return null;
  }
};

const PageViewTracker = () => {
  const location = useLocation();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const pathname = useMemo(() => location.pathname || "/", [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const track = async () => {
      const consent = readCookieConsent();
      if (!consent?.analytics) return;

      const dedupeKey = `${LAST_TRACKED_PREFIX}${siteId}:${pathname}`;
      const lastTrackedAt = window.sessionStorage.getItem(dedupeKey);
      const now = Date.now();
      if (lastTrackedAt && now - Number(lastTrackedAt) < 15_000) return;

      window.sessionStorage.setItem(dedupeKey, String(now));

      try {
        await supabase.functions.invoke("track-view", {
          body: {
            siteId,
            path: pathname,
            pageType: getPageType(pathname),
            pageSlug: pathname.replace(/^\/+/, "") || "home",
            sessionId: getSessionId(),
            referrerHost: getReferrerHost(),
          },
        });
      } catch {
        // tracking must never break the frontend
      }
    };

    void track();

    const listener = () => void track();
    window.addEventListener(COOKIE_CONSENT_EVENT, listener);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, listener);
  }, [pathname, siteId]);

  return null;
};

export default PageViewTracker;
