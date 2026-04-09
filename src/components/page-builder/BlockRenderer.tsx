import HeroSection from "@/components/HeroSection";
import FAQSection from "@/components/FAQSection";
import TrustSection from "@/components/TrustSection";
import { sanitizeRichHtml } from "@/lib/content";
import type { LandingPageBlock } from "@/lib/landing-page-builder";

type BlockRendererProps = {
  blocks: LandingPageBlock[];
};

const RichTextBlock = ({ block }: { block: Extract<LandingPageBlock, { type: "rich_text" }> }) => {
  const hasContent = block.data.kicker || block.data.headline || block.data.body_html;

  if (!hasContent) {
    return null;
  }

  return (
    <section className="relative py-16 md:py-20">
      <div className="section-container">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[color:var(--surface-card-border)] bg-[color:var(--surface-card)] p-8 shadow-[0_30px_70px_-54px_rgba(14,31,83,0.3)] md:p-10">
          {block.data.kicker ? <p className="section-label">{block.data.kicker}</p> : null}
          {block.data.headline ? (
            <h2 className="mt-4 text-3xl font-black tracking-tight text-[color:var(--theme-text-main-hex)] md:text-4xl">
              {block.data.headline}
            </h2>
          ) : null}

          {block.data.body_html ? (
            <div
              className="prose prose-slate mt-6 max-w-none prose-headings:font-[var(--app-font-heading)] prose-headings:text-[color:var(--theme-text-main-hex)] prose-p:text-[color:var(--theme-text-main-hex)] prose-li:text-[color:var(--theme-text-main-hex)]"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(block.data.body_html) }}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
};

const BlockRenderer = ({ blocks }: BlockRendererProps) => {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case "hero":
            return <HeroSection key={block.id} overrideData={block.data} />;

          case "trust":
            return <TrustSection key={block.id} overrideData={block.data} />;

          case "faq":
            return <FAQSection key={block.id} overrideData={block.data} />;

          case "rich_text":
            return <RichTextBlock key={block.id} block={block} />;

          default:
            return null;
        }
      })}
    </>
  );
};

export default BlockRenderer;
