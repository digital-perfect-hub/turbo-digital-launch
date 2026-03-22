import DOMPurify from "dompurify";

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

export const stripHtmlToText = (value?: string | null) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
