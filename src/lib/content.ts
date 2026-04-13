import DOMPurify from "dompurify";

const normalizeRichHeadingHierarchy = (value: string) =>
  value
    .replace(/<\s*h1\b([^>]*)>/gi, "<h2$1>")
    .replace(/<\s*\/\s*h1\s*>/gi, "</h2>");

export const sanitizeRichHtml = (value?: string | null) => {
  if (!value) return "";
  return DOMPurify.sanitize(value, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "iframe", "object", "embed", "style"],
    FORBID_ATTR: [
      "onclick",
      "ondblclick",
      "onmousedown",
      "onmouseup",
      "onmouseover",
      "onmousemove",
      "onmouseout",
      "onmouseenter",
      "onmouseleave",
      "onkeydown",
      "onkeypress",
      "onkeyup",
      "onfocus",
      "onblur",
      "onchange",
      "oninput",
      "onsubmit",
      "onreset",
      "onload",
      "onerror",
      "style",
    ],
  });
};

export const sanitizeRichHtmlWithoutH1 = (value?: string | null) =>
  normalizeRichHeadingHierarchy(sanitizeRichHtml(value));

export const stripHtmlToText = (value?: string | null) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
