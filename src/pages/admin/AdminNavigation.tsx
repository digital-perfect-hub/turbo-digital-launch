import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Link2, Menu, Palette, Plus, Trash2, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { defaultNavigationTheme, type NavigationTheme } from "@/lib/theme-settings";

type NavigationLink = {
  id: string;
  label: string;
  url: string;
  parent_id: string | null;
};

type StylingState = {
  nav_font_weight: string;
  nav_font_style: string;
  nav_font_family: string;
  nav_show_underline: boolean;
  nav_underline_color_hex: string;
  nav_animate_underline: boolean;
  nav_background_hex: string;
  nav_background_opacity: number;
  nav_glass_effect: boolean;
  nav_text_color_hex: string;
  nav_hover_color_hex: string;
  nav_cta_color_hex: string;
};

const DEFAULT_STYLING: StylingState = {
  nav_font_weight: "bold",
  nav_font_style: "normal",
  nav_font_family: "default",
  nav_show_underline: false,
  nav_underline_color_hex: "#FF4B2C",
  nav_animate_underline: true,
  nav_background_hex: "#FFFFFF",
  nav_background_opacity: 92,
  nav_glass_effect: true,
  nav_text_color_hex: "#0E1F53",
  nav_hover_color_hex: "#FF4B2C",
  nav_cta_color_hex: "#FF4B2C",
};

