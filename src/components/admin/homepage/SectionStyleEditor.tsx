import { CircleDot, Code2, Orbit, RotateCcw, Sparkles, Stars, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HomepageSectionPatternType, HomepageSectionStyle } from "@/lib/homepage-section-styles";

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
  { key: "card_title_color", label: "Card Titel", description: "Headlines innerhalb von Cards und Step-Boxen." },
  { key: "card_text_color", label: "Card Text", description: "Primärer Text in Cards, z. B. Labels oder Preis-Texte." },
  { key: "card_muted_color", label: "Card Muted", description: "Sekundäre Texte in Cards." },
  { key: "panel_background_color", label: "Dark Panel Hintergrund", description: "Intro/Why-Choose/Kontakt Dark Panels." },
  { key: "panel_title_color", label: "Dark Panel Titel", description: "Headlines im Dark Panel." },
  { key: "panel_text_color", label: "Dark Panel Text", description: "Lauftext im Dark Panel." },
  { key: "button_background_color", label: "Button Hintergrund", description: "Primäre CTA-Buttons der Sektion." },
  { key: "button_text_color", label: "Button Text", description: "Textfarbe der CTA-Buttons." },
  { key: "accent_color", label: "Accent", description: "Icons, Links und starke Highlights." },
];

const patternOptions: Array<{
  value: HomepageSectionPatternType;
  label: string;
  description: string;
  icon: typeof CircleDot;
}> = [
  { value: "none", label: "Keine", description: "Nur Farbe und Inhalt, komplett clean.", icon: CircleDot },
  { value: "dots", label: "Punkte", description: "Feiner Premium-Dot-Layer für leere Flächen.", icon: CircleDot },
  { value: "stars", label: "Sterne", description: "Subtile Sternpunkte für hochwertige Tiefe.", icon: Stars },
  { value: "constellation", label: "Konstellation", description: "Punkte mit feinen Verbindungen, modern-tech.", icon: Waypoints },
  { value: "orbits", label: "Orbits", description: "Feine Kreisbahnen und Fokus-Punkte, elegant.", icon: Orbit },
  { value: "code", label: "Code", description: "Ruhige Code-/Rasterstruktur für Tech-Flächen.", icon: Code2 },
];

const normalizeHex = (value: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};

const safePatternIntensity = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const ColorField = ({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const safeColor = /^#([0-9a-fA-F]{6})$/.test(value) ? value : "#0E1F53";

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <Label className="text-sm font-bold text-slate-900">{label}</Label>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="color"
          value={safeColor}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-1 sm:w-16"
        />

        <Input
          value={value}
          placeholder="#0E1F53"
          className="h-12 rounded-xl border-slate-200"
          onChange={(event) => onChange(normalizeHex(event.target.value).toUpperCase())}
        />

        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl border-slate-200 px-4"
          onClick={() => onChange("")}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

const SectionStyleEditor = ({ value, onChange }: SectionStyleEditorProps) => {
  const update = (key: keyof HomepageSectionStyle, nextValue: string | boolean | number) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  const resetAll = () => {
    onChange({
      inherit_theme: true,
      background_color: "",
      title_color: "",
      text_color: "",
      muted_color: "",
      badge_background_color: "",
      badge_text_color: "",
      card_background_color: "",
      card_border_color: "",
      card_title_color: "",
      card_text_color: "",
      card_muted_color: "",
      panel_background_color: "",
      panel_title_color: "",
      panel_text_color: "",
      button_background_color: "",
      button_text_color: "",
      accent_color: "",
      pattern_type: "none",
      pattern_intensity: 18,
      pattern_accent_color: "",
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4B2C]">
              <Sparkles size={12} />
              Design Override
            </div>
            <h3 className="mt-3 text-lg font-extrabold text-slate-900">Sektion hochwertig veredeln</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Muster funktionieren auch dann, wenn die Sektion das globale Theme erbt. Farb-Overrides schaltest du nur dort ein, wo die Sektion bewusst aus dem Theme ausbrechen soll.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" className="rounded-full border-slate-200" onClick={resetAll}>
              <RotateCcw size={15} className="mr-2" />
              Alles zurücksetzen
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Flächenstruktur</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Setze nur dort Struktur ein, wo die Fläche aktuell zu leer wirkt. So bleibt die Seite hochwertig, technisch und nicht überladen.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            <span className="font-bold text-slate-900">Aktiv:</span>{" "}
            {patternOptions.find((option) => option.value === value.pattern_type)?.label || "Keine"}
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {patternOptions.map((option) => {
            const Icon = option.icon;
            const active = value.pattern_type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => update("pattern_type", option.value)}
                className={`rounded-[1.5rem] border p-4 text-left transition-all ${
                  active
                    ? "border-[#FF4B2C] bg-[#FF4B2C]/6 shadow-[0_18px_40px_-24px_rgba(255,75,44,0.35)]"
                    : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${active ? "bg-[#FF4B2C] text-white" : "bg-[#0E1F53]/8 text-[#0E1F53]"}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${active ? "text-[#FF4B2C]" : "text-slate-900"}`}>{option.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-bold text-slate-900">Intensität</Label>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Niedrig halten. Die Struktur soll unterstützen, nicht dominieren.
                </p>
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-bold text-slate-700">
                {safePatternIntensity(value.pattern_intensity || 0)} %
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={safePatternIntensity(value.pattern_intensity || 0)}
              onChange={(event) => update("pattern_intensity", Number(event.target.value))}
              className="mt-5 h-2 w-full cursor-pointer accent-[#FF4B2C]"
            />
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
            <div className="mb-3">
              <Label className="text-sm font-bold text-slate-900">Pattern Accent</Label>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Leer = globale Accent-Farbe. Ideal für Punkte, Sterne und Tech-Linien.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="color"
                value={/^#([0-9a-fA-F]{6})$/.test(value.pattern_accent_color || "") ? value.pattern_accent_color : "#0E1F53"}
                onChange={(event) => update("pattern_accent_color", event.target.value.toUpperCase())}
                className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-1 sm:w-16"
              />
              <Input
                value={value.pattern_accent_color || ""}
                placeholder="Global Accent"
                className="h-12 rounded-xl border-slate-200"
                onChange={(event) => update("pattern_accent_color", normalizeHex(event.target.value).toUpperCase())}
              />
              <Button type="button" variant="outline" className="h-12 rounded-xl border-slate-200 px-4" onClick={() => update("pattern_accent_color", "")}>Reset</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Farben separat überschreiben</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Standardmäßig erbt die Sektion das globale Theme. Aktiviere den Override nur dort, wo du bewusst abweichende Farben willst.
            </p>
          </div>

          <label className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            <input
              type="checkbox"
              checked={!value.inherit_theme}
              onChange={(event) => update("inherit_theme", !event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#FF4B2C] focus:ring-[#FF4B2C]"
            />
            Eigene Farben aktivieren
          </label>
        </div>
      </div>

      <div className={value.inherit_theme ? "pointer-events-none opacity-55" : ""}>
        <div className="grid gap-4 xl:grid-cols-2">
          {colorFields.map((field) => (
            <ColorField
              key={field.key}
              label={field.label}
              description={field.description}
              value={value[field.key] as string}
              onChange={(nextValue) => update(field.key, nextValue)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionStyleEditor;
