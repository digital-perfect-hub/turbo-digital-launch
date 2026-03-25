import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutTemplate, Link2, Palette, Plus, Save, Settings2, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { defaultFooterContactItems, type FooterContactItem, useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { upsertSiteSetting } from "@/lib/site-settings";
import {
  createDefaultFooterStyleConfig,
  parseFooterStyleConfig,
  resolveFooterStyleVars,
  serializeFooterStyleConfig,
  type FooterStyleConfig,
} from "@/lib/site-ui-config";
import { toast } from "sonner";

const patternOptions = [
  { value: "none", label: "Keine Struktur" },
  { value: "grid", label: "Subtiler Grid-Layer" },
  { value: "mesh", label: "Feines Netz / Mesh" },
  { value: "lines", label: "Technische Linienstruktur" },
  { value: "noise", label: "Dezente Noise / Depth" },
] as const;

const iconOptions: Array<{ value: NonNullable<FooterContactItem["icon"]>; label: string }> = [
  { value: "mail", label: "E-Mail" },
  { value: "phone", label: "Telefon" },
  { value: "map-pin", label: "Adresse" },
  { value: "clock", label: "Zeit" },
  { value: "globe", label: "Web / URL" },
];

const resolvePatternClass = (pattern: string) => {
  switch (pattern) {
    case "grid":
      return "homepage-pattern-shell homepage-pattern-grid";
    case "mesh":
      return "homepage-pattern-shell homepage-pattern-mesh";
    case "lines":
      return "homepage-pattern-shell homepage-pattern-lines";
    case "noise":
      return "homepage-pattern-shell homepage-pattern-noise";
    default:
      return "";
  }
};

const emptyFooterLink = { label: "", url: "" };
const emptyContactItem: FooterContactItem = { icon: "mail", label: "", value: "", url: "" };

const normalizeLinks = (value: unknown) => (Array.isArray(value) ? value : []);
const normalizeContactItems = (value: unknown) => (Array.isArray(value) && value.length ? value : defaultFooterContactItems);

const FooterPreview = ({
  brandName,
  logoDotColor,
  useTextLogo,
  textLogoColor,
  description,
  showSocials,
  navTitle,
  navLinks,
  legalTitle,
  legalLinks,
  contactTitle,
  backToTopText,
  copyrightText,
  contactItems,
  footerStyle,
}: {
  brandName: string;
  logoDotColor: string;
  useTextLogo: boolean;
  textLogoColor: string;
  description: string;
  showSocials: boolean;
  navTitle: string;
  navLinks: Array<{ label: string; url: string }>;
  legalTitle: string;
  legalLinks: Array<{ label: string; url: string }>;
  contactTitle: string;
  backToTopText: string;
  copyrightText: string;
  contactItems: FooterContactItem[];
  footerStyle: FooterStyleConfig;
}) => {
  const styleVars = resolveFooterStyleVars(footerStyle);
  const patternClass = resolvePatternClass(footerStyle.pattern_type);

  return (
    <div className="sticky top-8 space-y-4">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Live Preview</p>
        <h3 className="mt-2 text-lg font-extrabold text-slate-900">Footer</h3>
        <p className="mt-1 text-sm text-slate-500">Content, Farben und Struktur werden hier direkt simuliert.</p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4 shadow-inner">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.28)]">
          <div className={`homepage-style-scope footer-shell ${patternClass} relative overflow-hidden p-8 md:p-10`} style={styleVars}>
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-[220px] w-[520px] -translate-x-1/2 blur-[100px]" style={{ background: `radial-gradient(circle at center, ${footerStyle.glow_color} 0%, transparent 70%)` }} />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_auto_auto_auto]">
              <div className="max-w-sm">
                <div className="mb-6 text-2xl font-black tracking-tighter" style={{ color: textLogoColor || footerStyle.text_color }}>
                  {useTextLogo ? (
                    <>
                      {brandName}
                      <span style={{ color: logoDotColor || footerStyle.accent_color }}>.</span>
                    </>
                  ) : (
                    "LOGO"
                  )}
                </div>
                <p className="footer-muted text-sm leading-7">{description}</p>
                {showSocials ? (
                  <div className="mt-6 flex gap-3">
                    <div className="footer-social flex h-11 w-11 items-center justify-center rounded-2xl">IG</div>
                    <div className="footer-social flex h-11 w-11 items-center justify-center rounded-2xl">in</div>
                  </div>
                ) : null}
              </div>

              <div>
                <h4 className="mb-4 text-base font-bold">{navTitle}</h4>
                <div className="footer-muted space-y-3 text-sm">
                  {navLinks.filter((link) => link.label?.trim()).slice(0, 4).map((link, index) => (
                    <div key={`${link.label}-${index}`} className="footer-link">{link.label}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-base font-bold">{legalTitle}</h4>
                <div className="footer-muted space-y-3 text-sm">
                  {legalLinks.filter((link) => link.label?.trim()).slice(0, 4).map((link, index) => (
                    <div key={`${link.label}-${index}`} className="footer-link">{link.label}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-base font-bold">{contactTitle}</h4>
                <div className="footer-muted space-y-4 text-sm">
                  {contactItems.filter((item) => item.value?.trim()).slice(0, 4).map((item, index) => (
                    <div key={`${item.value}-${index}`} className="flex items-start gap-3">
                      <div className="mt-0.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: footerStyle.accent_color }} />
                      <div>
                        {item.label ? <div className="footer-subtle text-[11px] font-semibold uppercase tracking-[0.16em]">{item.label}</div> : null}
                        <div>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="footer-divider relative z-10 mt-10 flex items-center justify-between gap-4 border-t pt-6 text-xs">
              <div className="footer-subtle">{copyrightText}</div>
              <div className="footer-link font-bold uppercase tracking-[0.18em]">{backToTopText}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminFooter = () => {
  const qc = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { settings: globalSettings, isLoading } = useGlobalTheme();
  const { settings: siteSettings } = useSiteSettings();

  const [form, setForm] = useState({
    footer_description: "",
    social_instagram_url: "",
    social_linkedin_url: "",
    show_socials: true,
    footer_nav_links: [] as Array<{ label: string; url: string }>,
    footer_legal_links: [] as Array<{ label: string; url: string }>,
  });

  const [siteForm, setSiteForm] = useState({
    footer_nav_title: "Navigation",
    footer_legal_title: "Rechtliches",
    footer_contact_title: "Kontakt",
    footer_back_to_top_text: "Back to Top",
    footer_copyright_text: "© {{year}} {{brand}}. Alle Rechte vorbehalten.",
    footer_contact_items: defaultFooterContactItems as FooterContactItem[],
  });

  const [footerStyle, setFooterStyle] = useState<FooterStyleConfig>(createDefaultFooterStyleConfig());

  useEffect(() => {
    if (!globalSettings) return;
    setForm({
      footer_description: globalSettings.footer_description || "",
      social_instagram_url: globalSettings.social_instagram_url || "",
      social_linkedin_url: globalSettings.social_linkedin_url || "",
      show_socials: globalSettings.show_socials !== false,
      footer_nav_links: normalizeLinks(globalSettings.footer_nav_links),
      footer_legal_links: normalizeLinks(globalSettings.footer_legal_links),
    });
  }, [globalSettings]);

  useEffect(() => {
    setSiteForm({
      footer_nav_title: typeof siteSettings.footer_nav_title === "string" && siteSettings.footer_nav_title.trim() ? siteSettings.footer_nav_title : "Navigation",
      footer_legal_title: typeof siteSettings.footer_legal_title === "string" && siteSettings.footer_legal_title.trim() ? siteSettings.footer_legal_title : "Rechtliches",
      footer_contact_title: typeof siteSettings.footer_contact_title === "string" && siteSettings.footer_contact_title.trim() ? siteSettings.footer_contact_title : "Kontakt",
      footer_back_to_top_text: typeof siteSettings.footer_back_to_top_text === "string" && siteSettings.footer_back_to_top_text.trim() ? siteSettings.footer_back_to_top_text : "Back to Top",
      footer_copyright_text: typeof siteSettings.footer_copyright_text === "string" && siteSettings.footer_copyright_text.trim() ? siteSettings.footer_copyright_text : "© {{year}} {{brand}}. Alle Rechte vorbehalten.",
      footer_contact_items: normalizeContactItems(siteSettings.footer_contact_items) as FooterContactItem[],
    });

    setFooterStyle(
      parseFooterStyleConfig(siteSettings.footer_style_config || {
        background_color: globalSettings?.footer_bg_hex || createDefaultFooterStyleConfig().background_color,
      }),
    );
  }, [siteSettings, globalSettings?.footer_bg_hex]);

  const renderedCopyright = useMemo(() => {
    const brand = globalSettings?.company_name || "Digital-Perfect";
    return (siteForm.footer_copyright_text || "© {{year}} {{brand}}. Alle Rechte vorbehalten.")
      .replace(/{{\s*year\s*}}/gi, String(new Date().getFullYear()))
      .replace(/{{\s*brand\s*}}/gi, brand);
  }, [globalSettings?.company_name, siteForm.footer_copyright_text]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        site_id: siteId,
        footer_description: form.footer_description,
        social_instagram_url: form.social_instagram_url,
        social_linkedin_url: form.social_linkedin_url,
        show_socials: form.show_socials,
        footer_nav_links: form.footer_nav_links,
        footer_legal_links: form.footer_legal_links,
        footer_bg_hex: footerStyle.background_color,
      };

      const { error } = await supabase.from("global_settings").upsert(payload, { onConflict: "site_id" });
      if (error) throw error;

      await Promise.all([
        upsertSiteSetting(siteId, "footer_nav_title", siteForm.footer_nav_title),
        upsertSiteSetting(siteId, "footer_legal_title", siteForm.footer_legal_title),
        upsertSiteSetting(siteId, "footer_contact_title", siteForm.footer_contact_title),
        upsertSiteSetting(siteId, "footer_back_to_top_text", siteForm.footer_back_to_top_text),
        upsertSiteSetting(siteId, "footer_copyright_text", siteForm.footer_copyright_text),
        upsertSiteSetting(siteId, "footer_contact_items", JSON.stringify(siteForm.footer_contact_items)),
        upsertSiteSetting(siteId, "footer_style_config", serializeFooterStyleConfig(footerStyle)),
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["global_settings"] });
      qc.invalidateQueries({ queryKey: ["site_settings", siteId] });
      toast.success("Footer erfolgreich gespeichert!");
    },
    onError: (err: any) => toast.error(err?.message || "Footer konnte nicht gespeichert werden."),
  });

  const updateLink = (listType: "footer_nav_links" | "footer_legal_links", index: number, field: "label" | "url", value: string) => {
    setForm((prev) => {
      const next = [...prev[listType]];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [listType]: next };
    });
  };

  const addLink = (listType: "footer_nav_links" | "footer_legal_links") => {
    setForm((prev) => ({ ...prev, [listType]: [...prev[listType], { ...emptyFooterLink }] }));
  };

  const removeLink = (listType: "footer_nav_links" | "footer_legal_links", index: number) => {
    setForm((prev) => ({ ...prev, [listType]: prev[listType].filter((_, i) => i !== index) }));
  };

  const updateContactItem = (index: number, field: keyof FooterContactItem, value: string) => {
    setSiteForm((prev) => {
      const next = [...prev.footer_contact_items];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, footer_contact_items: next };
    });
  };

  const addContactItem = () => {
    setSiteForm((prev) => ({ ...prev, footer_contact_items: [...prev.footer_contact_items, { ...emptyContactItem }] }));
  };

  const removeContactItem = (index: number) => {
    setSiteForm((prev) => ({ ...prev, footer_contact_items: prev.footer_contact_items.filter((_, i) => i !== index) }));
  };

  const updateFooterStyle = <K extends keyof FooterStyleConfig>(key: K, value: FooterStyleConfig[K]) => {
    setFooterStyle((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="max-w-[1400px] p-6 md:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Footer-Bereich</h1>
          <p className="mt-2 text-sm text-slate-500">Der Footer ist jetzt vollständig pflegbar: Inhalte, Kontaktboxen, Socials, Titel, Farben und Struktur.</p>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="rounded-xl bg-[#FF4B2C] px-6 py-5 text-white shadow-md shadow-[#FF4B2C]/20 transition-transform hover:scale-105 hover:bg-[#E03A1E]">
          <Save size={18} className="mr-2" />
          {mutation.isPending ? "Speichere..." : "Footer speichern"}
        </Button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3 text-lg font-bold text-slate-900">
              <LayoutTemplate size={24} className="text-[#FF4B2C]" /> Allgemeine Inhalte
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Footer Beschreibung</Label>
                <Textarea rows={4} className="rounded-xl border-slate-200 bg-slate-50 resize-none" value={form.footer_description} onChange={(e) => setForm((prev) => ({ ...prev, footer_description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Navigations-Titel</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50" value={siteForm.footer_nav_title} onChange={(e) => setSiteForm((prev) => ({ ...prev, footer_nav_title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Rechtliches-Titel</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50" value={siteForm.footer_legal_title} onChange={(e) => setSiteForm((prev) => ({ ...prev, footer_legal_title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Kontakt-Titel</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50" value={siteForm.footer_contact_title} onChange={(e) => setSiteForm((prev) => ({ ...prev, footer_contact_title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Back-to-Top Text</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50" value={siteForm.footer_back_to_top_text} onChange={(e) => setSiteForm((prev) => ({ ...prev, footer_back_to_top_text: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Copyright Text</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50" value={siteForm.footer_copyright_text} onChange={(e) => setSiteForm((prev) => ({ ...prev, footer_copyright_text: e.target.value }))} />
                <p className="text-xs text-slate-500">Platzhalter unterstützt: <code>{"{{year}}"}</code> und <code>{"{{brand}}"}</code></p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-lg font-bold text-slate-900">
                <Share2 size={24} className="text-[#FF4B2C]" /> Social Media
              </div>
              <Switch checked={form.show_socials} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, show_socials: checked }))} className="data-[state=checked]:bg-[#FF4B2C]" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50" placeholder="https://instagram.com/..." value={form.social_instagram_url} onChange={(e) => setForm((prev) => ({ ...prev, social_instagram_url: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50" placeholder="https://linkedin.com/in/..." value={form.social_linkedin_url} onChange={(e) => setForm((prev) => ({ ...prev, social_linkedin_url: e.target.value }))} />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-lg font-bold text-slate-900">
                <Link2 size={22} className="text-[#FF4B2C]" /> Footer Links
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="rounded-xl border-slate-200" onClick={() => addLink("footer_nav_links")}>
                  <Plus size={16} className="mr-2" /> Navigation
                </Button>
                <Button type="button" variant="outline" className="rounded-xl border-slate-200" onClick={() => addLink("footer_legal_links")}>
                  <Plus size={16} className="mr-2" /> Rechtliches
                </Button>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Navigation</h3>
                {form.footer_nav_links.length === 0 ? <p className="text-sm italic text-slate-500">Keine Navigation-Links angelegt.</p> : null}
                {form.footer_nav_links.map((link, index) => (
                  <div key={`nav-${index}`} className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <Input className="rounded-xl border-slate-200 bg-white" placeholder="Label" value={link.label} onChange={(e) => updateLink("footer_nav_links", index, "label", e.target.value)} />
                    <div className="flex gap-2">
                      <Input className="rounded-xl border-slate-200 bg-white" placeholder="/impressum oder #kontakt" value={link.url} onChange={(e) => updateLink("footer_nav_links", index, "url", e.target.value)} />
                      <Button type="button" variant="outline" className="rounded-xl border-slate-200 px-3" onClick={() => removeLink("footer_nav_links", index)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Rechtliches</h3>
                {form.footer_legal_links.length === 0 ? <p className="text-sm italic text-slate-500">Keine Rechtliches-Links angelegt.</p> : null}
                {form.footer_legal_links.map((link, index) => (
                  <div key={`legal-${index}`} className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <Input className="rounded-xl border-slate-200 bg-white" placeholder="Label" value={link.label} onChange={(e) => updateLink("footer_legal_links", index, "label", e.target.value)} />
                    <div className="flex gap-2">
                      <Input className="rounded-xl border-slate-200 bg-white" placeholder="/datenschutz" value={link.url} onChange={(e) => updateLink("footer_legal_links", index, "url", e.target.value)} />
                      <Button type="button" variant="outline" className="rounded-xl border-slate-200 px-3" onClick={() => removeLink("footer_legal_links", index)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-lg font-bold text-slate-900">
                <Settings2 size={22} className="text-[#FF4B2C]" /> Kontakt-Items
              </div>
              <Button type="button" variant="outline" className="rounded-xl border-slate-200" onClick={addContactItem}>
                <Plus size={16} className="mr-2" /> Kontaktpunkt
              </Button>
            </div>

            <div className="space-y-4">
              {siteForm.footer_contact_items.map((item, index) => (
                <div key={`contact-${index}`} className="grid gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_1fr_1fr_auto] md:items-end">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={item.icon || "mail"} onChange={(e) => updateContactItem(index, "icon", e.target.value)}>
                      {iconOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input className="rounded-xl border-slate-200 bg-white" placeholder="z. B. E-Mail" value={item.label || ""} onChange={(e) => updateContactItem(index, "label", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Wert</Label>
                    <Input className="rounded-xl border-slate-200 bg-white" placeholder="info@digital-perfect.at" value={item.value || ""} onChange={(e) => updateContactItem(index, "value", e.target.value)} />
                  </div>
                  <Button type="button" variant="outline" className="rounded-xl border-slate-200 px-3" onClick={() => removeContactItem(index)}>
                    <Trash2 size={16} />
                  </Button>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Optionale Ziel-URL</Label>
                    <Input className="rounded-xl border-slate-200 bg-white" placeholder="mailto:..., tel:..., https://..." value={item.url || ""} onChange={(e) => updateContactItem(index, "url", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3 text-lg font-bold text-slate-900">
              <Palette size={22} className="text-[#FF4B2C]" /> Footer Style
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {[
                ["background_color", "Footer Hintergrund"],
                ["text_color", "Haupttext"],
                ["muted_color", "Muted Text"],
                ["subtle_color", "Subtle Text"],
                ["divider_color", "Divider"],
                ["social_background_color", "Social Hintergrund"],
                ["social_text_color", "Social Text"],
                ["social_border_color", "Social Border"],
                ["link_hover_color", "Link Hover"],
                ["accent_color", "Accent"],
                ["glow_color", "Glow"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-2 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                  <Label>{label}</Label>
                  <Input className="rounded-xl border-slate-200 bg-white" value={footerStyle[key as keyof FooterStyleConfig] as string} onChange={(e) => updateFooterStyle(key as keyof FooterStyleConfig, e.target.value as never)} />
                </div>
              ))}

              <div className="space-y-2 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <Label>Struktur / Pattern</Label>
                <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={footerStyle.pattern_type} onChange={(e) => updateFooterStyle("pattern_type", e.target.value as FooterStyleConfig["pattern_type"])}>
                  {patternOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <Label>Pattern Intensität</Label>
                <Input type="range" min="0" max="45" className="rounded-xl border-slate-200 px-0" value={Math.round(footerStyle.pattern_opacity * 100)} onChange={(e) => updateFooterStyle("pattern_opacity", Number(e.target.value) / 100)} />
                <p className="text-xs text-slate-500">{Math.round(footerStyle.pattern_opacity * 100)} %</p>
              </div>
            </div>
          </section>
        </div>

        <FooterPreview
          brandName={globalSettings?.company_name || "Digital-Perfect"}
          logoDotColor={globalSettings?.logo_dot_color_hex || footerStyle.accent_color}
          useTextLogo={globalSettings?.use_text_logo !== false}
          textLogoColor={globalSettings?.text_logo_color_hex || footerStyle.text_color}
          description={form.footer_description || "Premium Webdesign, SEO und digitale Vertriebsmaschinen für Agenturen und Brands."}
          showSocials={form.show_socials}
          navTitle={siteForm.footer_nav_title}
          navLinks={form.footer_nav_links}
          legalTitle={siteForm.footer_legal_title}
          legalLinks={form.footer_legal_links}
          contactTitle={siteForm.footer_contact_title}
          backToTopText={siteForm.footer_back_to_top_text}
          copyrightText={renderedCopyright}
          contactItems={siteForm.footer_contact_items}
          footerStyle={footerStyle}
        />
      </div>
    </div>
  );
};

export default AdminFooter;
