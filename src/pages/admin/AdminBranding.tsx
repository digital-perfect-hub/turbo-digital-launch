import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Palette, Type, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import MediaDropzone from "@/components/admin/media/MediaDropzone";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { buildStrictRenderImageUrl } from "@/lib/image";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { uploadBrandingAsset } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { upsertSiteSetting } from "@/lib/site-settings";
import { createDefaultLoadingScreenConfig, parseLoadingScreenConfig, serializeLoadingScreenConfig, type LoadingScreenConfig } from "@/lib/site-ui-config";

const GLOBAL_SETTINGS_EDITABLE_COLUMNS = [
  "primary_color_hex", "secondary_color_hex", "accent_color_hex",
  "bg_main_hex", "bg_card_hex", "text_main_hex", "text_muted_hex",
  "border_color_hex", "border_radius",
  "font_family", "company_name", "logo_path", "use_text_logo",
  "text_logo_color_hex", "show_logo_dot", "logo_dot_color_hex", "logo_font_family", "cta_hover_hex", "footer_bg_hex",
  "imprint_company", "imprint_address", "imprint_contact", "imprint_legal",
  "loader_heading", "loader_subtext", "loader_bg_hex", "loader_text_hex", "button_theme"
] as const;

type ThemePresetColors = {
  primary_color_hex: string;
  secondary_color_hex: string;
  accent_color_hex: string;
  bg_main_hex: string;
  bg_card_hex: string;
  text_main_hex: string;
  text_muted_hex: string;
  border_color_hex: string;
  cta_hover_hex: string;
  footer_bg_hex: string;
};

type ThemePreset = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  colors: ThemePresetColors;
  swatches: string[];
};

const THEME_PRESET_KEYS: (keyof ThemePresetColors)[] = [
  "primary_color_hex",
  "secondary_color_hex",
  "accent_color_hex",
  "bg_main_hex",
  "bg_card_hex",
  "text_main_hex",
  "text_muted_hex",
  "border_color_hex",
  "cta_hover_hex",
  "footer_bg_hex",
];

const THEME_PRESETS: ThemePreset[] = [
  {
    id: "high-contrast-tech",
    title: "High-Contrast Tech",
    subtitle: "Kreativ / IT",
    description: "Dunkel, kontraststark, markant und conversion-stabil im Brand-Look.",
    colors: {
      primary_color_hex: "#FF6B2C",
      secondary_color_hex: "#0E1F53",
      accent_color_hex: "#FF6B2C",
      bg_main_hex: "#0B1020",
      bg_card_hex: "#11172A",
      text_main_hex: "#F8FAFC",
      text_muted_hex: "#A5B4C7",
      border_color_hex: "#23314F",
      cta_hover_hex: "#FF4D00",
      footer_bg_hex: "#070B16",
    },
    swatches: ["#FF6B2C", "#0E1F53", "#0B1020", "#11172A", "#F8FAFC", "#23314F"],
  },
  {
    id: "blueprint",
    title: "Blueprint",
    subtitle: "Tech / B2B",
    description: "Vertrauen, Technik, klare Conversion-Führung.",
    colors: {
      primary_color_hex: "#FF6B2C",
      secondary_color_hex: "#0E1F53",
      accent_color_hex: "#FF8A4C",
      bg_main_hex: "#F7F9FC",
      bg_card_hex: "#FFFFFF",
      text_main_hex: "#0F172A",
      text_muted_hex: "#64748B",
      border_color_hex: "#D9E2F1",
      cta_hover_hex: "#E55A1F",
      footer_bg_hex: "#0A163D",
    },
    swatches: ["#FF6B2C", "#0E1F53", "#FF8A4C", "#F7F9FC", "#0F172A", "#D9E2F1"],
  },
  {
    id: "eco-trust",
    title: "Eco Trust",
    subtitle: "Nachhaltigkeit / Gesundheit",
    description: "Natürlich, ruhig, glaubwürdig und professionell.",
    colors: {
      primary_color_hex: "#2F7D32",
      secondary_color_hex: "#A7E8BD",
      accent_color_hex: "#56B870",
      bg_main_hex: "#F6FBF7",
      bg_card_hex: "#FFFFFF",
      text_main_hex: "#16351D",
      text_muted_hex: "#5F7A66",
      border_color_hex: "#D6E9DA",
      cta_hover_hex: "#276A2A",
      footer_bg_hex: "#16351D",
    },
    swatches: ["#2F7D32", "#A7E8BD", "#56B870", "#F6FBF7", "#16351D", "#D6E9DA"],
  },
  {
    id: "corporate-minimalist",
    title: "Corporate Minimalist",
    subtitle: "Kanzleien / Premium",
    description: "Seriös, hochwertig, minimal und teuer wirkend.",
    colors: {
      primary_color_hex: "#111111",
      secondary_color_hex: "#BFC5CE",
      accent_color_hex: "#E5E7EB",
      bg_main_hex: "#F8F9FB",
      bg_card_hex: "#FFFFFF",
      text_main_hex: "#111111",
      text_muted_hex: "#6B7280",
      border_color_hex: "#D9DDE3",
      cta_hover_hex: "#2A2A2A",
      footer_bg_hex: "#111111",
    },
    swatches: ["#111111", "#BFC5CE", "#E5E7EB", "#F8F9FB", "#FFFFFF", "#6B7280"],
  },
  {
    id: "warm-elegance",
    title: "Warm Elegance",
    subtitle: "Coaches / Beauty",
    description: "Warm, edel, zugänglich und stilvoll weich.",
    colors: {
      primary_color_hex: "#C96F4A",
      secondary_color_hex: "#E9D8C3",
      accent_color_hex: "#D98A67",
      bg_main_hex: "#FCF8F3",
      bg_card_hex: "#FFFDF9",
      text_main_hex: "#4A2F24",
      text_muted_hex: "#8B6F63",
      border_color_hex: "#EADCCF",
      cta_hover_hex: "#B85D39",
      footer_bg_hex: "#6C4638",
    },
    swatches: ["#C96F4A", "#E9D8C3", "#D98A67", "#FCF8F3", "#4A2F24", "#EADCCF"],
  },
];

