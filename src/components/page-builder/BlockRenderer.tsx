import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import FAQSection from "@/components/FAQSection";
import TrustSection from "@/components/TrustSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { sanitizeRichHtmlWithoutH1 } from "@/lib/content";
import { getLucideIcon } from "@/lib/lucide-icon-registry";
import { buildRawImageUrl } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { LandingPageBlock } from "@/lib/landing-page-builder";

type BlockRendererProps = {
  blocks: LandingPageBlock[];
  focusedBlockId?: string | null;
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
  <section className={cn("relative py-14 md:py-20", className)}>
    <div className="section-container">
      {(kicker || headline || description) && (
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {kicker ? <p className="section-label mx-auto mb-4">{kicker}</p> : null}
          {headline ? <h2 className="section-title text-center">{headline}</h2> : null}
          {description ? <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[color:var(--theme-text-muted-hex)]">{description}</p> : null}
        </div>
      )}
      {children}
    </div>
  </section>
);

const RichTextBlock = ({ block }: { block: Extract<LandingPageBlock, { type: "rich_text" }> }) => {
  const hasContent = block.data.kicker || block.data.headline || block.data.body_html;

  if (!hasContent) return null;

  return (
    <SectionShell kicker={block.data.kicker} headline={block.data.headline}>
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[color:var(--surface-card-border)] bg-[color:var(--surface-card)] p-8 shadow-[0_30px_70px_-54px_rgba(14,31,83,0.3)] md:p-10">
        {block.data.body_html ? (
          <div
            className="prose prose-slate max-w-none prose-headings:font-[var(--app-font-heading)] prose-headings:text-[color:var(--theme-text-main-hex)] prose-p:text-[color:var(--theme-text-main-hex)] prose-li:text-[color:var(--theme-text-main-hex)]"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtmlWithoutH1(block.data.body_html) }}
          />
        ) : null}
      </div>
    </SectionShell>
  );
};

const FeatureGridBlock = ({ block }: { block: Extract<LandingPageBlock, { type: "feature_grid" }> }) => (
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
            <p className="mt-3 text-sm leading-7 text-[color:var(--theme-text-muted-hex)] md:text-base">{item.text || "Beschreibung folgt."}</p>
          </article>
        );
      })}
    </div>
  </SectionShell>
);

