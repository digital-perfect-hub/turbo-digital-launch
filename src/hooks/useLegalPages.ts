import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";

export type LegalPageSlug = "impressum" | "datenschutz" | "agb";

export type LegalPageRecord = {
  id: string;
  slug: LegalPageSlug;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  body: string | null;
  is_published: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export const legalPageDefaults: Record<LegalPageSlug, Pick<LegalPageRecord, "slug" | "title" | "seo_title" | "seo_description" | "body" | "is_published">> = {
  impressum: {
    slug: "impressum",
    title: "Impressum",
    seo_title: "Impressum | Digital-Perfect",
    seo_description: "Anbieterkennzeichnung, Kontaktinformationen und rechtliche Hinweise.",
    is_published: true,
    body: `
      <h2>Angaben gemäß § 5 TMG / § 25 MedienG</h2>
      <p>Digital-Perfect</p>
      <h2>Kontakt</h2>
      <p>Bitte pflege diese Seite im Admin-Modul „Recht & SEO“.</p>
    `,
  },
  datenschutz: {
    slug: "datenschutz",
    title: "Datenschutzerklärung",
    seo_title: "Datenschutzerklärung | Digital-Perfect",
    seo_description: "Informationen zur Verarbeitung personenbezogener Daten auf dieser Website.",
    is_published: true,
    body: `
      <h2>1. Datenschutz auf einen Blick</h2>
      <p>Bitte pflege diese Seite vollständig im Admin-Modul „Recht & SEO“.</p>
    `,
  },
  agb: {
    slug: "agb",
    title: "Allgemeine Geschäftsbedingungen",
    seo_title: "AGB | Digital-Perfect",
    seo_description: "Vertragsbedingungen für digitale Leistungen, Projekte und Produkte.",
    is_published: true,
    body: `
      <h2>§ 1 Geltungsbereich</h2>
      <p>Bitte pflege diese Seite vollständig im Admin-Modul „Recht & SEO“.</p>
    `,
  },
};

export const useLegalPage = (slug: LegalPageSlug) => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  return useQuery({
    queryKey: ["legal-page", siteId, slug],
    enabled: Boolean(siteId),
    queryFn: async (): Promise<LegalPageRecord> => {
      const fallback = legalPageDefaults[slug];
      const { data, error } = await supabase
        .from("legal_pages" as never)
        .select("*")
        .eq("slug", slug)
        .eq("site_id", siteId)
        .maybeSingle();

      if (error) {
        return {
          id: `fallback-${slug}`,
          ...fallback,
        };
      }

      if (!data) {
        return {
          id: `fallback-${slug}`,
          ...fallback,
        };
      }

      return data as unknown as LegalPageRecord;
    },
  });
};

export const useLegalPages = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  return useQuery({
    queryKey: ["legal-pages", siteId],
    enabled: Boolean(siteId),
    queryFn: async (): Promise<LegalPageRecord[]> => {
      const { data, error } = await supabase
        .from("legal_pages" as never)
        .select("*")
        .eq("site_id", siteId)
        .order("slug", { ascending: true });

      if (error || !data) {
        return Object.values(legalPageDefaults).map((page) => ({
          id: `fallback-${page.slug}`,
          ...page,
        }));
      }

      return data as unknown as LegalPageRecord[];
    },
  });
};
