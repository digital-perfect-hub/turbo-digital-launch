import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { sanitizeRichHtml, stripHtmlToText } from "@/lib/content";
import { type LegalPageSlug, useLegalPage } from "@/hooks/useLegalPages";

type LegalPageTemplateProps = {
  slug: LegalPageSlug;
};

const LegalPageTemplate = ({ slug }: LegalPageTemplateProps) => {
  const { page, isLoading } = useLegalPage(slug);
  const sanitizedBody = sanitizeRichHtml(page.body || "");
  const metaDescription = (page.seo_description || stripHtmlToText(page.body || "")).slice(0, 155);

  return (
    <div className="min-h-screen bg-background py-20">
      <SEO title={page.seo_title || page.title} description={metaDescription} noIndex={!page.is_published} />
      <div className="section-container max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
          <ArrowLeft size={16} /> Zurück zur Startseite
        </Link>

        {isLoading ? (
          <div className="surface-card-shell rounded-[2rem] border p-12 text-center text-muted-foreground shadow-sm">Laden...</div>
        ) : (
          <div className="surface-card-shell rounded-[2rem] border p-8 shadow-sm md:p-12">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{page.title}</h1>
            <div
              className="prose prose-slate prose-theme mt-8 max-w-none text-foreground prose-headings:font-black prose-headings:tracking-tight prose-p:leading-8 prose-img:rounded-[24px]"
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalPageTemplate;
