import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { LegalPage } from "@/components/premium-home/PremiumPage";
import { useSiteContext } from "@/context/SiteContext";
import { sanitizeRichHtml, stripHtmlToText } from "@/lib/content";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { type LegalPageRecord, type LegalPageSlug, isLegalPagePublishable, legalPageDefaults, useLegalPage } from "@/hooks/useLegalPages";

type LegalPageTemplateProps = {
  slug: LegalPageSlug;
};

const LegalPageTemplate = ({ slug }: LegalPageTemplateProps) => {
  const { activeSiteId } = useSiteContext();
  const { data, isLoading } = useLegalPage(slug);
  const page: LegalPageRecord = data ?? { id: `fallback-${slug}`, ...legalPageDefaults[slug] };
  // Platzhalter werden nie gezeigt: Ohne echten, veröffentlichten Text steht hier nur ein neutraler Hinweis,
  // und die Seite ist für Suchmaschinen gesperrt.
  const publishable = !isLoading && isLegalPagePublishable(page);
  const title = page.title || legalPageDefaults[slug].title;
  const sanitizedBody = publishable ? sanitizeRichHtml(page.body || "") : "";
  const metaDescription = publishable
    ? (page.seo_description || stripHtmlToText(page.body || "")).slice(0, 155)
    : legalPageDefaults[slug].seo_description || title;
  const seo = <SEO title={(publishable && page.seo_title) || legalPageDefaults[slug].seo_title || title} description={metaDescription} noIndex={!publishable} />;

  const content = isLoading ? (
    <p>Laden...</p>
  ) : publishable ? (
    <div dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
  ) : (
    <p data-legal-state="unpublished">Der Text dieser Seite ist noch nicht veröffentlicht.</p>
  );

  // Digital-Perfect: gleicher Rahmen wie alle anderen Seiten (Kopf, Fuß mit Rechtslinks und Cookie-Einstellungen).
  if (activeSiteId === DEFAULT_SITE_ID) {
    return (
      <LegalPage title={title} seo={seo}>
        {content}
      </LegalPage>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      {seo}
      <div className="section-container max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
          <ArrowLeft size={16} /> Zurück zur Startseite
        </Link>

        {isLoading ? (
          <div className="surface-card-shell rounded-[2rem] border p-12 text-center text-muted-foreground shadow-sm">Laden...</div>
        ) : (
          <div className="surface-card-shell rounded-[2rem] border p-8 shadow-sm md:p-12">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{title}</h1>
            <div className="prose prose-slate prose-theme mt-8 max-w-none text-foreground prose-headings:font-black prose-headings:tracking-tight prose-p:leading-8 prose-img:rounded-[24px]">
              {content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalPageTemplate;
