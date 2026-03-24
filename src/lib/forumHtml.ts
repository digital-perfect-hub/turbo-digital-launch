import DOMPurify from "dompurify";
import { buildRenderImageUrl } from "@/lib/image";

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "ul", "ol", "li",
  "strong", "em", "b", "i", "u",
  "a", "span", "div", "section",
  "img", "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "details", "summary", "code", "pre", "figure", "figcaption",
];

const ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "srcset", "alt", "title",
  "class", "width", "height", "loading", "decoding",
  "colspan", "rowspan", "scope",
];

const FORBID_TAGS = [
  "script", "iframe", "object", "embed",
  "form", "input", "button", "textarea", "select",
  "style", "svg", "math",
];

const FORBID_ATTR = [
  "onclick", "ondblclick", "onmousedown", "onmouseup", "onmouseover", "onmousemove", "onmouseout",
  "onmouseenter", "onmouseleave", "onkeydown", "onkeypress", "onkeyup", "onfocus", "onblur",
  "onchange", "oninput", "onsubmit", "onreset", "onload", "onerror", "onabort", "onwheel",
  "ondrag", "ondragstart", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondrop",
  "ontouchstart", "ontouchmove", "ontouchend", "onpointerdown", "onpointermove", "onpointerup",
  "style",
];

const STORAGE_PUBLIC_SEGMENT = "/storage/v1/object/public/";
const STORAGE_RENDER_SEGMENT = "/storage/v1/render/image/public/";

const rewriteImageUrl = (value?: string | null, width = 1400, quality = 80) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";

  if (
    trimmed.includes(STORAGE_PUBLIC_SEGMENT) ||
    trimmed.includes(STORAGE_RENDER_SEGMENT) ||
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("forum-assets/")
  ) {
    return buildRenderImageUrl(trimmed, { width, quality });
  }

  return trimmed;
};

const rewriteImageSrcset = (srcset: string, width: number, quality: number) =>
  srcset
    .split(",")
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) return trimmed;

      const firstWhitespace = trimmed.search(/\s/);
      if (firstWhitespace === -1) {
        return rewriteImageUrl(trimmed, width, quality);
      }

      const url = trimmed.slice(0, firstWhitespace);
      const descriptor = trimmed.slice(firstWhitespace).trim();
      return `${rewriteImageUrl(url, width, quality)}${descriptor ? ` ${descriptor}` : ""}`;
    })
    .join(", ");

const normalizeClassList = (element: Element, classes: string[]) => {
  element.setAttribute("class", classes.join(" "));
};

const normalizeForumMarkup = (html?: string | null) => {
  if (!html) return "";
  const markup = String(html);

  if (typeof DOMParser === "undefined") {
    return markup;
  }

  const doc = new DOMParser().parseFromString(markup, "text/html");

  doc.body.querySelectorAll("a").forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    anchor.setAttribute("class", "theme-link-accent font-semibold underline underline-offset-4");
    if (/^https?:\/\//i.test(href)) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    } else {
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
    }
  });

  doc.body.querySelectorAll("img").forEach((img) => {
    const currentSrc = img.getAttribute("src");
    const currentSrcset = img.getAttribute("srcset");
    if (currentSrc) img.setAttribute("src", rewriteImageUrl(currentSrc, 1400, 80));
    if (currentSrcset) img.setAttribute("srcset", rewriteImageSrcset(currentSrcset, 1400, 80));
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    normalizeClassList(img, ["my-6", "w-full", "rounded-[24px]", "border", "shadow-sm"]);
  });

  doc.body.querySelectorAll("h1").forEach((el) => normalizeClassList(el, ["mt-8", "mb-4", "text-3xl", "font-black", "tracking-tight", "text-foreground"]));
  doc.body.querySelectorAll("h2").forEach((el) => normalizeClassList(el, ["mt-8", "mb-4", "text-2xl", "font-black", "tracking-tight", "text-foreground"]));
  doc.body.querySelectorAll("h3").forEach((el) => normalizeClassList(el, ["mt-6", "mb-3", "text-xl", "font-bold", "tracking-tight", "text-foreground"]));
  doc.body.querySelectorAll("p").forEach((el) => normalizeClassList(el, ["my-4", "text-base", "leading-8", "text-muted-foreground"]));
  doc.body.querySelectorAll("ul, ol").forEach((el) => normalizeClassList(el, ["my-4", "space-y-2", "pl-6", "text-muted-foreground"]));
  doc.body.querySelectorAll("li").forEach((el) => normalizeClassList(el, ["leading-8"]));
  doc.body.querySelectorAll("blockquote").forEach((el) =>
    normalizeClassList(el, ["surface-soft-panel", "my-6", "rounded-[24px]", "border", "border-l-4", "border-l-primary", "px-6", "py-5", "text-muted-foreground"])
  );
  doc.body.querySelectorAll("pre").forEach((el) =>
    normalizeClassList(el, ["support-dark-card", "my-6", "overflow-x-auto", "rounded-[24px]", "p-5", "text-sm"])
  );
  doc.body.querySelectorAll("code").forEach((el) => {
    if (el.parentElement?.tagName.toLowerCase() !== "pre") {
      normalizeClassList(el, ["rounded", "px-1.5", "py-0.5", "text-sm", "text-foreground"]);
    }
  });
  doc.body.querySelectorAll("table").forEach((el) =>
    normalizeClassList(el, ["my-6", "w-full", "overflow-hidden", "rounded-[24px]", "border", "text-left", "text-sm"])
  );
  doc.body.querySelectorAll("thead").forEach((el) => normalizeClassList(el, ["surface-soft-panel"]));
  doc.body.querySelectorAll("th, td").forEach((el) => normalizeClassList(el, ["border", "px-4", "py-3", "align-top", "text-muted-foreground"]));
  doc.body.querySelectorAll("figure").forEach((el) => normalizeClassList(el, ["my-6"]));
  doc.body.querySelectorAll("figcaption").forEach((el) => normalizeClassList(el, ["mt-3", "text-sm", "text-muted-foreground"]));
  doc.body.querySelectorAll("details").forEach((el) => normalizeClassList(el, ["surface-soft-panel", "my-4", "rounded-[20px]", "border", "p-4"]));
  doc.body.querySelectorAll("summary").forEach((el) => normalizeClassList(el, ["cursor-pointer", "font-semibold", "text-foreground"]));

  return doc.body.innerHTML;
};

export const sanitizeForumHtml = (html?: string | null) => {
  if (!html) return "";

  const normalized = normalizeForumMarkup(html);

  return DOMPurify.sanitize(normalized, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: FORBID_TAGS,
    FORBID_ATTR: FORBID_ATTR,
  });
};

export const getForumRenderImageUrl = (value?: string | null, width = 960, quality = 80) =>
  rewriteImageUrl(value, width, quality);