const ImageTextSplitBlock = ({ block }: { block: Extract<LandingPageBlock, { type: "image_text_split" }> }) => {
  const imageSrc = buildRawImageUrl(block.data.image_path);

  return (
    <SectionShell kicker={block.data.kicker} headline={block.data.headline}>
      <div
        className={cn(
          "grid items-center gap-8 lg:grid-cols-[1fr_1fr]",
          block.data.mobile_image_first ? "[&>div:first-child]:order-2 [&>div:last-child]:order-1 lg:[&>div:first-child]:order-none lg:[&>div:last-child]:order-none" : "",
          block.data.image_side === "left" ? "lg:[&>div:first-child]:order-2 lg:[&>div:last-child]:order-1" : "",
        )}
      >
        <div className="premium-card overflow-hidden rounded-[2rem] border border-[color:var(--surface-card-border)] bg-[color:var(--surface-card)] p-4 md:p-5">
          {imageSrc ? (
            <img src={imageSrc} alt={block.data.image_alt || block.data.headline || "Visual"} className="h-full min-h-[260px] w-full rounded-[1.5rem] object-cover" loading="lazy" />
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-[1.5rem] border border-dashed border-[color:var(--surface-card-border)] bg-[color:var(--surface-section)] px-6 text-center text-sm font-medium text-[color:var(--theme-text-muted-hex)]">
              Hier erscheint dein Seitenbild.
            </div>
          )}
        </div>

        <div>
          {block.data.body_html ? (
            <div className="prose prose-slate max-w-none prose-headings:font-[var(--app-font-heading)] prose-headings:text-[color:var(--theme-text-main-hex)] prose-p:text-[color:var(--theme-text-main-hex)] prose-li:text-[color:var(--theme-text-main-hex)]" dangerouslySetInnerHTML={{ __html: sanitizeRichHtmlWithoutH1(block.data.body_html) }} />
          ) : null}

          {block.data.bullets.length > 0 ? (
            <ul className="mt-6 space-y-4">
              {block.data.bullets.map((bullet, index) => (
                <li key={`${bullet}-${index}`} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 text-[#FF4B2C]" size={18} />
                  <span className="text-sm leading-7 text-[color:var(--theme-text-main-hex)] md:text-base">{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {block.data.cta_label ? (
            <a href={block.data.cta_href || "#"} className="btn-primary mt-8 inline-flex w-full justify-center sm:w-auto">
              {block.data.cta_label}
              <ArrowRight size={18} />
            </a>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
};

const CtaBannerBlock = ({ block }: { block: Extract<LandingPageBlock, { type: "cta_banner" }> }) => {
  const imageSrc = buildRawImageUrl(block.data.image_path);
  const toneClass =
    block.data.tone === "dark"
      ? "border-slate-900/10 bg-[linear-gradient(135deg,#0E1F53,#1E2F78)] text-white"
      : block.data.tone === "light"
        ? "border-slate-200 bg-white"
        : "border-[#FF4B2C]/15 bg-[linear-gradient(135deg,#FFF4F1,rgba(255,255,255,0.98))]";

  return (
    <SectionShell className="pt-8">
      <div className={cn("overflow-hidden rounded-[2rem] px-6 py-8 shadow-[0_30px_70px_-54px_rgba(255,75,44,0.28)] md:px-10 md:py-10", toneClass)}>
        <div className={cn("grid items-center gap-8", imageSrc ? "lg:grid-cols-[1.2fr_0.8fr]" : "") }>
          <div>
            {block.data.kicker ? <p className="section-label mb-4">{block.data.kicker}</p> : null}
            {block.data.headline ? <h2 className={cn("text-3xl font-black tracking-tight md:text-4xl", block.data.tone === "dark" ? "text-white" : "text-[color:var(--theme-text-main-hex)]")}>{block.data.headline}</h2> : null}
            {block.data.description ? <p className={cn("mt-4 max-w-2xl text-base leading-8 md:text-lg", block.data.tone === "dark" ? "text-white/85" : "text-[color:var(--theme-text-main-hex)]")}>{block.data.description}</p> : null}
            {block.data.button_label ? (
              <a href={block.data.button_href || "#"} className={cn("mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition sm:w-auto", block.data.tone === "dark" ? "bg-white text-[#0E1F53] hover:bg-white/90" : "btn-primary") }>
                {block.data.button_label}
                <ArrowRight size={18} />
              </a>
            ) : null}
          </div>
          {imageSrc ? (
            <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/10 p-2 backdrop-blur-sm">
              <img src={imageSrc} alt={block.data.image_alt || block.data.headline || "Banner Visual"} className="h-full min-h-[220px] w-full rounded-[1.2rem] object-cover" loading="lazy" />
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
};

const SimpleFaqBlock = ({ block }: { block: Extract<LandingPageBlock, { type: "faq" }> }) => (
  <SectionShell kicker={block.data.kicker} headline={block.data.title} description={block.data.description}>
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

const BlockRenderer = ({ blocks, focusedBlockId = null }: BlockRendererProps) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  const visibleBlocks = focusedBlockId
    ? blocks.filter((block) => block.id === focusedBlockId)
    : blocks;

  if (visibleBlocks.length === 0) return null;

  return (
    <>
      {visibleBlocks.map((block) => {
        switch (block.type) {
          case "hero":
            return <HeroSection key={block.id} overrideData={block.data} />;
          case "trust":
            return <TrustSection key={block.id} overrideData={block.data} />;
          case "faq":
            return block.data.description ? <SimpleFaqBlock key={block.id} block={block} /> : <FAQSection key={block.id} overrideData={block.data} />;
          case "rich_text":
            return <RichTextBlock key={block.id} block={block} />;
          case "feature_grid":
            return <FeatureGridBlock key={block.id} block={block} />;
          case "image_text_split":
            return <ImageTextSplitBlock key={block.id} block={block} />;
          case "cta_banner":
            return <CtaBannerBlock key={block.id} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default BlockRenderer;
