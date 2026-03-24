import type { CSSProperties } from "react";
import type { HomepageSectionId } from "@/lib/homepage-section-styles";

export type SectionPreviewPayload = {
  badge: string;
  title: string;
  description: string;
  ctaText: string;
};

type SectionPreviewPanelProps = {
  sectionId: HomepageSectionId;
  sectionLabel: string;
  preview: SectionPreviewPayload;
  styleVars: CSSProperties;
};

const panelSections = new Set<HomepageSectionId>(["intro", "why-choose", "contact"]);
const darkSections = new Set<HomepageSectionId>(["process"]);

const SectionPreviewPanel = ({ sectionId, sectionLabel, preview, styleVars }: SectionPreviewPanelProps) => {
  const isPanelSection = panelSections.has(sectionId);
  const isDarkSection = darkSections.has(sectionId);

  return (
    <div className="sticky top-8 space-y-4">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Live Preview</p>
          <h3 className="mt-2 text-lg font-extrabold text-slate-900">{sectionLabel}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Änderungen werden hier sofort sichtbar. Speichern ist erst für Live-Seite nötig.
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4 shadow-inner">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.28)] transition-all duration-300">
          <div
            className={`homepage-style-scope p-6 md:p-8 ${
              isDarkSection
                ? "dark-section"
                : sectionId === "faq" || sectionId === "services" || sectionId === "portfolio"
                  ? "surface-section-shell"
                  : "surface-page-shell"
            }`}
            style={styleVars}
          >
            {isPanelSection ? (
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="dark-panel-shell rounded-[1.75rem] p-6">
                  <span className="dark-panel-kicker inline-flex rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]">
                    {preview.badge}
                  </span>
                  <h3 className="dark-panel-title mt-5 text-3xl font-black leading-tight">{preview.title}</h3>
                  <p className="dark-panel-body mt-4 text-base leading-7">{preview.description}</p>
                  <button className="btn-primary mt-6">{preview.ctaText}</button>
                </div>

                <div className="grid gap-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="premium-card rounded-[1.5rem] p-5">
                      <div className="mb-3 inline-flex rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Beispiel {item}
                      </div>
                      <h4 className="text-xl font-bold text-foreground">Card Titel</h4>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        So sehen Karten, Trust-Boxen oder Benefits in dieser Sektion live aus.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <span className="section-label">{preview.badge}</span>
                <h3 className="section-title mt-4">{preview.title}</h3>
                <p className="max-w-3xl text-base leading-8 text-muted-foreground">{preview.description}</p>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {[1, 2].map((item) => (
                    <div key={item} className="premium-card rounded-[1.5rem] p-5">
                      <div className="mb-4 inline-flex rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Karte {item}
                      </div>
                      <h4 className="text-lg font-bold text-foreground">Live-Farbmuster</h4>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        Titel, Texte, Cards, Borders und Buttons der aktiven Sektion werden hier direkt simuliert.
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button className="btn-primary">{preview.ctaText}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionPreviewPanel;
