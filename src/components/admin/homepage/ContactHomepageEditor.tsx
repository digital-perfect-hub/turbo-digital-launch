import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContext } from "@/context/SiteContext";
import { upsertSiteSetting } from "@/lib/site-settings";
import { CONTACT_HOMEPAGE_KEY, contactHomepageSchema, resolveContactHomepage } from "@/lib/contact-homepage";
import { Button } from "@/components/ui/button";

const labels: Record<string, string> = {
  enabled: "Kontakt-Startseite verwenden", showPortrait: "Foto anzeigen", portraitUrl: "Bildpfad oder Bild-URL", portraitAlt: "Bildbeschreibung",
  kicker: "Einordnung über der Überschrift", headline: "Hauptüberschrift", highlight: "Hervorgehobene Schlusszeile", introduction: "Einleitung",
  primaryCta: "Kontaktbutton", secondaryCta: "Link zu den Leistungen", navLabels: "Menübeschriftungen", proof: "Vertrauenszeile",
  servicesKicker: "Leistungen: Einordnung", servicesTitle: "Leistungen: Überschrift", servicesText: "Leistungen: Einleitung", services: "Leistungsfelder", serviceCta: "Link zur Projektanfrage",
  referencesKicker: "Kundenstimmen: Einordnung", referencesTitle: "Kundenstimmen: Überschrift", referencesText: "Kundenstimmen: Einleitung",
  founderKicker: "Persönlicher Bereich: Einordnung", founderTitle: "Persönlicher Bereich: Überschrift", founderText: "Vorstellung", founderName: "Name", founderRole: "Rolle", founderNote: "Persönlicher Schlusssatz", founderPoints: "Zusammenarbeit",
  processKicker: "Ablauf: Einordnung", processTitle: "Ablauf: Überschrift", steps: "Schritte", faqKicker: "FAQ: Einordnung", faqTitle: "FAQ: Überschrift", faq: "Fragen und Antworten",
  contactKicker: "Kontakt: Einordnung", contactTitle: "Kontakt: Überschrift", contactText: "Kontakt: Einleitung", contactSignals: "Hinweise zum Erstgespräch", serviceOptions: "Optionale Anliegen im Formular", footerText: "Footer-Beschreibung",
  title: "Titel", text: "Text", question: "Frage", answer: "Antwort",
  testimonials: "Vorhandene Kundenstimmen (solange im Kundenstimmen-Bereich keine sichtbaren Einträge gespeichert sind)", name: "Name", role: "Unternehmen / Rolle",
};

export default function ContactHomepageEditor() {
  const { activeSiteId } = useSiteContext();
  const { settings, isLoading } = useSiteSettings();
  const queryClient = useQueryClient();
  const stored = settings[CONTACT_HOMEPAGE_KEY];
  const [draft, setDraft] = useState(() => resolveContactHomepage(stored, activeSiteId));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(resolveContactHomepage(stored, activeSiteId));
    setDirty(false);
  }, [stored, activeSiteId]);

  const change = (path: Array<string | number>, value: string | boolean) => {
    setDraft((previous) => {
      const next = structuredClone(previous);
      let target = next as unknown as Record<string | number, unknown>;
      for (const key of path.slice(0, -1)) target = target[key] as Record<string | number, unknown>;
      target[path[path.length - 1]] = value;
      return next;
    });
    setDirty(true);
  };

  const field = (key: string, value: unknown, path: Array<string | number>) => {
    const id = `contact-page-${path.join("-")}`;
    const label = labels[key] || key;
    if (typeof value === "boolean") return <label key={id} className="flex items-center gap-3 py-3 font-medium"><input type="checkbox" checked={value} onChange={(e) => change(path, e.target.checked)} />{label}</label>;
    if (typeof value === "string") return <label key={id} className="grid gap-2 text-sm font-medium" htmlFor={id}>{label}<textarea id={id} rows={value.length > 100 ? 4 : 2} value={value} onChange={(e) => change(path, e.target.value)} className="w-full rounded-md border border-slate-300 bg-white p-3 font-normal text-slate-900" /></label>;
    if (Array.isArray(value)) return <fieldset key={id} className="space-y-4 rounded-lg border border-slate-200 p-4"><legend className="px-2 font-bold">{label}</legend>{value.map((item, index) => typeof item === "string" ? field(`${index + 1}`, item, [...path, index]) : <div key={index} className="space-y-3 border-b border-slate-200 pb-4">{Object.entries(item).map(([nestedKey, nestedValue]) => field(nestedKey, nestedValue, [...path, index, nestedKey]))}</div>)}</fieldset>;
    return null;
  };

  const save = async () => {
    const result = contactHomepageSchema.safeParse(draft);
    if (!result.success) { toast.error("Bitte prüfe die eingegebenen Inhalte."); return; }
    const targetSiteId = activeSiteId;
    setSaving(true);
    try {
      await upsertSiteSetting(targetSiteId, CONTACT_HOMEPAGE_KEY, JSON.stringify(result.data));
      await queryClient.invalidateQueries({ queryKey: ["site_settings", targetSiteId] });
      setDirty(false);
      toast.success("Kontakt-Startseite gespeichert.");
    } catch { toast.error("Speichern fehlgeschlagen. Deine Änderungen stehen weiterhin im Formular."); }
    finally { setSaving(false); }
  };

  if (isLoading) return <p className="p-8">Inhalte werden geladen …</p>;
  return <section className="mx-auto max-w-5xl space-y-6 p-6 text-slate-900 md:p-10">
    <div><h1 className="text-3xl font-bold">Kontakt-Startseite</h1><p className="mt-3 text-sm leading-7 text-slate-600">Hier bearbeitest du die neue Startseite ohne Preis- und Produktbereiche. Farben und Logo kommen weiterhin aus dem globalen Design. Kundenstimmen werden im vorhandenen Kundenstimmen-Bereich gepflegt. Menüeinträge führen in der angegebenen Reihenfolge zu Leistungen, Kundenstimmen, Über mich, Ablauf und Kontakt.</p></div>
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"><span className="text-sm">{dirty ? "Ungespeicherte Änderungen" : "Inhalte geladen"}</span><Button disabled={saving || !dirty} onClick={save}>{saving ? "Wird gespeichert …" : "Kontakt-Startseite speichern"}</Button></div>
    {Object.entries(draft).map(([key, value]) => field(key, value, [key]))}
  </section>;
}
