import { useEffect, useMemo } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { buildRenderImageUrl } from "@/lib/image";

const truncate = (value: string, maxChars: number) => {
  const v = (value || "").trim();
  if (!v) return "";
  if (v.length <= maxChars) return v;
  return v.slice(0, maxChars).trimEnd();
};

const upsertMeta = (attrs: { name?: string; property?: string }, content: string) => {
  if (content === undefined || content === null) return;

  const selector = attrs.name
    ? `meta[name="${attrs.name}"]`
    : attrs.property
      ? `meta[property="${attrs.property}"]`
      : "";

  if (!selector) return;

  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (attrs.name) el.setAttribute("name", attrs.name);
    if (attrs.property) el.setAttribute("property", attrs.property);
    document.head.appendChild(el);
  }

  el.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string) => {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const SEO = () => {
  const { getSetting } = useSiteSettings();

  const metaTitle = useMemo(() => {
    const fallback = "Premium Webdesign & SEO Agentur";
    return truncate(getSetting("meta_title", fallback), 60);
  }, [getSetting]);

  const metaDescription = useMemo(() => {
    const fallback = "Maximale Performance und messbare Anfragen durch Conversion-optimiertes Webdesign & SEO.";
    return truncate(getSetting("meta_description", fallback), 155);
  }, [getSetting]);

  const ogImageRaw = useMemo(() => getSetting("og_image", ""), [getSetting]);
  const ogImageUrl = useMemo(() => {
    if (!ogImageRaw) return "";
    if (ogImageRaw.startsWith("http")) return ogImageRaw;
    return buildRenderImageUrl(ogImageRaw, { width: 1200, quality: 80 });
  }, [ogImageRaw]);

  useEffect(() => {
    if (metaTitle) document.title = metaTitle;
    upsertMeta({ name: "description" }, metaDescription);
    upsertMeta({ property: "og:title" }, metaTitle);
    upsertMeta({ property: "og:description" }, metaDescription);
    upsertMeta({ property: "og:image" }, ogImageUrl);
    upsertMeta({ property: "og:type" }, "website");
    upsertLink("canonical", window.location.href);
  }, [metaTitle, metaDescription, ogImageUrl]);

  return null;
};

export default SEO;

