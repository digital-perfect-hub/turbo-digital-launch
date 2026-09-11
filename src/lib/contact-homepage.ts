import { z } from "zod";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { defaultTestimonials } from "@/hooks/useSiteSettings";

export const CONTACT_HOMEPAGE_KEY = "home_contact_page";
const card = z.object({ title: z.string(), text: z.string() });
const reference = z.object({ title: z.string(), category: z.string(), url: z.string().url(), image: z.string(), description: z.string(), accent: z.string() });
export const contactHomepageSchema = z.object({
  enabled: z.boolean(),
  showPortrait: z.boolean(),
  portraitUrl: z.string().refine((value) => !value || /^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value), "Bitte einen lokalen Bildpfad oder eine HTTPS-Adresse verwenden."),
  portraitAlt: z.string(),
  kicker: z.string(),
  headline: z.string(),
  highlight: z.string(),
  introduction: z.string(),
  primaryCta: z.string(),
  secondaryCta: z.string(),
  navLabels: z.array(z.string()).length(5),
  proof: z.array(card),
  servicesKicker: z.string(),
  servicesTitle: z.string(),
  servicesText: z.string(),
  services: z.array(card),
  serviceCta: z.string(),
  referencesKicker: z.string(),
  referencesTitle: z.string(),
  referencesText: z.string(),
  references: z.array(reference),
  testimonials: z.array(z.object({ name: z.string(), role: z.string(), text: z.string() })),
  founderKicker: z.string(),
  founderTitle: z.string(),
  founderText: z.string(),
  founderName: z.string(),
  founderRole: z.string(),
  founderNote: z.string(),
  founderPoints: z.array(card),
  processKicker: z.string(),
  processTitle: z.string(),
  steps: z.array(card),
  faqKicker: z.string(),
  faqTitle: z.string(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  contactKicker: z.string(),
  contactTitle: z.string(),
  contactText: z.string(),
  contactSignals: z.array(card),
  serviceOptions: z.array(z.string()),
  footerText: z.string(),
});
export type ContactHomepageContent = z.infer<typeof contactHomepageSchema>;