const toUpperHex = (value?: string | null) => (value || "").trim().toUpperCase();

const getReadableButtonText = (hex?: string | null) => {
  const safe = (hex || "").trim();
  const fallback = "#FFFFFF";
  if (!/^#([0-9a-fA-F]{6})$/.test(safe)) return fallback;
  const r = parseInt(safe.slice(1, 3), 16);
  const g = parseInt(safe.slice(3, 5), 16);
  const b = parseInt(safe.slice(5, 7), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? "#0F172A" : "#FFFFFF";
};

const loadingFontFamilyClassMap = {
  default: "font-sans",
  sans: "font-sans",
  display: "font-display",
  serif: "font-serif",
  mono: "font-mono",
} as const;

const loadingHeadingSizeClassMap = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
} as const;

const loadingSubtextSizeClassMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
} as const;

const loadingFontOptions: Array<{ value: LoadingScreenConfig["heading_font_family"]; label: string }> = [
  { value: "default", label: "Default" },
  { value: "sans", label: "Sans" },
  { value: "display", label: "Display" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

const loadingSizeOptions: Array<{ value: LoadingScreenConfig["heading_size"]; label: string }> = [
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
  { value: "xl", label: "XL" },
];

const AdminBranding = () => {
  const queryClient = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { settings, isLoading } = useGlobalTheme();
  const { settings: siteSettings } = useSiteSettings();
  const [form, setForm] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!settings) return;

    const baseLoadingConfig = parseLoadingScreenConfig(siteSettings.loading_screen_config || createDefaultLoadingScreenConfig());
    const mergedLoadingConfig = parseLoadingScreenConfig({
      ...baseLoadingConfig,
      heading: settings.loader_heading || baseLoadingConfig.heading,
      subtext: settings.loader_subtext || baseLoadingConfig.subtext,
      background_color: settings.loader_bg_hex || baseLoadingConfig.background_color,
      text_color: settings.loader_text_hex || baseLoadingConfig.text_color,
    });

    setForm({
      ...settings,
      loading_screen_config: mergedLoadingConfig,
      loader_heading: mergedLoadingConfig.heading,
      loader_subtext: mergedLoadingConfig.subtext,
      loader_bg_hex: mergedLoadingConfig.background_color,
      loader_text_hex: mergedLoadingConfig.text_color,
      button_theme: {
        primary_background_color: settings.button_theme?.primary_background_color || settings.primary_color_hex || "#FF4B2C",
        primary_text_color: settings.button_theme?.primary_text_color || getReadableButtonText(settings.button_theme?.primary_background_color || settings.primary_color_hex || "#FF4B2C"),
        secondary_background_color: settings.button_theme?.secondary_background_color || "rgba(255,255,255,0.84)",
        secondary_text_color: settings.button_theme?.secondary_text_color || settings.text_main_hex || "#0F172A",
        secondary_border_color: settings.button_theme?.secondary_border_color || settings.border_color_hex || "rgba(148,163,184,0.26)",
      },
    });
  }, [settings, siteSettings]);

  const activePresetId = useMemo(() => {
    const matchedPreset = THEME_PRESETS.find((preset) =>
      THEME_PRESET_KEYS.every((key) => toUpperHex(form?.[key]) === preset.colors[key].toUpperCase()),
    );

    return matchedPreset?.id ?? null;
  }, [form]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const rowId = values?.id?.trim() ? values.id : "default";
      const payload = GLOBAL_SETTINGS_EDITABLE_COLUMNS.reduce<Record<string, any>>((acc, key) => {
        acc[key] = values[key] ?? null;
        return acc;
      }, {});

      const normalizedLoadingConfig = parseLoadingScreenConfig(values.loading_screen_config || createDefaultLoadingScreenConfig());
      payload.loader_heading = normalizedLoadingConfig.heading;
      payload.loader_subtext = normalizedLoadingConfig.subtext;
      payload.loader_bg_hex = normalizedLoadingConfig.background_color;
      payload.loader_text_hex = normalizedLoadingConfig.text_color;

      const { data: updatedRows, error: updateError } = await supabase
        .from("global_settings")
        .update(payload)
        .eq("site_id", siteId)
        .select("id");

      if (updateError) throw updateError;
      if (!updatedRows?.length) {
        const { error: upsertError } = await supabase
          .from("global_settings")
          .upsert({ id: rowId, site_id: siteId, ...payload }, { onConflict: "site_id" });
        if (upsertError) throw upsertError;
      }

      await upsertSiteSetting(siteId, "loading_screen_config", serializeLoadingScreenConfig(normalizedLoadingConfig));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_settings"] });
      queryClient.invalidateQueries({ queryKey: ["site_settings", siteId] });
      toast.success("Endlevel Branding erfolgreich aktualisiert.");
    },
    onError: (error: any) => toast.error(error?.message || "Speichern fehlgeschlagen."),
  });

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateLoadingScreenConfigField = <K extends keyof LoadingScreenConfig,>(key: K, value: LoadingScreenConfig[K]) => {
    setForm((prev: any) => {
      const currentConfig = parseLoadingScreenConfig(prev?.loading_screen_config || createDefaultLoadingScreenConfig());
      const nextConfig = {
        ...currentConfig,
        [key]: value,
      } as LoadingScreenConfig;

      return {
        ...prev,
        loading_screen_config: nextConfig,
        loader_heading: nextConfig.heading,
        loader_subtext: nextConfig.subtext,
        loader_bg_hex: nextConfig.background_color,
        loader_text_hex: nextConfig.text_color,
      };
    });
  };

  const loadingScreenConfig = useMemo(
    () => parseLoadingScreenConfig(form.loading_screen_config || createDefaultLoadingScreenConfig()),
    [form.loading_screen_config],
  );

  const progressLabel = `${loadingScreenConfig.progress_prefix || ""}87${loadingScreenConfig.progress_suffix || ""}`;

  const updateButtonThemeField = (key: string, value: string) => {
    setForm((prev: any) => {
      const nextButtonTheme = {
        ...(prev?.button_theme || {}),
        [key]: value,
      };

      if (key === "primary_background_color") {
        nextButtonTheme.primary_text_color = getReadableButtonText(value);
      }

      return {
        ...prev,
        button_theme: nextButtonTheme,
      };
    });
  };

  const applyPreset = (presetColors: ThemePresetColors) => {
    setForm((prev: any) => ({
      ...prev,
      ...presetColors,
      button_theme: {
        ...(prev?.button_theme || {}),
        primary_background_color: presetColors.primary_color_hex,
        primary_text_color: getReadableButtonText(presetColors.primary_color_hex),
      },
    }));
  };

  const handleLogoUpload = async (file?: File | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const filePath = await uploadBrandingAsset(file, "logos", siteId);
      setForm((prev: any) => ({ ...prev, logo_path: filePath, use_text_logo: false }));
      toast.success("Logo erfolgreich hochgeladen!");
    } catch (error: any) {
      toast.error("Upload fehlgeschlagen: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const logoPreview = form.logo_path ? buildStrictRenderImageUrl(form.logo_path, { width: 480, quality: 82 }) : "";

  if (isLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="max-w-[1680px] p-6 md:p-10">
      <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4B2C]">
              <Palette size={12} />
              Branding Control Center
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Branding & Theme</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
              Farben, Identität und Ladebildschirm zentral steuern. Die Live-Vorschauen bleiben rechts sichtbar, damit der Kunde jederzeit versteht, was gerade verändert wird.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">01</div>
              <div className="mt-2 text-sm font-bold text-slate-900">Theme-Basis</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Preset wählen und Farben feinjustieren.</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">02</div>
              <div className="mt-2 text-sm font-bold text-slate-900">Identität</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Firmenname, Logo und Text-Logo sauber pflegen.</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">03</div>
              <div className="mt-2 text-sm font-bold text-slate-900">Loading</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Gatekeeper-Startscreen direkt mit Vorschau anpassen.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 2xl:grid-cols-[minmax(0,1.08fr)_420px]">
        <div className="min-w-0 space-y-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
              <Palette size={24} className="text-[#FF4B2C]" /> Farben & Schriften
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900">Psychologische Conversion-Themes</h2>
                <p className="mt-1 text-sm text-slate-500">
                  1-Klick-Vorlagen für professionelle, conversion-starke Designs. Manuelle Farben bleiben darunter als erweiterte Einstellungen.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {THEME_PRESETS.map((preset) => {
                  const isActive = activePresetId === preset.id;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.colors)}
                      className={cn(
                        "group rounded-[1.5rem] border bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                        isActive
                          ? "border-[#FF4B2C] ring-2 ring-[#FF4B2C]/20 shadow-[0_20px_50px_-24px_rgba(255,75,44,0.55)]"
                          : "border-slate-200 hover:border-slate-300",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-black tracking-tight text-slate-900">{preset.title}</div>
                          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {preset.subtitle}
                          </div>
                        </div>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#FF4B2C]/20 bg-[#FF4B2C]/10 px-2.5 py-1 text-[11px] font-bold text-[#FF4B2C]">
                            <CheckCircle2 size={14} /> Aktiv
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-600">{preset.description}</p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {preset.swatches.map((swatch) => (
                          <span
                            key={`${preset.id}-${swatch}`}
                            className="h-8 w-8 rounded-full border border-slate-200 shadow-sm"
                            style={{ backgroundColor: swatch }}
                            title={swatch}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mt-6">
              <div className="mb-4">
                <Label className="text-base font-bold text-slate-900 block">Erweiterte Einstellungen</Label>
                <p className="mt-1 text-sm text-slate-500">
                  Feintuning für Farben, Flächen und UI-Rundungen. Diese Werte überschreiben die Presets manuell.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 mb-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">Brand Primary</Label>
                  <Input
                    type="color"
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full"
                    value={form.primary_color_hex || "#FF4B2C"}
                    onChange={(e) => updateField("primary_color_hex", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Brand Secondary</Label>
                  <Input
                    type="color"
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full"
                    value={form.secondary_color_hex || "#0E1F53"}
                    onChange={(e) => updateField("secondary_color_hex", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Accent Farbe</Label>
                  <Input
                    type="color"
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full"
                    value={form.accent_color_hex || form.primary_color_hex || "#FF4B2C"}
                    onChange={(e) => updateField("accent_color_hex", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">CTA Hover Farbe</Label>
                  <Input
                    type="color"
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full"
                    value={form.cta_hover_hex || "#E03A1E"}
                    onChange={(e) => updateField("cta_hover_hex", e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="mb-6 rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-5 md:p-6">
                <div className="mb-4">
                  <Label className="text-base font-bold text-slate-900 block">Globale Buttons</Label>
                  <p className="mt-1 text-sm text-slate-500">Steuert alle Primary-CTAs global. Textfarbe wird per Smart Contrast automatisch gesetzt.</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Primary Button Farbe</Label>
                    <Input
                      type="color"
                      className="h-12 rounded-xl bg-white border-slate-200 px-3 cursor-pointer w-full"
                      value={form.button_theme?.primary_background_color || form.primary_color_hex || "#FF4B2C"}
                      onChange={(e) => updateButtonThemeField("primary_background_color", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Automatische Textfarbe</Label>
                    <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
                      {form.button_theme?.primary_text_color || getReadableButtonText(form.button_theme?.primary_background_color || form.primary_color_hex || "#FF4B2C")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mb-6">
                <Label className="text-base font-bold text-slate-900 mb-4 block">Flächen & Text</Label>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Seiten-Hintergrund</Label>
                    <Input
                      className="rounded-xl bg-slate-50 border-slate-200"
                      value={form.bg_main_hex || ""}
                      onChange={(e) => updateField("bg_main_hex", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Boxen/Karten BG</Label>
                    <Input
                      className="rounded-xl bg-slate-50 border-slate-200"
                      value={form.bg_card_hex || ""}
                      onChange={(e) => updateField("bg_card_hex", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Haupt-Textfarbe</Label>
                    <Input
                      className="rounded-xl bg-slate-50 border-slate-200"
                      value={form.text_main_hex || ""}
                      onChange={(e) => updateField("text_main_hex", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Muted Text</Label>
                    <Input
                      className="rounded-xl bg-slate-50 border-slate-200"
                      value={form.text_muted_hex || ""}
                      onChange={(e) => updateField("text_muted_hex", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Rahmenfarbe</Label>
                    <Input
                      className="rounded-xl bg-slate-50 border-slate-200"
                      value={form.border_color_hex || ""}
                      onChange={(e) => updateField("border_color_hex", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Footer Background</Label>
                    <Input
                      type="color"
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full"
                      value={form.footer_bg_hex || "#020617"}
                      onChange={(e) => updateField("footer_bg_hex", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-700">Rundungen (Radius)</Label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                      value={form.border_radius || "1rem"}
                      onChange={(e) => updateField("border_radius", e.target.value)}
                    >
                      <option value="0.5rem">Leicht rund (0.5rem)</option>
                      <option value="1rem">Modern rund (1rem)</option>
                      <option value="1.5rem">Stark rund (1.5rem)</option>
                      <option value="2rem">Premium rund (2rem)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
              <Type size={24} className="text-[#FF4B2C]" /> Ladebildschirm
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Personalisiere den Gatekeeper-Ladebildschirm präzise: Texte, Modus, Farben, Progress-Look und Typografie.
            </p>

            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Inhalt & Verhalten</h3>
                    <p className="mt-1 text-xs text-slate-500">Texte, Progress-Label und Anzeigemodus des Ladebildschirms.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Live gesteuert
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-700 font-bold">Lade-Titel</Label>
                    <Input
                      value={loadingScreenConfig.heading}
                      onChange={(e) => updateLoadingScreenConfigField("heading", e.target.value)}
                      placeholder="DIGITAL-PERFECT"
                      className="rounded-xl border-slate-200 bg-white focus:bg-white h-12"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-700 font-bold">Subtext</Label>
                    <Input
                      value={loadingScreenConfig.subtext}
                      onChange={(e) => updateLoadingScreenConfigField("subtext", e.target.value)}
                      placeholder="System wird geladen..."
                      className="rounded-xl border-slate-200 bg-white focus:bg-white h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Modus</Label>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      value={loadingScreenConfig.mode}
                      onChange={(e) => updateLoadingScreenConfigField("mode", e.target.value as LoadingScreenConfig["mode"])}
                    >
                      <option value="both">Spinner + Progressbar</option>
                      <option value="spinner">Nur Spinner</option>
                      <option value="bar">Nur Progressbar</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Prozent anzeigen</Label>
                    <div className="flex h-12 items-center justify-between rounded-xl border border-slate-200 bg-white px-4">
                      <span className="text-sm text-slate-600">Zahl im Loader anzeigen</span>
                      <Switch
                        checked={loadingScreenConfig.show_percentage}
                        onCheckedChange={(checked) => updateLoadingScreenConfigField("show_percentage", checked)}
                        className="data-[state=checked]:bg-[#FF4B2C]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Prefix</Label>
                    <Input
                      value={loadingScreenConfig.progress_prefix}
                      onChange={(e) => updateLoadingScreenConfigField("progress_prefix", e.target.value)}
                      placeholder=""
                      className="rounded-xl border-slate-200 bg-white h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Suffix</Label>
                    <Input
                      value={loadingScreenConfig.progress_suffix}
                      onChange={(e) => updateLoadingScreenConfigField("progress_suffix", e.target.value)}
                      placeholder="%"
                      className="rounded-xl border-slate-200 bg-white h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                <h3 className="text-sm font-extrabold text-slate-900">Farben</h3>
                <p className="mt-1 text-xs text-slate-500">Hier steuerst du auch Accent, Spinner, Track, Fill und damit den Bereich rund um die Prozentzahl.</p>
                <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Hintergrund</Label>
                    <Input
                      type="color"
                      className="h-12 rounded-xl bg-white border-slate-200 px-3 cursor-pointer w-full"
                      value={loadingScreenConfig.background_color}
                      onChange={(e) => updateLoadingScreenConfigField("background_color", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Text</Label>
                    <Input
                      type="color"
                      className="h-12 rounded-xl bg-white border-slate-200 px-3 cursor-pointer w-full"
                      value={loadingScreenConfig.text_color}
                      onChange={(e) => updateLoadingScreenConfigField("text_color", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Accent-Glow</Label>
                    <Input
                      type="color"
                      className="h-12 rounded-xl bg-white border-slate-200 px-3 cursor-pointer w-full"
                      value={loadingScreenConfig.accent_color}
                      onChange={(e) => updateLoadingScreenConfigField("accent_color", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Spinner</Label>
                    <Input
                      type="color"
                      className="h-12 rounded-xl bg-white border-slate-200 px-3 cursor-pointer w-full"
                      value={loadingScreenConfig.spinner_color}
                      onChange={(e) => updateLoadingScreenConfigField("spinner_color", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Progress-Track</Label>
                    <Input
                      type="color"
                      className="h-12 rounded-xl bg-white border-slate-200 px-3 cursor-pointer w-full"
                      value={loadingScreenConfig.track_color}
                      onChange={(e) => updateLoadingScreenConfigField("track_color", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Progress-Fill</Label>
                    <Input
                      type="color"
                      className="h-12 rounded-xl bg-white border-slate-200 px-3 cursor-pointer w-full"
                      value={loadingScreenConfig.fill_color}
                      onChange={(e) => updateLoadingScreenConfigField("fill_color", e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                <h3 className="text-sm font-extrabold text-slate-900">Typografie</h3>
                <p className="mt-1 text-xs text-slate-500">Steuert Schriftarten und Größen für Titel, Subtext und Prozentanzeige.</p>
                <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Titel Schrift</Label>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      value={loadingScreenConfig.heading_font_family}
                      onChange={(e) => updateLoadingScreenConfigField("heading_font_family", e.target.value as LoadingScreenConfig["heading_font_family"])}
                    >
                      {loadingFontOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Subtext Schrift</Label>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      value={loadingScreenConfig.subtext_font_family}
                      onChange={(e) => updateLoadingScreenConfigField("subtext_font_family", e.target.value as LoadingScreenConfig["subtext_font_family"])}
                    >
                      {loadingFontOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Prozent Schrift</Label>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      value={loadingScreenConfig.progress_font_family}
                      onChange={(e) => updateLoadingScreenConfigField("progress_font_family", e.target.value as LoadingScreenConfig["progress_font_family"])}
                    >
                      {loadingFontOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Titel Größe</Label>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      value={loadingScreenConfig.heading_size}
                      onChange={(e) => updateLoadingScreenConfigField("heading_size", e.target.value as LoadingScreenConfig["heading_size"])}
                    >
                      {loadingSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Subtext Größe</Label>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      value={loadingScreenConfig.subtext_size}
                      onChange={(e) => updateLoadingScreenConfigField("subtext_size", e.target.value as LoadingScreenConfig["subtext_size"])}
                    >
                      {loadingSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8 2xl:sticky 2xl:top-8 self-start">
          <section className="order-3 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
              <Type size={24} className="text-[#FF4B2C]" /> Identität & Logo
            </div>

            <div className="space-y-4 mb-8">
              <Label className="text-slate-700">Firmenname</Label>
              <Input className="rounded-xl bg-slate-50 border-slate-200 text-lg font-bold h-12" value={form.company_name || ""} onChange={(e) => updateField("company_name", e.target.value)} />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Label className="text-base font-bold text-slate-900">Logo-Darstellung</Label>
                  <p className="text-sm text-slate-500 mt-1">Was soll gerendert werden?</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className={`text-sm font-bold ${!form.use_text_logo ? "text-[#FF4B2C]" : "text-slate-400"}`}>Bild</span>
                  <Switch checked={form.use_text_logo || false} onCheckedChange={(c) => updateField("use_text_logo", c)} className="data-[state=checked]:bg-[#FF4B2C]" />
                  <span className={`text-sm font-bold ${form.use_text_logo ? "text-[#FF4B2C]" : "text-slate-400"}`}>Text</span>
                </div>
              </div>

              {!form.use_text_logo ? (
                <div className="pt-5 border-t border-slate-200">
                  <Label className="text-slate-700 mb-3 block">Logo hochladen</Label>
                  <MediaDropzone
                    value={form.logo_path || ""}
                    previewUrl={logoPreview || null}
                    title="Logo-Upload"
                    description="Drag & Drop für Logos. Gespeicherte Ausspielung läuft anschließend über die Render-API."
                    uploading={isUploading}
                    onFileSelected={async (file) => {
                      await handleLogoUpload(file);
                    }}
                    onRemove={() => setForm((prev: any) => ({ ...prev, logo_path: "" }))}
                  />
                </div>
              ) : (
                <div className="pt-5 border-t border-slate-200">
                  <Label className="text-slate-700 mb-4 block text-base font-bold">Text-Logo Einstellungen</Label>

                  <div className="space-y-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Titel & Überschriften</Label>
                      <Input
                        type="color"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white p-1.5 cursor-pointer"
                        value={form.surface_theme?.title_color_hex || "#0F172A"}
                        onChange={(e) =>
                          setForm((prev: any) => ({
                            ...prev,
                            surface_theme: { ...prev.surface_theme, title_color_hex: e.target.value },
                          }))
                        }
                      />
                      <p className="text-[11px] text-slate-500 mt-1">Löschen/Standard = Automatischer Kontrast</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Text (Haupttext)</Label>
                      <Input
                        type="color"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white p-1.5 cursor-pointer"
                        value={form.surface_theme?.page_foreground_color || "#0F172A"}
                        onChange={(e) =>
                          setForm((prev: any) => ({
                            ...prev,
                            surface_theme: { ...prev.surface_theme, page_foreground_color: e.target.value },
                          }))
                        }
                      />
                      <p className="text-[11px] text-slate-500 mt-1">Löschen/Standard = Automatischer Kontrast</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-slate-700 font-bold">Punkt am Ende anzeigen?</Label>
                      <Switch checked={form.show_logo_dot !== false} onCheckedChange={(c) => updateField("show_logo_dot", c)} className="data-[state=checked]:bg-[#FF4B2C]" />
                    </div>

                    {form.show_logo_dot !== false && (
                      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                        <Label className="text-slate-600 text-xs uppercase tracking-wider w-24">Farbe für Punkt</Label>
                        <Input type="color" className="h-10 w-full rounded-xl bg-white border-slate-200 px-3 cursor-pointer" value={form.logo_dot_color_hex || form.primary_color_hex || "#FF4B2C"} onChange={(e) => updateField("logo_dot_color_hex", e.target.value.toUpperCase())} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="order-1 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-500">
              <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Live-Vorschau</span>
              <p className="mt-2">Marke, Logo und CTA bleiben hier beim Bearbeiten sichtbar. So sieht der Kunde sofort, wie sich das Branding im System anfühlt.</p>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
              Live-Vorschau (Main)
            </div>
            <div className="rounded-[1.5rem] p-8 text-white shadow-xl relative overflow-hidden" style={{ backgroundColor: form.footer_bg_hex || form.secondary_color_hex || "#0E1F53" }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="mb-6">
                  {form.use_text_logo ? (
                    <div className={`text-4xl font-black tracking-tighter ${form.logo_font_family === "serif" ? "font-serif" : form.logo_font_family === "mono" ? "font-mono" : ""}`} style={{ color: form.text_logo_color_hex || "#FFFFFF" }}>
                      {form.company_name || "Digital-Perfect"}
                      {form.show_logo_dot !== false && (
                        <span style={{ color: form.logo_dot_color_hex || form.primary_color_hex || "#FF4B2C" }}>.</span>
                      )}
                    </div>
                  ) : (
                    logoPreview ? <img src={logoPreview} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert" /> : <div className="text-xl font-bold">LOGO</div>
                  )}
                </div>
                <div className="flex gap-3 mt-8">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition-colors"
                    style={{
                      backgroundColor: form.button_theme?.primary_background_color || form.primary_color_hex || "#FF4B2C",
                      color: form.button_theme?.primary_text_color || getReadableButtonText(form.button_theme?.primary_background_color || form.primary_color_hex || "#FF4B2C"),
                    }}
                  >
                    <CheckCircle2 size={16} /> Beispiel CTA
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="order-2 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
              Ladebildschirm Vorschau
            </div>
            <div
              className="rounded-[1.5rem] p-10 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[340px]"
              style={{ backgroundColor: loadingScreenConfig.background_color, color: loadingScreenConfig.text_color }}
            >
              <div
                className="absolute top-1/2 left-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px] pointer-events-none"
                style={{ backgroundColor: loadingScreenConfig.accent_color, opacity: 0.16 }}
              />
              <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-7 text-center">
                {loadingScreenConfig.mode === "spinner" || loadingScreenConfig.mode === "both" ? (
                  <div className="relative flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full blur-xl animate-pulse"
                      style={{ backgroundColor: loadingScreenConfig.accent_color, opacity: 0.2 }}
                    />
                    <Loader2 className="relative z-10 h-14 w-14 animate-spin opacity-90" style={{ color: loadingScreenConfig.spinner_color || loadingScreenConfig.text_color }} />
                    {loadingScreenConfig.show_percentage ? (
                      <div
                        className={`absolute inset-0 z-20 flex items-center justify-center text-sm font-bold tracking-tight ${loadingFontFamilyClassMap[loadingScreenConfig.progress_font_family]}`}
                        style={{ color: loadingScreenConfig.text_color }}
                      >
                        {progressLabel}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex flex-col items-center gap-2">
                  <h2
                    className={`${loadingHeadingSizeClassMap[loadingScreenConfig.heading_size]} ${loadingFontFamilyClassMap[loadingScreenConfig.heading_font_family]} font-black uppercase tracking-[0.18em]`}
                  >
                    {loadingScreenConfig.heading}
                  </h2>
                  <p
                    className={`${loadingSubtextSizeClassMap[loadingScreenConfig.subtext_size]} ${loadingFontFamilyClassMap[loadingScreenConfig.subtext_font_family]} uppercase tracking-[0.22em]`}
                    style={{ opacity: 0.68 }}
                  >
                    {loadingScreenConfig.subtext}
                  </p>
                </div>

                {loadingScreenConfig.mode === "bar" || loadingScreenConfig.mode === "both" ? (
                  <div className="w-full space-y-2">
                    <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: loadingScreenConfig.track_color }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "87%",
                          backgroundColor: loadingScreenConfig.fill_color,
                          boxShadow: `0 0 24px ${loadingScreenConfig.fill_color}`,
                        }}
                      />
                    </div>
                    {loadingScreenConfig.mode === "bar" && loadingScreenConfig.show_percentage ? (
                      <div className={`text-xs font-semibold uppercase tracking-[0.18em] ${loadingFontFamilyClassMap[loadingScreenConfig.progress_font_family]}`} style={{ opacity: 0.72 }}>
                        {progressLabel}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-8 flex items-center justify-end">
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="rounded-xl bg-[#FF4B2C] hover:bg-[#E03A1E] text-white px-8 py-6 text-lg font-bold shadow-[0_10px_30px_-10px_rgba(255,75,44,0.5)] transition-all hover:scale-105">
          {mutation.isPending ? "Speichere..." : "Branding & Theme speichern"}
        </Button>
      </div>
    </div>
  );
};

export default AdminBranding;