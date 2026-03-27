import { RotateCcw, Sparkles, Grid2x2, Orbit, Stars, Binary, Network, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createDefaultHomepageSectionStyle,
  type HomepageSectionPatternType,
  type HomepageSectionStyle,
} from "@/lib/homepage-section-styles";

type SectionStyleEditorProps = {
  value: HomepageSectionStyle;
  onChange: (nextValue: HomepageSectionStyle) => void;
};

const colorFields: Array<{ key: keyof HomepageSectionStyle; label: string; description: string }> = [
  { key: "background_color", label: "Section Hintergrund", description: "Grundfläche der gesamten Sektion." },
  { key: "title_color", label: "Section Titel", description: "Nur der Haupttitel der Sektion, nicht die Card-Titel." },
  { key: "text_color", label: "Section Text", description: "Normale Lauftexte und Haupttext der Sektion." },
  { key: "muted_color", label: "Section Muted", description: "Beschreibungen, Meta-Texte und Subcopy der Sektion." },
  { key: "badge_background_color", label: "Badge Hintergrund", description: "Eyebrows, Pills und Kicker-Flächen." },
  { key: "badge_text_color", label: "Badge Text", description: "Text innerhalb von Pills / Eyebrows." },
  { key: "card_background_color", label: "Card Hintergrund", description: "Karten, Boxen und Feature-Kacheln." },
  { key: "card_border_color", label: "Card Border", description: "Rahmen und Divider der Kacheln." },
  { key: "card_title_color", label: "Card Titel", description: "Headlines innerhalb von Cards." },
  { key: "card_text_color", label: "Card Text", description: "Normale Texte innerhalb von Kacheln." },
  { key: "button_background_color", label: "Button Hintergrund", description: "Primäre Call-to-Action Buttons." },
  { key: "button_text_color", label: "Button Text", description: "Textfarbe der primären Buttons." },
];

const patterns: Array<{ value: HomepageSectionPatternType; label: string; description: string; icon: React.ElementType }> = [
  { value: "none", label: "Ohne", description: "Kein Hintergrund-Pattern. Rein minimalistische Farbfläche.", icon: CircleDot },
  { value: "dots", label: "Dots", description: "Minimalistisches Punktemuster, klassisch für SaaS.", icon: Grid2x2 },
  { value: "grid", label: "Grid", description: "Technisches Raster. Ideal für Entwickler-Sektionen.", icon: Binary },
  { value: "stars", label: "Stars", description: "Dezenter Sternenhimmel, passend für Hero-Bereiche.", icon: Stars },
  { value: "network", label: "Network", description: "Abstraktes Linien-Netzwerk. Steht für Technologie.", icon: Network },
  { value: "orbits", label: "Orbits", description: "Leichte Umlaufbahnen mit reduziertem High-Tech-Charakter.", icon: Orbit },
  { value: "code", label: "Code", description: "Subtile Binary-Patterns im Hintergrund.", icon: Binary },
];

const normalizeHex = (hex: string) => {
  if (!hex) return "";
  if (!hex.startsWith("#")) hex = "#" + hex;
  return hex.toUpperCase();
};