const normalizeHex = (value?: string | null, fallback = "#FF4B2C") => {
  const raw = (value || "").trim();
  if (/^#([0-9a-fA-F]{6})$/.test(raw)) return raw.toUpperCase();
  if (/^#([0-9a-fA-F]{3})$/.test(raw)) {
    const short = raw.slice(1).split("").map((char) => `${char}${char}`).join("");
    return `#${short}`.toUpperCase();
  }
  return fallback;
};

const hexToRgb = (hex: string) => {
  const safeHex = normalizeHex(hex, "#FFFFFF").slice(1);
  return {
    r: parseInt(safeHex.slice(0, 2), 16),
    g: parseInt(safeHex.slice(2, 4), 16),
    b: parseInt(safeHex.slice(4, 6), 16),
  };
};

const rgbaFromHex = (hex: string, opacity: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
};

const parseStoredBackground = (value?: string | null) => {
  const raw = (value || "").trim();
  if (!raw) return { hex: "#FFFFFF", opacity: 92, glass: true };

  if (/^rgba?\(/i.test(raw)) {
    const values = raw.replace(/rgba?\(/i, "").replace(")", "").split(",").map((item) => item.trim());
    const [r = "255", g = "255", b = "255", a = "0.92"] = values;
    const toHex = (channel: string) => Number(channel).toString(16).padStart(2, "0");
    return {
      hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase(),
      opacity: Math.round(Math.max(0, Math.min(1, Number(a))) * 100),
      glass: Number(a) < 1,
    };
  }

  return {
    hex: normalizeHex(raw, "#FFFFFF"),
    opacity: 100,
    glass: false,
  };
};

const getReadableText = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? "#0F172A" : "#FFFFFF";
};

const AdminNavigation = () => {
  const qc = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", url: "", parent_id: "" });
  const [styling, setStyling] = useState<StylingState>(DEFAULT_STYLING);

  const { data: themeSettings } = useQuery({
    queryKey: ["global_settings_nav", siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_settings")
        .select("id, navigation_theme, nav_text_color_hex, nav_hover_color_hex, nav_font_weight, nav_font_style, nav_font_family, nav_show_underline, nav_underline_color_hex, nav_animate_underline")
        .eq("site_id", siteId)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const navTheme = {
      ...defaultNavigationTheme,
      ...((themeSettings?.navigation_theme as NavigationTheme | null) || {}),
    };
    const parsedBackground = parseStoredBackground(navTheme.background_color);

    setStyling({
      nav_font_weight: themeSettings?.nav_font_weight || DEFAULT_STYLING.nav_font_weight,
      nav_font_style: themeSettings?.nav_font_style || DEFAULT_STYLING.nav_font_style,
      nav_font_family: themeSettings?.nav_font_family || DEFAULT_STYLING.nav_font_family,
      nav_show_underline: themeSettings?.nav_show_underline ?? DEFAULT_STYLING.nav_show_underline,
      nav_underline_color_hex: normalizeHex(themeSettings?.nav_underline_color_hex, DEFAULT_STYLING.nav_underline_color_hex),
      nav_animate_underline: themeSettings?.nav_animate_underline ?? DEFAULT_STYLING.nav_animate_underline,
      nav_background_hex: parsedBackground.hex,
      nav_background_opacity: parsedBackground.opacity,
      nav_glass_effect: parsedBackground.glass,
      nav_text_color_hex: normalizeHex(themeSettings?.nav_text_color_hex || navTheme.text_color, DEFAULT_STYLING.nav_text_color_hex),
      nav_hover_color_hex: normalizeHex(themeSettings?.nav_hover_color_hex || navTheme.hover_text_color, DEFAULT_STYLING.nav_hover_color_hex),
      nav_cta_color_hex: normalizeHex(navTheme.cta_background_color, DEFAULT_STYLING.nav_cta_color_hex),
    });
  }, [themeSettings]);

  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ["navigation_links", siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("navigation_links")
        .select("*")
        .eq("site_id", siteId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as NavigationLink[];
    },
  });

  const previewTheme = useMemo(() => {
    const opacity = styling.nav_glass_effect ? styling.nav_background_opacity / 100 : 1;
    const backgroundColor = styling.nav_glass_effect
      ? rgbaFromHex(styling.nav_background_hex, opacity)
      : normalizeHex(styling.nav_background_hex, "#FFFFFF");

    const textColor = normalizeHex(styling.nav_text_color_hex, DEFAULT_STYLING.nav_text_color_hex);
    const hoverColor = normalizeHex(styling.nav_hover_color_hex, DEFAULT_STYLING.nav_hover_color_hex);
    const ctaColor = normalizeHex(styling.nav_cta_color_hex, DEFAULT_STYLING.nav_cta_color_hex);

    const borderColor = styling.nav_glass_effect
      ? rgbaFromHex(textColor, 0.14)
      : rgbaFromHex(textColor, 0.18);

    return {
      background_color: backgroundColor,
      text_color: textColor,
      muted_text_color: rgbaFromHex(textColor, 0.72),
      border_color: borderColor,
      hover_background_color: rgbaFromHex(hoverColor, 0.08),
      hover_text_color: hoverColor,
      cta_background_color: ctaColor,
      cta_text_color: getReadableText(ctaColor),
      topbar_background_color: styling.nav_glass_effect ? rgbaFromHex(styling.nav_background_hex, Math.max(0.72, opacity - 0.08)) : backgroundColor,
      topbar_text_color: textColor,
      topbar_accent_color: ctaColor,
      logo_badge_background_color: defaultNavigationTheme.logo_badge_background_color,
      logo_badge_text_color: defaultNavigationTheme.logo_badge_text_color,
    } satisfies NavigationTheme;
  }, [styling]);

  const saveStyling = useMutation({
    mutationFn: async (values: StylingState) => {
      const rowId = themeSettings?.id || "default";
      const payload = {
        id: rowId,
        site_id: siteId,
        navigation_theme: previewTheme,
        nav_text_color_hex: values.nav_text_color_hex,
        nav_hover_color_hex: values.nav_hover_color_hex,
        nav_font_weight: values.nav_font_weight,
        nav_font_style: values.nav_font_style,
        nav_font_family: values.nav_font_family,
        nav_show_underline: values.nav_show_underline,
        nav_underline_color_hex: values.nav_underline_color_hex,
        nav_animate_underline: values.nav_animate_underline,
      };

      const { error } = await supabase.from("global_settings").upsert(payload, { onConflict: "site_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["global_settings"] });
      qc.invalidateQueries({ queryKey: ["global_settings_nav", siteId] });
      toast.success("Navigation gespeichert.");
    },
    onError: (error: any) => toast.error(error?.message || "Navigation konnte nicht gespeichert werden."),
  });

  const saveLink = useMutation({
    mutationFn: async () => {
      const payload = {
        site_id: siteId,
        label: form.label,
        url: form.url,
        parent_id: form.parent_id === "none" || !form.parent_id ? null : form.parent_id,
      };

      if (editingId) {
        const { error } = await supabase.from("navigation_links").update(payload).eq("id", editingId);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("navigation_links").insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["navigation_links", siteId] });
      setEditingId(null);
      setForm({ label: "", url: "", parent_id: "" });
      toast.success("Navigationslink gespeichert.");
    },
    onError: (error: any) => toast.error(error?.message || "Link konnte nicht gespeichert werden."),
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("navigation_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["navigation_links", siteId] });
      toast.success("Link gelöscht.");
    },
    onError: (error: any) => toast.error(error?.message || "Link konnte nicht gelöscht werden."),
  });

  const topLevelLinks = links.filter((item) => !item.parent_id);
  const getChildren = (parentId: string) => links.filter((item) => item.parent_id === parentId);

  const previewFontFamily = styling.nav_font_family === "serif" ? "font-serif" : styling.nav_font_family === "mono" ? "font-mono" : "font-sans";
  const previewFontWeight = styling.nav_font_weight === "normal" ? "font-normal" : styling.nav_font_weight === "medium" ? "font-medium" : styling.nav_font_weight === "extrabold" ? "font-extrabold" : "font-bold";
  const previewFontStyle = styling.nav_font_style === "italic" ? "italic" : "not-italic";
  const previewClasses = `${previewFontFamily} ${previewFontWeight} ${previewFontStyle} relative inline-flex cursor-pointer items-center gap-1.5 py-1 text-sm uppercase tracking-[0.18em] transition-colors duration-300`;

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Navigation & Menü</h1>
          <p className="mt-2 text-sm text-muted-foreground">Live-Vorschau, Smart-Glass und CTA-Farben direkt aus dem vorhandenen navigation_theme.</p>
        </div>
        <Button onClick={() => saveStyling.mutate(styling)} disabled={saveStyling.isPending} className="rounded-xl px-6 py-5 text-white shadow-md transition-transform hover:scale-[1.01]">
          {saveStyling.isPending ? "Speichere..." : "Navigation speichern"}
        </Button>
      </div>

      <section className="glass-card mb-8 rounded-[2rem] border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3 text-lg font-bold text-foreground">
          <Palette size={22} className="text-primary" /> Live-Vorschau
        </div>

        <div className="overflow-hidden rounded-[1.8rem] border p-5 shadow-inner" style={{ background: previewTheme.background_color || undefined, borderColor: previewTheme.border_color || undefined, backdropFilter: styling.nav_glass_effect ? "blur(18px)" : undefined }}>
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <div className="text-xs font-mono uppercase tracking-[0.22em]" style={{ color: previewTheme.muted_text_color || undefined }}>
              Navigation Preview
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {["Leistungen", "Projekte", "Kontakt"].map((label) => (
              <div key={label} className={`${previewClasses} group`} style={{ color: previewTheme.text_color || undefined }}>
                {label}
                {styling.nav_show_underline && (
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] w-full ${styling.nav_animate_underline ? "origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" : "opacity-100"}`}
                    style={{ backgroundColor: styling.nav_underline_color_hex }}
                  />
                )}
              </div>
            ))}

            <div className="ml-auto hidden rounded-full px-5 py-3 text-sm font-bold md:inline-flex" style={{ background: previewTheme.cta_background_color || undefined, color: previewTheme.cta_text_color || undefined }}>
              Anfrage starten
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-lg font-bold text-foreground">
              <Palette size={20} className="text-primary" /> Farben & Glass
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Navigation Hintergrund</Label>
                <Input type="color" className="h-12 cursor-pointer" value={styling.nav_background_hex} onChange={(event) => setStyling((prev) => ({ ...prev, nav_background_hex: event.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-2">
                <Label>Textfarbe</Label>
                <Input type="color" className="h-12 cursor-pointer" value={styling.nav_text_color_hex} onChange={(event) => setStyling((prev) => ({ ...prev, nav_text_color_hex: event.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-2">
                <Label>Hover-Farbe</Label>
                <Input type="color" className="h-12 cursor-pointer" value={styling.nav_hover_color_hex} onChange={(event) => setStyling((prev) => ({ ...prev, nav_hover_color_hex: event.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-2">
                <Label>CTA-Farbe</Label>
                <Input type="color" className="h-12 cursor-pointer" value={styling.nav_cta_color_hex} onChange={(event) => setStyling((prev) => ({ ...prev, nav_cta_color_hex: event.target.value.toUpperCase() }))} />
              </div>
            </div>

            <div className="rounded-2xl border bg-background/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-foreground">Glass-Effekt aktiv</div>
                  <p className="mt-1 text-sm text-muted-foreground">Steuert die Transparenz direkt über navigation_theme.background_color.</p>
                </div>
                <Switch checked={styling.nav_glass_effect} onCheckedChange={(checked) => setStyling((prev) => ({ ...prev, nav_glass_effect: checked }))} />
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deckkraft</span>
                  <span className="font-semibold text-foreground">{styling.nav_background_opacity}%</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="100"
                  value={styling.nav_background_opacity}
                  onChange={(event) => setStyling((prev) => ({ ...prev, nav_background_opacity: Number(event.target.value) }))}
                  className="w-full accent-primary"
                  disabled={!styling.nav_glass_effect}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 text-lg font-bold text-foreground">
              <Type size={20} className="text-primary" /> Typografie & Effekte
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Schriftart</Label>
                <select className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none" value={styling.nav_font_family} onChange={(event) => setStyling((prev) => ({ ...prev, nav_font_family: event.target.value }))}>
                  <option value="default">Standard</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Gewicht</Label>
                <select className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none" value={styling.nav_font_weight} onChange={(event) => setStyling((prev) => ({ ...prev, nav_font_weight: event.target.value }))}>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="bold">Bold</option>
                  <option value="extrabold">Extra Bold</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Stil</Label>
                <select className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none" value={styling.nav_font_style} onChange={(event) => setStyling((prev) => ({ ...prev, nav_font_style: event.target.value }))}>
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border bg-background/70 p-5 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-foreground">Underline anzeigen</div>
                  <p className="mt-1 text-sm text-muted-foreground">Unterstreicht Menüpunkte im Frontend.</p>
                </div>
                <Switch checked={styling.nav_show_underline} onCheckedChange={(checked) => setStyling((prev) => ({ ...prev, nav_show_underline: checked }))} />
              </div>

              {styling.nav_show_underline && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Underline-Farbe</Label>
                    <Input type="color" className="h-12 cursor-pointer" value={styling.nav_underline_color_hex} onChange={(event) => setStyling((prev) => ({ ...prev, nav_underline_color_hex: event.target.value.toUpperCase() }))} />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-3">
                    <span className="text-sm font-medium text-foreground">Animation aktiv</span>
                    <Switch checked={styling.nav_animate_underline} onCheckedChange={(checked) => setStyling((prev) => ({ ...prev, nav_animate_underline: checked }))} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-card rounded-[2rem] border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3 text-lg font-bold text-foreground">
            <Menu size={22} className="text-primary" /> Menüstruktur
          </div>

          {linksLoading ? (
            <div className="text-sm text-muted-foreground">Lade Menü...</div>
          ) : topLevelLinks.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Noch keine Links vorhanden.</div>
          ) : (
            <div className="space-y-4">
              {topLevelLinks.map((link) => (
                <div key={link.id} className="rounded-2xl border bg-background/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-foreground">{link.label}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{link.url}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setForm({ label: link.label, url: link.url, parent_id: link.parent_id || "none" }); setEditingId(link.id); }} className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary"><Edit2 size={16} /></button>
                      <button onClick={() => deleteLink.mutate(link.id)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-destructive"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  {getChildren(link.id).length > 0 && (
                    <div className="mt-4 space-y-2 border-l pl-4">
                      {getChildren(link.id).map((child) => (
                        <div key={child.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-foreground">{child.label}</div>
                            <div className="text-xs text-muted-foreground">{child.url}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setForm({ label: child.label, url: child.url, parent_id: child.parent_id || "none" }); setEditingId(child.id); }} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-primary"><Edit2 size={14} /></button>
                            <button onClick={() => deleteLink.mutate(child.id)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-[2rem] border bg-slate-950 text-white shadow-sm">
          <div className="border-b border-white/10 px-7 py-6">
            <div className="flex items-center gap-3 text-lg font-bold">
              {editingId ? <Edit2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
              {editingId ? "Link bearbeiten" : "Neuen Link anlegen"}
            </div>
            <p className="mt-2 text-sm text-white/70">Top-Level oder Dropdown – beides läuft direkt über navigation_links.</p>
          </div>

          <div className="space-y-5 px-7 py-7">
            <div className="space-y-2">
              <Label className="text-white/80">Titel</Label>
              <Input value={form.label} onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))} placeholder="z. B. Leistungen" className="bg-white/5 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">URL</Label>
              <Input value={form.url} onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))} placeholder="#kontakt oder /impressum" className="bg-white/5 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Parent</Label>
              <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" value={form.parent_id || "none"} onChange={(event) => setForm((prev) => ({ ...prev, parent_id: event.target.value }))}>
                <option value="none">Top-Level Link</option>
                {topLevelLinks.map((link) => (
                  <option key={link.id} value={link.id}>{link.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={() => saveLink.mutate()} disabled={!form.label.trim() || !form.url.trim() || saveLink.isPending} className="flex-1 rounded-xl text-white">
                <Link2 size={16} />
                {saveLink.isPending ? "Speichere..." : editingId ? "Link aktualisieren" : "Link anlegen"}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={() => { setEditingId(null); setForm({ label: "", url: "", parent_id: "" }); }} className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  Zurücksetzen
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminNavigation;
