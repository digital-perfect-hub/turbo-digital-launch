import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HomepageSectionStyle } from "@/lib/homepage-section-styles";

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

const normalizeHex = (value: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};

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

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={safeColor}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-12 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
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
  const update = (key: keyof HomepageSectionStyle, nextValue: string | boolean) => {
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
            <h3 className="mt-3 text-lg font-extrabold text-slate-900">Sektion separat einfärben</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Standardmäßig erbt die Sektion das globale Theme. Aktiviere den Override nur dort, wo du bewusst abweichende Farben willst.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              <input
                type="checkbox"
                checked={!value.inherit_theme}
                onChange={(event) => update("inherit_theme", !event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#FF4B2C] focus:ring-[#FF4B2C]"
              />
              Eigene Farben aktivieren
            </label>

            <Button type="button" variant="outline" className="rounded-full border-slate-200" onClick={resetAll}>
              <RotateCcw size={15} className="mr-2" />
              Alles zurücksetzen
            </Button>
          </div>
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
