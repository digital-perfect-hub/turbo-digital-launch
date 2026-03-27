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
    <div className="flex w-full min-w-0 flex-col space-y-4 xl:sticky xl:top-6">
      <div className="w-full min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm xl:p-6">
        <div className="w-full min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Live Preview</p>
          <h3 className="mt-2 truncate text-lg font-extrabold text-slate-900">{sectionLabel}</h3>
          <p className="mt-1 break-words text-sm text-slate-500">
            Kompakte Desktop-Vorschau der aktiven Sektion. Fokus liegt auf Abstand, Typografie, Card-Flächen und Struktur.
          </p>
        </div>
      </div>

      <div className="w-full min-w-0 rounded-[2rem] border border-slate-200 bg-slate-100/70 p-3 shadow-inner xl:p-4">
        <div className="w-full min-w-0 overflow-hidden rounded-[1.85rem] border border-slate-200 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.28)] transition-all duration-300">
          <div className="w-full min-w-0 border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex w-full min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#FF4B2C]/80" />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300" />
              <div className="ml-2 min-w-0 truncate rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Abschnitt · {sectionLabel}
              </div>
            </div>
          </div>

          <div
            className={`homepage-style-scope w-full min-w-0 min-h-[420px] p-5 xl:p-6 ${
              isDarkSection
                ? "dark-section"
                : sectionId === "faq" || sectionId === "services" || sectionId === "portfolio"
                  ? "surface-section-shell"
                  : "surface-page-shell"
            }`}
            style={styleVars}
          >
            {isPanelSection ? (
              <div className="grid w-full min-w-0 gap-4">
                <div className="dark-panel-shell w-full min-w-0 rounded-[1.65rem] p-5">
                  <span className="dark-panel-kicker min-w-0 truncate inline-flex rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]">
                    {preview.badge}
                  </span>
                  <h3 className="dark-panel-title mt-4 w-full min-w-0 break-words text-2xl font-black leading-tight">{preview.title}</h3>
                  <p className="dark-panel-body mt-3 w-full min-w-0 break-words text-sm leading-7">{preview.description}</p>
                  <button className="btn-primary mt-5 w-full truncate sm:w-auto">{preview.ctaText}</button>
                </div>

                <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2">
                  {[1, 2].map((item) => (
                    <div key={item} className="premium-card w-full min-w-0 rounded-[1.35rem] p-4">
                      <div className="mb-3 min-w-0 truncate inline-flex rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Beispiel {item}
                      </div>
                      <h4 className="w-full min-w-0 truncate text-base font-bold text-foreground">Card Titel</h4>
                      <p className="mt-2.5 w-full min-w-0 break-words text-sm leading-6 text-muted-foreground">
                        Abstände, Farben und Flächen wirken hier live genauso wie auf der öffentlichen Seite.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full min-w-0">
                <span className="section-label min-w-0 break-words">{preview.badge}</span>
                <h3 className="section-title mt-4 w-full min-w-0 break-words text-balance">{preview.title}</h3>
                <p className="max-w-3xl w-full min-w-0 break-words text-sm leading-7 text-muted-foreground">{preview.description}</p>

                <div className="mt-7 grid w-full min-w-0 gap-3 sm:grid-cols-2">
                  {[1, 2].map((item) => (
                    <div key={item} className="premium-card w-full min-w-0 rounded-[1.35rem] p-4">
                      <div className="mb-3 min-w-0 truncate inline-flex rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Karte {item}
                      </div>
                      <h4 className="w-full min-w-0 truncate text-base font-bold text-foreground">Live-Farbmuster</h4>
                      <p className="mt-2.5 w-full min-w-0 break-words text-sm leading-6 text-muted-foreground">
                        Titel, Texte, Cards, Borders, Pattern und Button-Logik der aktiven Sektion werden hier simuliert.
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 w-full min-w-0">
                  <button className="btn-primary w-full truncate sm:w-auto">{preview.ctaText}</button>
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