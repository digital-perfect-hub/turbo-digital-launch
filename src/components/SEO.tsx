import { useEffect, useMemo } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { buildRenderImageUrl } from "@/lib/image";

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  type?: string;
  noIndex?: boolean;
  structuredData?: StructuredData | null;
};

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

const cleanupStructuredData = () => {
  document.head.querySelectorAll('script[data-seo-structured="true"]').forEach((node) => node.remove());
};

const upsertStructuredData = (structuredData?: StructuredData | null) => {
  cleanupStructuredData();

  if (!structuredData) return;

  const payloads = Array.isArray(structuredData) ? structuredData : [structuredData];

  payloads.forEach((payload, index) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoStructured = "true";
    script.dataset.seoStructuredIndex = String(index);
    script.text = JSON.stringify(payload);
    document.head.appendChild(script);
  });
};

const SEO = ({
  title,
  description,
  image,
  canonical,
  type = "website",
  noIndex = false,
  structuredData = null,
}: SEOProps) => {
  const { getSetting } = useSiteSettings();

  const defaultTitle = useMemo(() => {
    const fallback = "Premium Webdesign & SEO Agentur";
    return truncate(getSetting("meta_title", fallback), 60);
  }, [getSetting]);

  const defaultDescription = useMemo(() => {
    const fallback = "Maximale Performance und messbare Anfragen durch Conversion-optimiertes Webdesign & SEO.";
    return truncate(getSetting("meta_description", fallback), 155);
  }, [getSetting]);

  const resolvedTitle = useMemo(() => truncate(title || defaultTitle, 60), [title, defaultTitle]);
  const resolvedDescription = useMemo(
    () => truncate(description || defaultDescription, 155),
    [description, defaultDescription],
  );

  const ogImageRaw = useMemo(() => image || getSetting("og_image", ""), [image, getSetting]);
  const ogImageUrl = useMemo(() => {
    if (!ogImageRaw) return "";
    if (ogImageRaw.startsWith("http")) return ogImageRaw;
    return buildRenderImageUrl(ogImageRaw, { width: 1200, quality: 80 });
  }, [ogImageRaw]);

  const resolvedCanonical = canonical || (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    if (resolvedTitle) document.title = resolvedTitle;
    upsertMeta({ name: "description" }, resolvedDescription);
    upsertMeta({ property: "og:title" }, resolvedTitle);
    upsertMeta({ property: "og:description" }, resolvedDescription);
    upsertMeta({ property: "og:image" }, ogImageUrl);
    upsertMeta({ property: "og:type" }, type);
    upsertMeta({ name: "robots" }, noIndex ? "noindex,follow" : "index,follow");
    upsertLink("canonical", resolvedCanonical);
    upsertStructuredData(structuredData);

    return cleanupStructuredData;
  }, [resolvedTitle, resolvedDescription, ogImageUrl, resolvedCanonical, type, noIndex, structuredData]);

  return null;
};

export default SEO;
