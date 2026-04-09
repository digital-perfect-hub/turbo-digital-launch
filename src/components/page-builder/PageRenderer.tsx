import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import HeroSection from "@/components/HeroSection";
import { sanitizeRichHtml } from "@/lib/content";
import { getLucideIcon } from "@/lib/lucide-icon-registry";
import { cn } from "@/lib/utils";
import { type PageBlock, toPageImageUrl } from "@/lib/page-builder";

type PageRendererProps = {
  blocks: PageBlock[];
};

const SectionShell = ({
  kicker,
  headline,
  description,
  children,
  className,
}: {
  kicker?: string;
  headline?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn("relative py-16 md:py-20", className)}>
    <div className="section-container">
      {(kicker || headline || description) && (
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {kicker ? <p className="section-label mx-auto mb-4">{kicker}</p> : null}
          {headline ? <h2 className="section-title mb-4 text-center">{headline}</h2> : null}
          {description ? <p className="mx-auto max-w-2xl text-base text-[color:var(--theme-text-muted-hex)] md:text-lg">{description}</p> : null}
        </div>
      )}
      {children}
    </div>
  </section>
);

const HeroBlock = ({ block }: { block: Extract<PageBlock, { type: "hero" }> }) => <HeroSection overrideData={block.data} />;

const RichTextBlock = ({ block }: { block: Extract<PageBlock, { type: "rich_text" }> }) => (
  <SectionShell kicker={block.data.kicker} headline={block.data.headline}>
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-[color:var(--surface-card-border)] bg-[color:var(--surface-card)] p-8 shadow-[0_30px_70px_-54px_rgba(14,31,83,0.3)] md:p-10">
      <div
        className="prose prose-slate max-w-none prose-headings:font-[var(--app-font-heading)] prose-headings:text-[color:var(--theme-text-main-hex)] prose-p:text-[color:var(--theme-text-main-hex)] prose-li:text-[color:var(--theme-text-main-hex)]"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(block.data.bodyHtml || "") }}
      />
    </div>
  </SectionShell>
);

const FeatureGridBlock = ({ block }: { block: Extract<PageBlock, { type: "feature_grid" }> }) => (
  <SectionShell kicker={block.data.kicker} headline={block.data.headline} description={block.data.description}>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {block.data.items.map((item, index) => {
        const Icon = getLucideIcon(item.iconKey);
        return (
          <article key={`${item.title}-${index}`} className="premium-grid-card">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF4B2C]/10 text-[#FF4B2C]">
                <Icon size={20} />
              </div>
              <div className="premium-number">{String(index + 1).padStart(2, "0")}</div>
            </div>
            <h3 className="mt-5 text-xl font-bold text-[color:var(--theme-text-main-hex)]">{item.title || "Feature"}</h3>
            <p className="mt-3 text-sm leading-7 text-[color:var(--theme-text-muted-hex)] md:text-base">
              {item.text || "Beschreibung folgt."}
            </p>
          </article>
        );
      })}
    </div>
  </SectionShell>
);

const ImageTextSplitBlock = ({ block }: { block: Extract<PageBlock, { type: "image_text_split" }> }) => {
  const imageSrc = toPageImageUrl(block.data.imagePath, { width: 960, quality: 82 });

  return (
    <SectionShell kicker={block.data.kicker} headline={block.data.headline}>
      <div
        className={cn(
          "grid items-center gap-10 lg:grid-cols-[1fr_1fr]",
          block.data.imageSide === "left" ? "lg:[&>div:first-child]:order-2 lg:[&>div:last-child]:order-1" : "",
        )}
      >
        <div className="premium-card overflow-hidden rounded-[2rem] border border-[color:var(--surface-card-border)] bg-[color:var(--surface-card)] p-4 md:p-5">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={block.data.imageAlt || block.data.headline || "Page Visual"}
              className="h-full min-h-[280px] w-full rounded-[1.5rem] object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-[1.5rem] border border-dashed border-[color:var(--surface-card-border)] bg-[color:var(--surface-section)] px-6 text-center text-sm font-medium text-[color:var(--theme-text-muted-hex)]">
              Hier erscheint dein Builder-Bild über die Render-API.
            </div>
          )}
        </div>

        <div>
          {block.data.body ? (
            <p className="text-base leading-8 text-[color:var(--theme-text-main-hex)] md:text-lg">{block.data.body}</p>
          ) : null}

          {block.data.bullets.length > 0 && (
            <ul className="mt-6 space-y-4">
              {block.data.bullets.map((bullet, index) => (
                <li key={`${bullet}-${index}`} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 text-[#FF4B2C]" size={18} />
                  <span className="text-sm leading-7 text-[color:var(--theme-text-main-hex)] md:text-base">{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {block.data.ctaLabel ? (
            <a href={block.data.ctaHref || "#"} className="btn-primary mt-8 inline-flex">
              {block.data.ctaLabel}
              <ArrowRight size={18} />
            </a>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
};

const CtaBannerBlock = ({ block }: { block: Extract<PageBlock, { type: "cta_banner" }> }) => (
  <SectionShell className="pt-10">
    <div className="overflow-hidden rounded-[2rem] border border-[#FF4B2C]/15 bg-[linear-gradient(135deg,#FFF4F1,rgba(255,255,255,0.98))] px-6 py-10 shadow-[0_30px_70px_-54px_rgba(255,75,44,0.35)] md:px-10 md:py-12">
      <div className="mx-auto max-w-3xl text-center">
        {block.data.kicker ? <p className="section-label mx-auto mb-4">{block.data.kicker}</p> : null}
        {block.data.headline ? <h2 className="section-title text-center">{block.data.headline}</h2> : null}
        {block.data.description ? <p className="mx-auto mt-4 max-w-2xl text-base text-[color:var(--theme-text-main-hex)] md:text-lg">{block.data.description}</p> : null}
        {block.data.buttonLabel ? (
          <a href={block.data.buttonHref || "#"} className="btn-primary mt-8 inline-flex">
            {block.data.buttonLabel}
            <ArrowRight size={18} />
          </a>
        ) : null}
      </div>
    </div>
  </SectionShell>
);

const FaqBlock = ({ block }: { block: Extract<PageBlock, { type: "faq" }> }) => (
  <SectionShell kicker={block.data.kicker} headline={block.data.headline}>
    <Accordion type="single" collapsible className="mx-auto max-w-3xl rounded-[2rem] border border-[color:var(--surface-card-border)] bg-[color:var(--surface-card)] p-4 shadow-[0_30px_70px_-54px_rgba(14,31,83,0.3)] md:p-6">
      {block.data.items.map((item, index) => (
        <AccordionItem value={`${block.id}-faq-${index}`} key={`${block.id}-faq-${index}`}>
          <AccordionTrigger className="text-left font-semibold text-[color:var(--theme-text-main-hex)]">{item.question || "Frage"}</AccordionTrigger>
          <AccordionContent className="text-sm leading-7 text-[color:var(--theme-text-muted-hex)] md:text-base">{item.answer || "Antwort folgt."}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </SectionShell>
);

const PageRenderer = ({ blocks }: PageRendererProps) => {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case "hero":
            return <HeroBlock key={block.id} block={block} />;
          case "rich_text":
            return <RichTextBlock key={block.id} block={block} />;
          case "feature_grid":
            return <FeatureGridBlock key={block.id} block={block} />;
          case "image_text_split":
            return <ImageTextSplitBlock key={block.id} block={block} />;
          case "cta_banner":
            return <CtaBannerBlock key={block.id} block={block} />;
          case "faq":
            return <FaqBlock key={block.id} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default PageRenderer;
