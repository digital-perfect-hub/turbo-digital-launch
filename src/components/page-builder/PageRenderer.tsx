import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { sanitizeRichHtml } from "@/lib/content";
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
  children: React.ReactNode;
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

const HeroBlock = ({ block }: { block: Extract<PageBlock, { type: "hero" }> }) => (
  <section className="relative overflow-hidden pb-14 pt-[158px] md:pb-18 md:pt-[176px]">
    <div className="section-container">
      <div className="premium-card overflow-hidden rounded-[2rem] border border-[color:var(--surface-card-border)] bg-[linear-gradient(135deg,rgba(14,31,83,0.96),rgba(10,16,32,0.94))] px-6 py-10 text-white shadow-[0_40px_110px_-46px_rgba(14,31,83,0.75)] md:px-10 md:py-14">
        <div className="mx-auto max-w-4xl text-center">
          {block.data.badge ? (
            <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
              {block.data.badge}
            </div>
          ) : null}

          <h1 className="text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
            {block.data.headline || "Neue Landingpage"}
          </h1>

          {block.data.subheadline ? (
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">
              {block.data.subheadline}
            </p>
          ) : null}

          {(block.data.primaryCtaLabel || block.data.secondaryCtaLabel) && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {block.data.primaryCtaLabel ? (
                <a href={block.data.primaryCtaHref || "#"} className="btn-primary">
                  {block.data.primaryCtaLabel}
                  <ArrowRight size={18} />
                </a>
              ) : null}

              {block.data.secondaryCtaLabel ? (
                <a
                  href={block.data.secondaryCtaHref || "#"}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/16 bg-white/10 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/14"
                >
                  {block.data.secondaryCtaLabel}
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
);

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
      {block.data.items.map((item, index) => (
        <article key={`${item.title}-${index}`} className="premium-grid-card">
          <div className="premium-number">{String(index + 1).padStart(2, "0")}</div>
          <h3 className="mt-5 text-xl font-bold text-[color:var(--theme-text-main-hex)]">{item.title || "Feature"}</h3>
          <p className="mt-3 text-sm leading-7 text-[color:var(--theme-text-muted-hex)] md:text-base">
            {item.text || "Beschreibung folgt."}
          </p>
        </article>
      ))}
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
          block.data.imageSide === "left" ? "lg:[&>div:first-child]:order-2 lg:[&>div:last-child]:order-1" : ""
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
                  <CheckCircle2 size={20} className="mt-1 shrink-0 text-primary" />
                  <span className="text-sm leading-7 text-[color:var(--theme-text-main-hex)] md:text-base">{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {block.data.ctaLabel ? (
            <div className="mt-8">
              <a href={block.data.ctaHref || "#"} className="btn-primary">
                {block.data.ctaLabel}
                <ArrowRight size={18} />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
};

const CtaBannerBlock = ({ block }: { block: Extract<PageBlock, { type: "cta_banner" }> }) => (
  <section className="pb-18 pt-6 md:pb-22">
    <div className="section-container">
      <div className="rounded-[2rem] border border-[color:var(--surface-card-border)] bg-[linear-gradient(135deg,var(--theme-secondary-hex),color-mix(in_srgb,var(--theme-secondary-hex)_78%,black))] px-6 py-10 text-white shadow-[0_38px_95px_-46px_rgba(14,31,83,0.7)] md:px-10 md:py-14">
        <div className="mx-auto max-w-3xl text-center">
          {block.data.kicker ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">{block.data.kicker}</p> : null}
          {block.data.headline ? <h2 className="mt-4 text-balance text-3xl font-black tracking-[-0.05em] text-white md:text-4xl">{block.data.headline}</h2> : null}
          {block.data.description ? <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/75 md:text-lg">{block.data.description}</p> : null}
          {block.data.buttonLabel ? (
            <div className="mt-8">
              <a href={block.data.buttonHref || "#"} className="btn-primary">
                {block.data.buttonLabel}
                <ArrowRight size={18} />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </section>
);

const FaqBlock = ({ block }: { block: Extract<PageBlock, { type: "faq" }> }) => (
  <SectionShell kicker={block.data.kicker} headline={block.data.headline}>
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-[color:var(--surface-card-border)] bg-[color:var(--surface-card)] p-3 shadow-[0_30px_70px_-54px_rgba(14,31,83,0.28)] md:p-4">
      <Accordion type="single" collapsible className="w-full">
        {block.data.items.map((item, index) => (
          <AccordionItem key={`${item.question}-${index}`} value={`faq-${index}`} className="border-b border-[color:var(--surface-card-border)] px-4">
            <AccordionTrigger className="text-left text-base font-semibold text-[color:var(--theme-text-main-hex)] hover:no-underline">
              {item.question || "Frage"}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-7 text-[color:var(--theme-text-muted-hex)] md:text-base">
              {item.answer || "Antwort folgt."}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </SectionShell>
);

const PageRenderer = ({ blocks }: PageRendererProps) => (
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

export default PageRenderer;