// CMS-editable launch content for the Digital-Perfect tenant only.
export const defaultContactHomepage: ContactHomepageContent = {
  enabled: true,
  showPortrait: true,
  portraitUrl: "/markus-schulz-gruender-ceo-digital-perfect.webp",
  portraitAlt: "Markus Schulz, dein Ansprechpartner bei Digital-Perfect",
  kicker: "WEBDESIGN · SEO · KI-SICHTBARKEIT",
  headline: "Online gefunden.\nPersönlich überzeugt.",
  highlight: "Öfter angefragt.",
  introduction: "Deine Website kann mehr als gut aussehen. Wir verbinden Webdesign, SEO und KI-Sichtbarkeit zu einem Auftritt, der dein Unternehmen verständlich macht – und den Weg zur Anfrage einfach.",
  primaryCta: "Kostenloses Erstgespräch anfragen",
  secondaryCta: "Leistungen entdecken",
  navLabels: ["Leistungen", "Referenzen", "Über mich", "Ablauf", "Kontakt"],
  proof: [
    { title: "Ein Ansprechpartner", text: "Von der Idee bis zur Umsetzung" },
    { title: "Ein klarer Plan", text: "Passend zu deinem Unternehmen" },
    { title: "Ein gemeinsames Ziel", text: "Mehr passende Kundenanfragen" },
  ],
  servicesKicker: "WAS WIR FÜR DICH TUN",
  servicesTitle: "Eine starke Website ist erst der Anfang.",
  servicesText: "Design, Auffindbarkeit und klare Inhalte gehören zusammen. Wir setzen dort an, wo dein Unternehmen gerade Unterstützung braucht.",
  services: [
    { title: "Webdesign", text: "Ein Auftritt, der zu dir passt. Schnell, mobilfreundlich und so aufgebaut, dass Besucher dein Angebot verstehen und Kontakt aufnehmen können." },
    { title: "SEO & lokale Sichtbarkeit", text: "Bei den richtigen Suchanfragen sichtbar werden. Mit sauberer Technik, einer verständlichen Seitenstruktur und Inhalten für deine Zielgruppe." },
    { title: "KI-Sichtbarkeit", text: "Dein Unternehmen klar einordnen. Wir strukturieren Inhalte und Informationen so, dass auch KI-basierte Suchsysteme dein Angebot besser verstehen können." },
  ],
  serviceCta: "Über dein Projekt sprechen",
  referencesKicker: "AUS DER ZUSAMMENARBEIT",
  referencesTitle: "Vertrauen entsteht durch gute Arbeit.",
  referencesText: "Einblicke von Unternehmen, die mit Digital-Perfect an ihrem digitalen Auftritt arbeiten.",
  references: [
    { title: "Tiertarif", category: "Vergleichsportal", url: "https://tiertarif.com/", image: "/references/digital-perfect-referenz-tierversicherungs-vergleich-tiertarif-com.webp", description: "Klar strukturierte Vergleichsseite mit direktem Einstieg in die Auswahl.", accent: "#f08a32" },
    { title: "RankScout", category: "Vergleich & Content", url: "https://rank-scout.com/", image: "/references/digital-perfect-referenz-rank-scout-vergleichsportal-fuer-versicherungen.webp", description: "Starker Hero-Auftritt mit Suchfokus und klarer Nutzerführung.", accent: "#ff6a21" },
    { title: "Pudel Schulz", category: "Service-Website", url: "https://pudelschulz.de/", image: "/references/digital-perfect-referenz-pudelschulz-de-hundemagazin.webp", description: "Persönlicher Markenauftritt mit klarer, vertrauensvoller Ansprache.", accent: "#d9a441" },
    { title: "Kraftstamm", category: "Markenauftritt", url: "https://kraftstamm.at/", image: "/references/digital-perfect-seo-referenz-kraftstamm-oesterreich.webp", description: "Markante Typografie, starke Flächen und ein eigenständiger Charakter.", accent: "#cf6a37" },
  ],
  testimonials: defaultTestimonials.slice(0, 3),
  founderKicker: "PERSÖNLICH. VON ANFANG AN.",
  founderTitle: "Du sprichst mit dem Menschen, der es umsetzt.",
  founderText: "Ich bin Markus Schulz, der Kopf hinter Digital-Perfect. Ich begleite dein Projekt von den ersten Fragen über Design und technische Umsetzung bis zur weiteren Optimierung. So bleiben Ziele, Entscheidungen und nächste Schritte im direkten Austausch.",
  founderName: "Markus Schulz",
  founderRole: "Dein Ansprechpartner bei Digital-Perfect",
  founderNote: "Lass uns herausfinden, was dein Unternehmen online weiterbringt.",
  founderPoints: [
    { title: "Direkter Austausch", text: "Du weißt jederzeit, wer sich um dein Projekt kümmert." },
    { title: "Verständliche Entscheidungen", text: "Wir besprechen, was sinnvoll ist und warum." },
  ],
  processKicker: "SO STARTEN WIR",
  processTitle: "Vom ersten Gespräch zum nächsten Schritt.",
  steps: [
    { title: "Kennenlernen", text: "Du erzählst von deinem Unternehmen, deiner aktuellen Website und deinen Zielen. Wir hören zu und stellen die richtigen Fragen." },
    { title: "Klarheit schaffen", text: "Wir prüfen deinen Bedarf und entwickeln ein passendes Vorgehen. Du erhältst ein individuelles Angebot mit verständlichem Umfang." },
    { title: "Gemeinsam umsetzen", text: "Nach deiner Freigabe setzen wir die vereinbarten Maßnahmen um. Du bleibst eingebunden und siehst, wie dein Projekt wächst." },
  ],
  faqKicker: "GUT ZU WISSEN",
  faqTitle: "Noch Fragen? Ganz normal.",
  faq: [
    { question: "Kann ich mit einer bestehenden Website anfragen?", answer: "Ja. Wir sehen uns an, was bereits gut funktioniert und wo sich Verbesserungen lohnen. Ein kompletter Neubau ist nicht automatisch notwendig." },
    { question: "Muss ich schon genau wissen, was ich brauche?", answer: "Nein. Beschreibe kurz deine Ausgangslage und dein Ziel. Im Erstgespräch klären wir gemeinsam, ob Webdesign, SEO, KI-Sichtbarkeit oder eine Kombination sinnvoll ist." },
    { question: "Wie entsteht mein individuelles Angebot?", answer: "Der Umfang richtet sich nach deiner Ausgangslage, deinen Zielen und den benötigten Leistungen. Nach dem Erstgespräch erhältst du ein Angebot mit klar beschriebenen nächsten Schritten." },
    { question: "Sind bestimmte Rankings garantiert?", answer: "Nein. Suchergebnisse und KI-Antworten hängen von vielen Faktoren ab. Wir arbeiten an einer sauberen technischen und inhaltlichen Grundlage und prüfen die Entwicklung, ohne feste Positionen zu versprechen." },
    { question: "Ist die Zusammenarbeit auch online möglich?", answer: "Ja. Abstimmung und Projektbesprechungen können online stattfinden. So können wir auch über die Region hinaus direkt zusammenarbeiten." },
  ],
  contactKicker: "DEIN NÄCHSTER SCHRITT",
  contactTitle: "Was möchtest du online erreichen?",
  contactText: "Erzähl uns kurz von deinem Unternehmen und deinem Vorhaben. Im kostenlosen Erstgespräch klären wir, wo du stehst und wie wir dich unterstützen können.",
  contactSignals: [
    { title: "Persönliche Rückmeldung", text: "Deine Anfrage landet direkt bei uns." },
    { title: "Offene Fragen willkommen", text: "Du brauchst noch keinen fertigen Projektplan." },
    { title: "Ein klarer nächster Schritt", text: "Wir besprechen, was für dein Vorhaben sinnvoll ist." },
  ],
  serviceOptions: ["Webdesign", "SEO & lokale Sichtbarkeit", "KI-Sichtbarkeit", "Ich möchte mich beraten lassen"],
  footerText: "Webdesign, SEO und KI-Sichtbarkeit. Persönliche Zusammenarbeit für einen digitalen Auftritt, der dein Unternehmen weiterbringt.",
};

export function resolveContactHomepage(value: unknown, siteId: string): ContactHomepageContent {
  let parsed = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); } catch { parsed = null; }
  }
  const defaults = { ...defaultContactHomepage, enabled: siteId === DEFAULT_SITE_ID, testimonials: siteId === DEFAULT_SITE_ID ? defaultContactHomepage.testimonials : [], showPortrait: siteId === DEFAULT_SITE_ID, portraitUrl: siteId === DEFAULT_SITE_ID ? defaultContactHomepage.portraitUrl : "" };
  const result = contactHomepageSchema.safeParse({ ...defaults, ...(parsed && typeof parsed === "object" ? parsed : {}) });
  return result.success ? result.data : defaults;
}

export function contactHomepageNavigation(content: ContactHomepageContent) {
  return ["leistungen", "referenzen", "ueber-markus", "ablauf", "kontakt"].map((anchor, index) => ({
    id: `contact-${anchor}`, label: content.navLabels[index], url: `#${anchor}`, parent_id: null, sort_order: index,
  }));
}