const ColorField = ({ label, description, value, onChange }: { label: string; description: string; value: string; onChange: (val: string) => void }) => {
  return (
    <div className="flex w-full min-w-0 flex-col justify-between rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
      <div className="mb-3 w-full min-w-0">
        <Label className="block truncate text-sm font-bold text-slate-900">{label}</Label>
        <p className="mt-1 break-words text-xs leading-relaxed text-slate-500 line-clamp-2">{description}</p>
      </div>

      <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3">
        <input
          type="color"
          value={/^#([0-9A-F]{3}){1,2}$/i.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-10 w-10 sm:w-12 shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 transition-all"
        />
        <Input
          value={value}
          placeholder="Vererbt..."
          className="h-10 min-w-0 flex-1 rounded-xl border-slate-200 text-sm uppercase"
          onChange={(event) => onChange(normalizeHex(event.target.value))}
        />
        <Button type="button" variant="outline" className="h-10 shrink-0 rounded-xl border-slate-200 px-3 text-xs" onClick={() => onChange("")}>
          <RotateCcw size={14} />
        </Button>
      </div>
    </div>
  );
};

const SectionStyleEditor = ({ value, onChange }: SectionStyleEditorProps) => {
  const update = (key: keyof HomepageSectionStyle, val: any) => onChange({ ...value, [key]: val });
  const reset = () => onChange(createDefaultHomepageSectionStyle());

  return (
    <div className="flex w-full min-w-0 flex-col space-y-6">
      {/* Header Panel */}
      <div className="flex w-full min-w-0 flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-indigo-500/15 bg-indigo-500/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 shadow-sm">
            <Sparkles size={14} className="shrink-0" /> <span className="truncate">Design & Layout</span>
          </div>
          <h2 className="mt-4 truncate text-xl font-extrabold tracking-[-0.03em] text-slate-900">Sektions-Theme</h2>
          <p className="mt-1 break-words text-sm text-slate-500">Überschreibe hier die globalen Brand-Farben für diesen spezifischen Block, um Highlights zu erzeugen.</p>
        </div>
        <div className="flex shrink-0 items-center">
          <Button variant="outline" className="w-full shrink-0 rounded-xl border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 sm:w-auto" onClick={reset}>
            <RotateCcw size={16} className="mr-2 shrink-0" /> Zurücksetzen
          </Button>
        </div>
      </div>

      {/* Pattern Selector */}
      <div className="w-full min-w-0 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 w-full min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-900">Hintergrund-Pattern</h3>
          <p className="mt-1 break-words text-sm text-slate-500">Lege eine Textur oder ein Muster über den Sektions-Hintergrund.</p>
        </div>

        <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {patterns.map((pattern) => {
            const Icon = pattern.icon;
            const isActive = value.pattern === pattern.value;

            return (
              <button
                key={pattern.value}
                onClick={() => update("pattern", pattern.value)}
                className={`flex w-full min-w-0 flex-col items-start gap-3 rounded-[1.25rem] border p-4 text-left transition-all ${
                  isActive ? "border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600" : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <Icon size={18} />
                </div>
                <div className="w-full min-w-0">
                  <div className="truncate font-bold text-slate-900">{pattern.label}</div>
                  <div className="mt-1 break-words text-xs text-slate-500 line-clamp-2">{pattern.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className={`mt-6 w-full min-w-0 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 ${value.pattern === "none" ? "pointer-events-none opacity-50" : ""}`}>
          <div className="flex w-full min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <Label className="block truncate text-sm font-bold text-slate-900">Pattern Akzentfarbe</Label>
              <p className="mt-1 break-words text-xs text-slate-500 line-clamp-2">Nutze Hex-Codes mit Alpha-Kanal (z.B. #FFFFFF20), um die Transparenz zu steuern.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <input
                type="color"
                value={/^#([0-9A-F]{3}|[0-9A-F]{6})$/.test(value.pattern_accent_color) ? value.pattern_accent_color : "#0E1F53"}
                onChange={(event) => update("pattern_accent_color", event.target.value.toUpperCase())}
                className="h-12 w-10 sm:w-14 shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
              />
              <Input
                value={value.pattern_accent_color}
                placeholder="#0E1F53"
                className="h-12 w-28 sm:w-32 min-w-0 flex-1 rounded-xl border-slate-200 uppercase"
                onChange={(event) => update("pattern_accent_color", normalizeHex(event.target.value).toUpperCase())}
              />
              <Button type="button" variant="outline" className="h-12 shrink-0 rounded-xl border-slate-200 px-3 sm:px-4" onClick={() => update("pattern_accent_color", "")}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Colors Grid */}
      <div className={`grid w-full min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${(value as any).inherit_theme ? "pointer-events-none opacity-55" : ""}`}>
        {colorFields.map((field) => (
          <ColorField key={field.key} label={field.label} description={field.description} value={value[field.key] as string} onChange={(nextValue) => update(field.key, nextValue)} />
        ))}
      </div>
    </div>
  );
};

export default SectionStyleEditor;