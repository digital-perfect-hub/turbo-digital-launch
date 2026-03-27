import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Plus, Save, Trash2 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSiteContext } from "@/context/SiteContext";
import {
  defaultAudienceItems,
  defaultContactSectionContent,
  defaultIntroQuickWins,
  defaultProcessSteps,
  defaultSiteText,
  defaultTrustPoints,
  defaultWhyChoosePoints,
  type AudienceItem,
  type ContactSectionContent,
  type ContactTrustSignal,
  type IntroQuickWin,
  type ProcessStep,
  type TrustPoint,
  type WhyChoosePoint,
  useSiteSettings,
} from "@/hooks/useSiteSettings";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { upsertSiteSetting } from "@/lib/site-settings";
import SectionPreviewPanel from "@/components/admin/homepage/SectionPreviewPanel";
import SectionStyleEditor from "@/components/admin/homepage/SectionStyleEditor";
import {
  HOMEPAGE_SECTION_IDS,
  HOMEPAGE_SECTION_LABELS,
  createDefaultHomepageSectionStyle,
  createDefaultHomepageSectionStyles,
  parseHomepageSectionStyles,
  resolveHomepageSectionStyleVars,
  serializeHomepageSectionStyles,
  type HomepageSectionId,
  type HomepageSectionStyle,
  type HomepageSectionStyles,
} from "@/lib/homepage-section-styles";
import {
  DEFAULT_HOMEPAGE_SECTION_ORDER,
  moveHomepageSection,
  normalizeHomepageSectionOrder,
  serializeHomepageSectionOrder,
} from "@/lib/homepage-section-order";
import {
  createDefaultHomepageSectionVisibility,
  parseHomepageSectionVisibility,
  serializeHomepageSectionVisibility,
  type HomepageSectionVisibility,
} from "@/lib/site-ui-config";

type TextForm = Record<string, string>;

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    ["link"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const textFieldGroups: Array<{
  id: string;
  title: string;
  description: string;
  fields: Array<{ key: string; label: string; multiline?: boolean; rich?: boolean; rows?: number }>;
}> = [
  {
    id: "intro",
    title: "Intro",
    description: "Badge, Headline, HTML-Body, CTA und Quick-Wins der Intro-Sektion.",
    fields: [
      { key: "home_intro_badge", label: "Badge" },
      { key: "home_intro_title", label: "Titel" },
      { key: "home_intro_body", label: "Body", multiline: true, rich: true },
      { key: "home_intro_cta_text", label: "CTA Text" },
      { key: "home_intro_cta_link", label: "CTA Link" },
    ],
  },
  {
    id: "trust",
    title: "Trust",
    description: "Kicker, Titel, Beschreibung und Trust-Punkte für die Vertrauenssektion.",
    fields: [
      { key: "home_trust_kicker", label: "Kicker" },
      { key: "home_trust_title", label: "Titel" },
      { key: "home_trust_description", label: "Beschreibung", multiline: true, rows: 4 },
    ],
  },
  {
    id: "why-choose",
    title: "Why Choose",
    description: "Pitch-Block mit HTML-Body, CTA und strukturierter Vorteils-Liste.",
    fields: [
      { key: "home_why_choose_kicker", label: "Kicker" },
      { key: "home_why_choose_title", label: "Titel" },
      { key: "home_why_choose_body", label: "Body", multiline: true, rich: true },
      { key: "home_why_choose_cta_text", label: "CTA Text" },
      { key: "home_why_choose_cta_link", label: "CTA Link" },
    ],
  },
  {
    id: "audience",
    title: "Audience",
    description: "Zielgruppen-Block mit Badge-Text und Karten-Builder.",
    fields: [
      { key: "home_audience_kicker", label: "Kicker" },
      { key: "home_audience_title", label: "Titel" },
      { key: "home_audience_description", label: "Beschreibung", multiline: true, rows: 4 },
      { key: "home_audience_item_badge", label: "Karten-Badge" },
    ],
  },
  {
    id: "process",
    title: "Process",
    description: "Ablauf-Sektion mit CTA und Step-Builder.",
    fields: [
      { key: "home_process_kicker", label: "Kicker" },
      { key: "home_process_title", label: "Titel" },
      { key: "home_process_cta_text", label: "CTA Text" },
      { key: "home_process_cta_link", label: "CTA Link" },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    description: "Kontaktbereich mit Kicker, Titel, Description und kompletter Formular-Steuerung.",
    fields: [
      { key: "home_contact_kicker", label: "Kicker" },
      { key: "home_contact_title", label: "Titel" },
      { key: "home_contact_description", label: "Section Beschreibung", multiline: true, rows: 4 },
    ],
  },
  {
    id: "services",
    title: "Services Header",
    description: "Header-Texte für die Leistungen-Sektion.",
    fields: [
      { key: "home_services_kicker", label: "Kicker" },
      { key: "home_services_title", label: "Titel" },
      { key: "home_services_description", label: "Beschreibung", multiline: true, rows: 4 },
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio Header",
    description: "Header-Texte für die Portfolio-Sektion.",
    fields: [
      { key: "home_portfolio_kicker", label: "Kicker" },
      { key: "home_portfolio_title", label: "Titel" },
    ],
  },
  {
    id: "shop",
    title: "Shop Header",
    description: "Kicker, Titel und Beschreibung des Shop-Blocks.",
    fields: [
      { key: "home_shop_kicker", label: "Kicker" },
      { key: "home_shop_title", label: "Titel" },
      { key: "home_shop_description", label: "Beschreibung", multiline: true, rows: 4 },
    ],
  },
  {
    id: "team",
    title: "Team Header",
    description: "Texte über der Team-Sektion.",
    fields: [
      { key: "home_team_kicker", label: "Kicker" },
      { key: "home_team_title", label: "Titel" },
      { key: "home_team_description", label: "Beschreibung", multiline: true, rows: 4 },
    ],
  },
  {
    id: "testimonials",
    title: "Testimonials Header",
    description: "Texte über den Testimonials.",
    fields: [
      { key: "home_testimonials_kicker", label: "Kicker" },
      { key: "home_testimonials_title", label: "Titel" },
      { key: "home_testimonials_description", label: "Beschreibung", multiline: true, rows: 4 },
    ],
  },
  {
    id: "faq",
    title: "FAQ Header",
    description: "Kicker und Titel der FAQ-Sektion.",
    fields: [
      { key: "home_faq_kicker", label: "Kicker" },
      { key: "home_faq_title", label: "Titel" },
    ],
  },
  {
    id: "forum",
    title: "Forum Teaser",
    description: "Forum-Teaser kann jetzt ebenfalls in der Reihenfolge verschoben und farblich überschrieben werden.",
    fields: [],
  },
];

const arrayDefaults = {
  home_intro_quick_wins: defaultIntroQuickWins,
  home_trust_points: defaultTrustPoints,
  home_why_choose_points: defaultWhyChoosePoints,
  home_audience_items: defaultAudienceItems,
  home_process_steps: defaultProcessSteps,
};

const resolveSetting = (settings: Record<string, unknown>, key: string, fallback: string) => {
  const value = settings[key];
  if (typeof value === "string" && value.trim()) return value;
  if (value === null || value === undefined) return defaultSiteText[key] || fallback;
  return String(value);
};

const parseJsonSetting = <T,>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value as T;

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const resolveJsonSetting = <T,>(settings: Record<string, unknown>, key: string, fallback: T): T => {
  return parseJsonSetting(settings[key], fallback);
};

const createEmptyQuickWin = (): IntroQuickWin => ({
  icon: "layers",
  title: "",
  text: "",
});

const createEmptyTrustPoint = (): TrustPoint => ({
  icon: "users",
  title: "",
  desc: "",
});

const createEmptyWhyChoosePoint = (): WhyChoosePoint => ({
  title: "",
  description: "",
});

const createEmptyAudienceItem = (): AudienceItem => ({
  emoji: "✨",
  title: "",
  description: "",
  bullets: [""],
});

const createEmptyProcessStep = (stepNumber: number): ProcessStep => ({
  step: String(stepNumber).padStart(2, "0"),
  time: "",
  title: "",
  description: "",
});

const createEmptyTrustSignal = (): ContactTrustSignal => ({
  icon: "clock",
  title: "",
  text: "",
});

const normalizeAudienceItems = (items: AudienceItem[]) =>
  items.map((item) => ({
    ...item,
    bullets: Array.isArray(item.bullets) && item.bullets.length ? item.bullets : [""],
  }));

const normalizeContactContent = (value: ContactSectionContent): ContactSectionContent => ({
  panel_description: value.panel_description || "",
  trust_signals:
    value.trust_signals?.length > 0
      ? value.trust_signals.map((signal) => ({
          icon: signal.icon || "clock",
          title: signal.title || "",
          text: signal.text || "",
        }))
      : defaultContactSectionContent.trust_signals,
  labels: {
    ...defaultContactSectionContent.labels,
    ...(value.labels || {}),
  },
  placeholders: {
    ...defaultContactSectionContent.placeholders,
    ...(value.placeholders || {}),
  },
  service_options:
    value.service_options?.length > 0 ? value.service_options : defaultContactSectionContent.service_options,
  budget_options:
    value.budget_options?.length > 0 ? value.budget_options : defaultContactSectionContent.budget_options,
  submit_text: value.submit_text || defaultContactSectionContent.submit_text,
  submitting_text: value.submitting_text || defaultContactSectionContent.submitting_text,
  success_title: value.success_title || defaultContactSectionContent.success_title,
  success_text: value.success_text || defaultContactSectionContent.success_text,
  success_toast_title: value.success_toast_title || defaultContactSectionContent.success_toast_title,
  success_toast_description:
    value.success_toast_description || defaultContactSectionContent.success_toast_description,
  error_toast_title: value.error_toast_title || defaultContactSectionContent.error_toast_title,
  error_toast_description: value.error_toast_description || defaultContactSectionContent.error_toast_description,
});

const SectionHeader = ({
  title,
  description,
  pill,
}: {
  title: string;
  description: string;
  pill?: string;
}) => (
  <div className="mb-6">
    {pill ? (
      <span className="mb-3 inline-flex rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4B2C]">
        {pill}
      </span>
    ) : null}
    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
  </div>
);

const AdminHomepage = () => {
  const queryClient = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { settings, isLoading } = useSiteSettings();

  const [textForm, setTextForm] = useState<TextForm>({});
  const [introQuickWins, setIntroQuickWins] = useState<IntroQuickWin[]>(defaultIntroQuickWins);
  const [trustPoints, setTrustPoints] = useState<TrustPoint[]>(defaultTrustPoints);
  const [whyChoosePoints, setWhyChoosePoints] = useState<WhyChoosePoint[]>(defaultWhyChoosePoints);
  const [audienceItems, setAudienceItems] = useState<AudienceItem[]>(defaultAudienceItems);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(defaultProcessSteps);
  const [contactContent, setContactContent] = useState<ContactSectionContent>(defaultContactSectionContent);
  const [sectionStyles, setSectionStyles] = useState<HomepageSectionStyles>(createDefaultHomepageSectionStyles());
  const [sectionOrder, setSectionOrder] = useState<HomepageSectionId[]>(DEFAULT_HOMEPAGE_SECTION_ORDER);
  const [sectionVisibility, setSectionVisibility] = useState<HomepageSectionVisibility>(createDefaultHomepageSectionVisibility());
  const [activeSection, setActiveSection] = useState<string>(textFieldGroups[0]?.id || "intro");
  const [canSlideLeft, setCanSlideLeft] = useState(false);
  const [canSlideRight, setCanSlideRight] = useState(true);
  const sectionSliderRef = useRef<HTMLDivElement | null>(null);
  const sectionCardRefs = useRef<Partial<Record<HomepageSectionId, HTMLDivElement | null>>>({});

  useEffect(() => {
    if (isLoading) return;

    const initialTextForm: TextForm = {};
    textFieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        initialTextForm[field.key] = resolveSetting(settings, field.key, defaultSiteText[field.key] || "");
      });
    });

    setTextForm(initialTextForm);
    setIntroQuickWins(resolveJsonSetting(settings, "home_intro_quick_wins", arrayDefaults.home_intro_quick_wins));
    setTrustPoints(resolveJsonSetting(settings, "home_trust_points", arrayDefaults.home_trust_points));
    setWhyChoosePoints(resolveJsonSetting(settings, "home_why_choose_points", arrayDefaults.home_why_choose_points));
    setAudienceItems(
      normalizeAudienceItems(resolveJsonSetting(settings, "home_audience_items", arrayDefaults.home_audience_items)),
    );
    setProcessSteps(resolveJsonSetting(settings, "home_process_steps", arrayDefaults.home_process_steps));
    setContactContent(
      normalizeContactContent(
        resolveJsonSetting(settings, "contact_section_content", defaultContactSectionContent),
      ),
    );
    setSectionStyles(parseHomepageSectionStyles(settings.home_section_styles));
    setSectionOrder(normalizeHomepageSectionOrder(settings.home_section_order));
    setSectionVisibility(parseHomepageSectionVisibility(settings.home_section_visibility));
  }, [isLoading, settings]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Array<[string, string]> = [
        ...((Object.entries(textForm) as Array<[string, string]>)),
        ["home_intro_quick_wins", JSON.stringify(introQuickWins)],
        ["home_trust_points", JSON.stringify(trustPoints)],
        ["home_why_choose_points", JSON.stringify(whyChoosePoints)],
        ["home_audience_items", JSON.stringify(audienceItems)],
        ["home_process_steps", JSON.stringify(processSteps)],
        ["contact_section_content", JSON.stringify(contactContent)],
        ["home_section_styles", serializeHomepageSectionStyles(sectionStyles)],
        ["home_section_order", serializeHomepageSectionOrder(sectionOrder)],
        ["home_section_visibility", serializeHomepageSectionVisibility(sectionVisibility)],
      ];

      await Promise.all(payload.map(([key, value]) => upsertSiteSetting(siteId, key, value)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings", siteId] });
      toast.success("Homepage-Inhalte erfolgreich gespeichert.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Fehler beim Speichern.");
    },
  });

  const updateTextField = (key: string, value: string) => {
    setTextForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateQuickWin = (index: number, field: keyof IntroQuickWin, value: string) => {
    setIntroQuickWins((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const updateTrustPoint = (index: number, field: keyof TrustPoint, value: string) => {
    setTrustPoints((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const updateWhyChoosePoint = (index: number, field: keyof WhyChoosePoint, value: string) => {
    setWhyChoosePoints((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const updateAudienceItem = (index: number, field: keyof Omit<AudienceItem, "bullets">, value: string) => {
    setAudienceItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const updateAudienceBullet = (itemIndex: number, bulletIndex: number, value: string) => {
    setAudienceItems((prev) =>
      prev.map((item, index) => {
        if (index !== itemIndex) return item;
        const nextBullets = [...item.bullets];
        nextBullets[bulletIndex] = value;
        return { ...item, bullets: nextBullets };
      }),
    );
  };

  const addAudienceBullet = (itemIndex: number) => {
    setAudienceItems((prev) =>
      prev.map((item, index) => (index === itemIndex ? { ...item, bullets: [...item.bullets, ""] } : item)),
    );
  };

  const removeAudienceBullet = (itemIndex: number, bulletIndex: number) => {
    setAudienceItems((prev) =>
      prev.map((item, index) => {
        if (index !== itemIndex) return item;
        const nextBullets = item.bullets.filter((_, currentIndex) => currentIndex !== bulletIndex);
        return { ...item, bullets: nextBullets.length ? nextBullets : [""] };
      }),
    );
  };

  const updateProcessStep = (index: number, field: keyof ProcessStep, value: string) => {
    setProcessSteps((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const updateContactTrustSignal = (index: number, field: keyof ContactTrustSignal, value: string) => {
    setContactContent((prev) => ({
      ...prev,
      trust_signals: prev.trust_signals.map((signal, signalIndex) =>
        signalIndex === index ? { ...signal, [field]: value } : signal,
      ),
    }));
  };

  const updateContactLabel = (key: keyof ContactSectionContent["labels"], value: string) => {
    setContactContent((prev) => ({
      ...prev,
      labels: {
        ...prev.labels,
        [key]: value,
      },
    }));
  };

  const updateContactPlaceholder = (key: keyof ContactSectionContent["placeholders"], value: string) => {
    setContactContent((prev) => ({
      ...prev,
      placeholders: {
        ...prev.placeholders,
        [key]: value,
      },
    }));
  };

  const addListItem = <T,>(setter: Dispatch<SetStateAction<T[]>>, createItem: () => T) => {
    setter((prev) => [...prev, createItem()]);
  };

  const removeListItem = <T,>(setter: Dispatch<SetStateAction<T[]>>, index: number) => {
    setter((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateSectionStyle = (sectionId: HomepageSectionId, nextStyle: HomepageSectionStyle) => {
    setSectionStyles((prev) => ({
      ...prev,
      [sectionId]: nextStyle,
    }));
  };

  const moveSection = (sectionId: HomepageSectionId, direction: "up" | "down") => {
    setSectionOrder((prev) => moveHomepageSection(prev, sectionId, direction));
  };

const toggleSectionVisibility = (sectionId: HomepageSectionId, checked: boolean) => {
    setSectionVisibility((prev) => ({ ...prev, [sectionId]: checked }));
  };

  const activeSectionId = (HOMEPAGE_SECTION_IDS.includes(activeSection as HomepageSectionId)
    ? activeSection
    : textFieldGroups[0]?.id || "intro") as HomepageSectionId;

  const activeGroup =
    textFieldGroups.find((group) => group.id === activeSectionId) ??
    textFieldGroups[0] ?? {
      id: "intro",
      title: "Intro",
      description: "",
      fields: [],
    };

  const activeSectionStyle = sectionStyles[activeSectionId] ?? createDefaultHomepageSectionStyle();
  const groupMap = textFieldGroups.reduce<Record<string, (typeof textFieldGroups)[number]>>((acc, group) => {
    acc[group.id] = group;
    return acc;
  }, {});
  const orderedSectionGroups = sectionOrder
    .map((sectionId) => groupMap[sectionId])
    .filter(Boolean) as typeof textFieldGroups;

  const syncSectionSliderState = () => {
    const slider = sectionSliderRef.current;
    if (!slider) {
      setCanSlideLeft(false);
      setCanSlideRight(false);
      return;
    }

    const maxScrollLeft = Math.max(0, slider.scrollWidth - slider.clientWidth - 4);
    setCanSlideLeft(slider.scrollLeft > 8);
    setCanSlideRight(slider.scrollLeft < maxScrollLeft);
  };

  const slideSectionCards = (direction: "left" | "right") => {
    const slider = sectionSliderRef.current;
    if (!slider) return;

    const slideAmount = Math.max(slider.clientWidth * 0.82, 320);
    slider.scrollBy({
      left: direction === "left" ? -slideAmount : slideAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    syncSectionSliderState();

    const slider = sectionSliderRef.current;
    if (!slider) return;

    const handleScroll = () => syncSectionSliderState();
    const handleResize = () => syncSectionSliderState();

    slider.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      slider.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [orderedSectionGroups.length]);

  useEffect(() => {
    const activeCard = sectionCardRefs.current[activeSectionId];
    if (!activeCard) return;

    activeCard.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeSectionId]);

  const stripHtmlForPreview = (value: string) =>
    value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const getPreviewPayload = (sectionId: HomepageSectionId) => {
    if (sectionId === "contact") {
      return {
        badge: textForm.home_contact_kicker || "Kontakt",
        title: textForm.home_contact_title || "Lass uns sprechen.",
        description:
          textForm.home_contact_description || contactContent.panel_description || defaultContactSectionContent.panel_description,
        ctaText: contactContent.submit_text || defaultContactSectionContent.submit_text,
      };
    }

    if (sectionId === "intro") {
      return {
        badge: textForm.home_intro_badge || "Premium Setup",
        title: textForm.home_intro_title || "Mehr Vertrauen und Anfragen.",
        description: stripHtmlForPreview(textForm.home_intro_body || ""),
        ctaText: textForm.home_intro_cta_text || "Jetzt starten",
      };
    }

    if (sectionId === "why-choose") {
      return {
        badge: textForm.home_why_choose_kicker || "Warum wir",
        title: textForm.home_why_choose_title || "Sauberer Aufbau statt Theme-Chaos.",
        description: stripHtmlForPreview(textForm.home_why_choose_body || ""),
        ctaText: textForm.home_why_choose_cta_text || "Projekt besprechen",
      };
    }

    if (sectionId === "process") {
      return {
        badge: textForm.home_process_kicker || "Ablauf",
        title: textForm.home_process_title || "Vom ersten Signal bis zur Umsetzung.",
        description: processSteps[0]?.description || "Hier wird live simuliert, wie deine Farblogik im Ablaufbereich wirkt.",
        ctaText: textForm.home_process_cta_text || "Ablauf starten",
      };
    }

    const fallbackMap: Record<string, { badge: string; title: string; description: string; ctaText: string }> = {
      trust: {
        badge: textForm.home_trust_kicker || "Vertrauen",
        title: textForm.home_trust_title || "Sichtbar professionell.",
        description: textForm.home_trust_description || "Subcopy und Vertrauensargumente werden hier simuliert.",
        ctaText: "Mehr sehen",
      },
      audience: {
        badge: textForm.home_audience_kicker || "Zielgruppe",
        title: textForm.home_audience_title || "Für die richtigen Kunden gebaut.",
        description: textForm.home_audience_description || "Karten und Bullets der Audience-Sektion werden hier sichtbar.",
        ctaText: "Mehr erfahren",
      },
      services: {
        badge: textForm.home_services_kicker || "Leistungen",
        title: textForm.home_services_title || "Premium Services mit System.",
        description: textForm.home_services_description || "Service-Karten und ihre Farben werden live angedeutet.",
        ctaText: "Services ansehen",
      },
      portfolio: {
        badge: textForm.home_portfolio_kicker || "Ergebnisse",
        title: textForm.home_portfolio_title || "Cases, die verkaufen.",
        description: "Portfolio-Karten, Overlay und Textkontraste werden live getestet.",
        ctaText: "Cases ansehen",
      },
      shop: {
        badge: textForm.home_shop_kicker || "Produkte",
        title: textForm.home_shop_title || "Angebote & Pakete sauber präsentieren.",
        description: textForm.home_shop_description || "Produktkarten, Preise und CTA-Kontraste werden live dargestellt.",
        ctaText: "Zum Angebot",
      },
      team: {
        badge: textForm.home_team_kicker || "Team",
        title: textForm.home_team_title || "Menschen hinter Strategie und Umsetzung.",
        description: textForm.home_team_description || "Avatare, Meta-Texte und Card-Kontraste werden simuliert.",
        ctaText: "Team ansehen",
      },
      testimonials: {
        badge: textForm.home_testimonials_kicker || "Testimonials",
        title: textForm.home_testimonials_title || "Echte Stimmen, sauber inszeniert.",
        description: textForm.home_testimonials_description || "Bewertungskarten und Social Proof im Live-Look.",
        ctaText: "Mehr Stimmen",
      },
      faq: {
        badge: textForm.home_faq_kicker || "FAQ",
        title: textForm.home_faq_title || "Fragen direkt sauber beantworten.",
        description: "Akkordeons, Borders und Flächentöne werden im Live-Modus dargestellt.",
        ctaText: "FAQ öffnen",
      },
      forum: {
        badge: "Forum",
        title: "Community, Fragen und Support sichtbar teasern.",
        description: "Teaser-Karte, Thread-Liste und CTA können in der Reihenfolge mitgezogen werden.",
        ctaText: "Forum öffnen",
      },
    };

    return fallbackMap[sectionId] || {
      badge: activeGroup.title,
      title: activeGroup.title,
      description: activeGroup.description,
      ctaText: "Mehr sehen",
    };
  };


  const baseFieldClass = "min-w-0 rounded-xl border-slate-200 bg-white focus:border-[#FF4B2C]";
  const baseTextareaClass = "min-w-0 rounded-xl border-slate-200 bg-white focus:border-[#FF4B2C]";
  const baseSelectClass =
    "min-w-0 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#FF4B2C]";
  const fieldCardClass = "min-w-0 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4";
  const builderSectionClass = "rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm";
  const builderItemCardClass = "relative min-w-0 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4";
  const subPanelClass = "min-w-0 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4";
  const deleteIconButtonClass =
    "h-9 w-9 rounded-xl border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40";
  const addButtonClass =
    "mt-4 rounded-xl border-dashed border-[#FF4B2C]/35 text-[#FF4B2C] hover:bg-[#FF4B2C]/5";

  const isWideTextField = (field: { key: string; multiline?: boolean; rich?: boolean }) =>
    field.multiline || field.rich || field.key.endsWith("_title");

  const renderTextFields = () => {
    if (!activeGroup.fields.length) {
      return (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
          Für diese Sektion gibt es aktuell keinen separaten Text-Builder. Reihenfolge und Design-Override funktionieren trotzdem ganz normal.
        </div>
      );
    }

    return (
      <div className="grid min-w-0 gap-6 md:grid-cols-2">
        {activeGroup.fields.map((field) => {
          const isWide = isWideTextField(field);

          return (
            <div
              key={field.key}
              className={`${fieldCardClass} ${isWide ? "md:col-span-2" : ""}`}
            >
              <div className="min-w-0 space-y-2">
                <Label htmlFor={field.key} className="text-sm font-semibold text-slate-700">
                  {field.label}
                </Label>

                {field.rich ? (
                  <div className="admin-rich-editor min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white [&_.ql-container]:min-h-[220px] [&_.ql-container]:border-0 [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200">
                    <ReactQuill
                      theme="snow"
                      modules={quillModules}
                      value={textForm[field.key] || ""}
                      onChange={(value) => updateTextField(field.key, value)}
                    />
                  </div>
                ) : field.multiline ? (
                  <Textarea
                    id={field.key}
                    rows={field.rows || 5}
                    className={baseTextareaClass}
                    value={textForm[field.key] || ""}
                    onChange={(event) => updateTextField(field.key, event.target.value)}
                  />
                ) : (
                  <Input
                    id={field.key}
                    className={baseFieldClass}
                    value={textForm[field.key] || ""}
                    onChange={(event) => updateTextField(field.key, event.target.value)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStructureTab = () => {
    if (activeSectionId === "intro") {
      return (
        <div className={builderSectionClass}>
          <SectionHeader pill="JSON Builder" title="Quick-Wins" description="Die rechten Karten der Intro-Sektion." />
          <div className="space-y-4">
            {introQuickWins.map((item, index) => (
              <div key={`quick-win-${index}`} className={builderItemCardClass}>
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={deleteIconButtonClass}
                    onClick={() => removeListItem(setIntroQuickWins, index)}
                    disabled={introQuickWins.length === 1}
                    aria-label={`Quick-Win ${index + 1} entfernen`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="mb-5 pr-12">
                  <p className="text-sm font-semibold text-slate-700">Quick-Win #{index + 1}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Icon, Titel und Subtext dieser Intro-Kachel.
                  </p>
                </div>

                <div className="grid min-w-0 gap-6 md:grid-cols-2">
                  <div className="min-w-0 space-y-2">
                    <Label>Icon</Label>
                    <select
                      className={baseSelectClass}
                      value={item.icon || "layers"}
                      onChange={(event) => updateQuickWin(index, "icon", event.target.value)}
                    >
                      <option value="layers">layers</option>
                      <option value="search">search</option>
                      <option value="zap">zap</option>
                      <option value="shield">shield</option>
                      <option value="sparkles">sparkles</option>
                    </select>
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label>Titel</Label>
                    <Input
                      className={baseFieldClass}
                      value={item.title}
                      onChange={(event) => updateQuickWin(index, "title", event.target.value)}
                    />
                  </div>
                  <div className="min-w-0 space-y-2 md:col-span-2">
                    <Label>Text</Label>
                    <Textarea
                      rows={3}
                      className={baseTextareaClass}
                      value={item.text}
                      onChange={(event) => updateQuickWin(index, "text", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className={addButtonClass}
            onClick={() => addListItem(setIntroQuickWins, createEmptyQuickWin)}
          >
            <Plus size={15} className="mr-2" />
            Quick-Win hinzufügen
          </Button>
        </div>
      );
    }

    if (activeSectionId === "trust") {
      return (
        <div className={builderSectionClass}>
          <SectionHeader pill="JSON Builder" title="Trust-Punkte" description="Die vier Vertrauens-Karten direkt unter dem Intro." />
          <div className="space-y-4">
            {trustPoints.map((item, index) => (
              <div key={`trust-point-${index}`} className={builderItemCardClass}>
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={deleteIconButtonClass}
                    onClick={() => removeListItem(setTrustPoints, index)}
                    disabled={trustPoints.length === 1}
                    aria-label={`Trust-Punkt ${index + 1} entfernen`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="mb-5 pr-12">
                  <p className="text-sm font-semibold text-slate-700">Trust-Punkt #{index + 1}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Icon, Headline und Beschreibung der Vertrauens-Kachel.
                  </p>
                </div>

                <div className="grid min-w-0 gap-6 md:grid-cols-2">
                  <div className="min-w-0 space-y-2">
                    <Label>Icon</Label>
                    <select
                      className={baseSelectClass}
                      value={item.icon || "users"}
                      onChange={(event) => updateTrustPoint(index, "icon", event.target.value)}
                    >
                      <option value="users">users</option>
                      <option value="gauge">gauge</option>
                      <option value="chart">chart</option>
                      <option value="shield">shield</option>
                    </select>
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label>Titel</Label>
                    <Input
                      className={baseFieldClass}
                      value={item.title}
                      onChange={(event) => updateTrustPoint(index, "title", event.target.value)}
                    />
                  </div>
                  <div className="min-w-0 space-y-2 md:col-span-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      rows={3}
                      className={baseTextareaClass}
                      value={item.desc}
                      onChange={(event) => updateTrustPoint(index, "desc", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className={addButtonClass}
            onClick={() => addListItem(setTrustPoints, createEmptyTrustPoint)}
          >
            <Plus size={15} className="mr-2" />
            Trust-Punkt hinzufügen
          </Button>
        </div>
      );
    }

    if (activeSectionId === "why-choose") {
      return (
        <div className={builderSectionClass}>
          <SectionHeader pill="JSON Builder" title="Why-Choose Punkte" description="Die Benefit-Karten der Why-Choose-Sektion." />
          <div className="space-y-4">
            {whyChoosePoints.map((item, index) => (
              <div key={`why-choose-${index}`} className={builderItemCardClass}>
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={deleteIconButtonClass}
                    onClick={() => removeListItem(setWhyChoosePoints, index)}
                    disabled={whyChoosePoints.length === 1}
                    aria-label={`Why-Choose Punkt ${index + 1} entfernen`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="mb-5 pr-12">
                  <p className="text-sm font-semibold text-slate-700">Punkt #{index + 1}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Benefit-Titel und Beschreibung für diese Karte.
                  </p>
                </div>

                <div className="grid min-w-0 gap-6 md:grid-cols-2">
                  <div className="min-w-0 space-y-2 md:col-span-2">
                    <Label>Titel</Label>
                    <Input
                      className={baseFieldClass}
                      value={item.title}
                      onChange={(event) => updateWhyChoosePoint(index, "title", event.target.value)}
                    />
                  </div>
                  <div className="min-w-0 space-y-2 md:col-span-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      rows={4}
                      className={baseTextareaClass}
                      value={item.description}
                      onChange={(event) => updateWhyChoosePoint(index, "description", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className={addButtonClass}
            onClick={() => addListItem(setWhyChoosePoints, createEmptyWhyChoosePoint)}
          >
            <Plus size={15} className="mr-2" />
            Punkt hinzufügen
          </Button>
        </div>
      );
    }

    if (activeSectionId === "audience") {
      return (
        <div className={builderSectionClass}>
          <SectionHeader pill="JSON Builder" title="Audience-Karten" description="Emoji, Titel, Beschreibung und Bullets für die Zielgruppen-Sektion." />
          <div className="space-y-4">
            {audienceItems.map((item, index) => (
              <div key={`audience-${index}`} className={builderItemCardClass}>
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={deleteIconButtonClass}
                    onClick={() => removeListItem(setAudienceItems, index)}
                    disabled={audienceItems.length === 1}
                    aria-label={`Audience-Karte ${index + 1} entfernen`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="mb-5 pr-12">
                  <p className="text-sm font-semibold text-slate-700">Audience-Karte #{index + 1}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Emoji, Headline, Beschreibung und die zugehörigen Bullet-Argumente.
                  </p>
                </div>

                <div className="grid min-w-0 gap-6 md:grid-cols-2">
                  <div className="min-w-0 space-y-2">
                    <Label>Emoji</Label>
                    <Input
                      className={baseFieldClass}
                      value={item.emoji}
                      onChange={(event) => updateAudienceItem(index, "emoji", event.target.value)}
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label>Titel</Label>
                    <Input
                      className={baseFieldClass}
                      value={item.title}
                      onChange={(event) => updateAudienceItem(index, "title", event.target.value)}
                    />
                  </div>
                  <div className="min-w-0 space-y-2 md:col-span-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      rows={3}
                      className={baseTextareaClass}
                      value={item.description}
                      onChange={(event) => updateAudienceItem(index, "description", event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-5 min-w-0 rounded-[1.25rem] border border-dashed border-slate-200 bg-white/80 p-4">
                  <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700">Bullets</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Jede Aussage bleibt in einer eigenen Zeile stabil und bricht keine URLs oder langen Texte.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-[#FF4B2C]/20 text-[#FF4B2C] hover:bg-[#FF4B2C]/5"
                      onClick={() => addAudienceBullet(index)}
                    >
                      <Plus size={14} className="mr-2" />
                      Bullet
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {item.bullets.map((bullet, bulletIndex) => (
                      <div
                        key={`audience-bullet-${index}-${bulletIndex}`}
                        className="grid min-w-0 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <div className="min-w-0 space-y-2">
                          <Label>Bullet #{bulletIndex + 1}</Label>
                          <Input
                            className={baseFieldClass}
                            value={bullet}
                            onChange={(event) => updateAudienceBullet(index, bulletIndex, event.target.value)}
                          />
                        </div>
                        <div className="flex items-end md:justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className={deleteIconButtonClass}
                            onClick={() => removeAudienceBullet(index, bulletIndex)}
                            disabled={item.bullets.length === 1}
                            aria-label={`Audience-Bullet ${bulletIndex + 1} entfernen`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className={addButtonClass}
            onClick={() => addListItem(setAudienceItems, createEmptyAudienceItem)}
          >
            <Plus size={15} className="mr-2" />
            Audience-Karte hinzufügen
          </Button>
        </div>
      );
    }

    if (activeSectionId === "process") {
      return (
        <div className={builderSectionClass}>
          <SectionHeader pill="JSON Builder" title="Process-Steps" description="Ablaufkarten mit Step, Zeit, Titel und Beschreibung." />
          <div className="space-y-4">
            {processSteps.map((item, index) => (
              <div key={`process-step-${index}`} className={builderItemCardClass}>
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={deleteIconButtonClass}
                    onClick={() => removeListItem(setProcessSteps, index)}
                    disabled={processSteps.length === 1}
                    aria-label={`Process-Step ${index + 1} entfernen`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="mb-5 pr-12">
                  <p className="text-sm font-semibold text-slate-700">Step #{index + 1}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Reihenfolge, Timing und Beschreibung dieses Prozess-Schritts.
                  </p>
                </div>

                <div className="grid min-w-0 gap-6 md:grid-cols-2">
                  <div className="min-w-0 space-y-2">
                    <Label>Step Nummer</Label>
                    <Input
                      className={baseFieldClass}
                      value={item.step}
                      onChange={(event) => updateProcessStep(index, "step", event.target.value)}
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label>Zeit</Label>
                    <Input
                      className={baseFieldClass}
                      value={item.time || ""}
                      onChange={(event) => updateProcessStep(index, "time", event.target.value)}
                    />
                  </div>
                  <div className="min-w-0 space-y-2 md:col-span-2">
                    <Label>Titel</Label>
                    <Input
                      className={baseFieldClass}
                      value={item.title}
                      onChange={(event) => updateProcessStep(index, "title", event.target.value)}
                    />
                  </div>
                  <div className="min-w-0 space-y-2 md:col-span-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      rows={4}
                      className={baseTextareaClass}
                      value={item.description}
                      onChange={(event) => updateProcessStep(index, "description", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className={addButtonClass}
            onClick={() => addListItem(setProcessSteps, () => createEmptyProcessStep(processSteps.length + 1))}
          >
            <Plus size={15} className="mr-2" />
            Step hinzufügen
          </Button>
        </div>
      );
    }

    if (activeSectionId === "contact") {
      return (
        <Accordion type="multiple" defaultValue={["panel", "signals", "labels"]} className="space-y-4">
          <AccordionItem value="panel" className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white px-5 shadow-sm">
            <AccordionTrigger className="py-5 text-left hover:no-underline">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Dark Panel</h3>
                <p className="mt-1 text-sm text-slate-500">Linke Kontakt-Spalte mit Beschreibung und Trust-Signalen.</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-5">
                <div className={subPanelClass}>
                  <div className="min-w-0 space-y-2">
                    <Label>Panel Beschreibung</Label>
                    <Textarea
                      rows={5}
                      className={baseTextareaClass}
                      value={contactContent.panel_description}
                      onChange={(event) => setContactContent((prev) => ({ ...prev, panel_description: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {contactContent.trust_signals.map((signal, index) => (
                    <div key={`contact-signal-${index}`} className={builderItemCardClass}>
                      <div className="absolute right-4 top-4 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className={deleteIconButtonClass}
                          onClick={() =>
                            setContactContent((prev) => ({
                              ...prev,
                              trust_signals: prev.trust_signals.filter((_, signalIndex) => signalIndex !== index),
                            }))
                          }
                          disabled={contactContent.trust_signals.length === 1}
                          aria-label={`Kontakt-Signal ${index + 1} entfernen`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>

                      <div className="mb-5 pr-12">
                        <p className="text-sm font-semibold text-slate-700">Signal #{index + 1}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          Vertrauenselement für die linke Kontaktspalte.
                        </p>
                      </div>

                      <div className="grid min-w-0 gap-6 md:grid-cols-2">
                        <div className="min-w-0 space-y-2">
                          <Label>Icon</Label>
                          <select
                            className={baseSelectClass}
                            value={signal.icon}
                            onChange={(event) => updateContactTrustSignal(index, "icon", event.target.value)}
                          >
                            <option value="clock">clock</option>
                            <option value="phone">phone</option>
                            <option value="mail">mail</option>
                          </select>
                        </div>
                        <div className="min-w-0 space-y-2">
                          <Label>Titel</Label>
                          <Input
                            className={baseFieldClass}
                            value={signal.title}
                            onChange={(event) => updateContactTrustSignal(index, "title", event.target.value)}
                          />
                        </div>
                        <div className="min-w-0 space-y-2 md:col-span-2">
                          <Label>Text</Label>
                          <Textarea
                            rows={3}
                            className={baseTextareaClass}
                            value={signal.text}
                            onChange={(event) => updateContactTrustSignal(index, "text", event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-dashed border-[#FF4B2C]/35 text-[#FF4B2C] hover:bg-[#FF4B2C]/5"
                    onClick={() =>
                      setContactContent((prev) => ({
                        ...prev,
                        trust_signals: [...prev.trust_signals, createEmptyTrustSignal()],
                      }))
                    }
                  >
                    <Plus size={15} className="mr-2" />
                    Trust-Signal hinzufügen
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="labels" className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white px-5 shadow-sm">
            <AccordionTrigger className="py-5 text-left hover:no-underline">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Labels & Placeholders</h3>
                <p className="mt-1 text-sm text-slate-500">Alle Formular-Texte zentral pflegen.</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="grid min-w-0 gap-6 md:grid-cols-2">
                <div className={subPanelClass}>
                  <h4 className="mb-4 font-bold text-slate-900">Form Labels</h4>
                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    {Object.entries(contactContent.labels).map(([key, value]) => (
                      <div key={key} className="min-w-0 space-y-2">
                        <Label>{key}</Label>
                        <Input
                          className={baseFieldClass}
                          value={value}
                          onChange={(event) =>
                            updateContactLabel(key as keyof ContactSectionContent["labels"], event.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={subPanelClass}>
                  <h4 className="mb-4 font-bold text-slate-900">Placeholders</h4>
                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    {Object.entries(contactContent.placeholders).map(([key, value]) => (
                      <div key={key} className="min-w-0 space-y-2">
                        <Label>{key}</Label>
                        <Input
                          className={baseFieldClass}
                          value={value}
                          onChange={(event) =>
                            updateContactPlaceholder(key as keyof ContactSectionContent["placeholders"], event.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="options" className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white px-5 shadow-sm">
            <AccordionTrigger className="py-5 text-left hover:no-underline">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Auswahlfelder & Status-Texte</h3>
                <p className="mt-1 text-sm text-slate-500">Service-/Budget-Optionen sowie Submit, Success und Error-Meldungen.</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-6">
                <div className="grid min-w-0 gap-6 md:grid-cols-2">
                  <div className={subPanelClass}>
                    <h4 className="mb-4 font-bold text-slate-900">Service Optionen</h4>
                    <Textarea
                      rows={8}
                      className={`${baseTextareaClass} font-mono text-sm`}
                      value={contactContent.service_options.join("\n")}
                      onChange={(event) =>
                        setContactContent((prev) => ({
                          ...prev,
                          service_options: event.target.value
                            .split("\n")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        }))
                      }
                    />
                  </div>

                  <div className={subPanelClass}>
                    <h4 className="mb-4 font-bold text-slate-900">Budget Optionen</h4>
                    <Textarea
                      rows={8}
                      className={`${baseTextareaClass} font-mono text-sm`}
                      value={contactContent.budget_options.join("\n")}
                      onChange={(event) =>
                        setContactContent((prev) => ({
                          ...prev,
                          budget_options: event.target.value
                            .split("\n")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className={subPanelClass}>
                  <h4 className="mb-4 font-bold text-slate-900">Submit / Success / Toasts</h4>
                  <div className="grid min-w-0 gap-6 md:grid-cols-2">
                    <div className="min-w-0 space-y-2">
                      <Label>Submit Text</Label>
                      <Input
                        className={baseFieldClass}
                        value={contactContent.submit_text}
                        onChange={(event) => setContactContent((prev) => ({ ...prev, submit_text: event.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label>Submitting Text</Label>
                      <Input
                        className={baseFieldClass}
                        value={contactContent.submitting_text}
                        onChange={(event) =>
                          setContactContent((prev) => ({ ...prev, submitting_text: event.target.value }))
                        }
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label>Success Titel</Label>
                      <Input
                        className={baseFieldClass}
                        value={contactContent.success_title}
                        onChange={(event) => setContactContent((prev) => ({ ...prev, success_title: event.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label>Success Text</Label>
                      <Textarea
                        rows={3}
                        className={baseTextareaClass}
                        value={contactContent.success_text}
                        onChange={(event) => setContactContent((prev) => ({ ...prev, success_text: event.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label>Success Toast Titel</Label>
                      <Input
                        className={baseFieldClass}
                        value={contactContent.success_toast_title}
                        onChange={(event) =>
                          setContactContent((prev) => ({ ...prev, success_toast_title: event.target.value }))
                        }
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label>Success Toast Beschreibung</Label>
                      <Textarea
                        rows={3}
                        className={baseTextareaClass}
                        value={contactContent.success_toast_description}
                        onChange={(event) =>
                          setContactContent((prev) => ({ ...prev, success_toast_description: event.target.value }))
                        }
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label>Error Toast Titel</Label>
                      <Input
                        className={baseFieldClass}
                        value={contactContent.error_toast_title}
                        onChange={(event) =>
                          setContactContent((prev) => ({ ...prev, error_toast_title: event.target.value }))
                        }
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label>Error Toast Beschreibung</Label>
                      <Textarea
                        rows={3}
                        className={baseTextareaClass}
                        value={contactContent.error_toast_description}
                        onChange={(event) =>
                          setContactContent((prev) => ({ ...prev, error_toast_description: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
        Für diese Sektion gibt es aktuell nur Textfelder und Design-Overrides. Kein zusätzlicher Builder nötig.
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-6 font-medium text-slate-500">Laden...</div>;
  }

  return (
    <div className="max-w-[1600px] p-6 md:p-10">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Homepage Inhalte</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            Premium-Steuerzentrale mit Sektionen oben in voller Breite, Editor links unten und Live-Preview rechts unten. So bleibt das System klar, ruhig und kundenfreundlich bedienbar.
          </p>
        </div>

        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="rounded-xl bg-[#FF4B2C] px-6 py-5 text-white shadow-md shadow-[#FF4B2C]/20 transition-transform hover:scale-[1.02] hover:bg-[#E03A1E]"
        >
          <Save size={18} className="mr-2" />
          {mutation.isPending ? "Speichere..." : "Alle Inhalte speichern"}
        </Button>
      </div>

      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Bereiche</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">Sektionen steuern</h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
                Reihenfolge, Sichtbarkeit und Fokus der Homepage-Sektionen jetzt oben in voller Breite. Die Karten laufen horizontal als Slider, damit oben alles kompakt bleibt und unten der Editor sofort sichtbar ist.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <div className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {orderedSectionGroups.length} Sektionen
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  aria-label="Sektionen nach links schieben"
                  onClick={() => slideSectionCards("left")}
                  disabled={!canSlideLeft}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#FF4B2C] hover:text-[#FF4B2C] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Sektionen nach rechts schieben"
                  onClick={() => slideSectionCards("right")}
                  disabled={!canSlideRight}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#FF4B2C] hover:text-[#FF4B2C] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 min-w-0">
            <div
              ref={sectionSliderRef}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {orderedSectionGroups.map((group, index) => {
                const active = group.id === activeSectionId;
                const isFirst = index === 0;
                const isLast = index === orderedSectionGroups.length - 1;
                const isVisible = sectionVisibility[group.id as HomepageSectionId] !== false;
                return (
                  <div
                    key={group.id}
                    ref={(node) => {
                      sectionCardRefs.current[group.id as HomepageSectionId] = node;
                    }}
                    className="min-w-0 shrink-0 snap-start basis-[300px] sm:basis-[340px] xl:basis-[360px]"
                  >
                    <div
                      className={`h-full min-w-0 rounded-[1.35rem] border p-4 transition-all ${
                        active
                          ? "border-[#FF4B2C]/35 bg-[#FF4B2C]/5 shadow-[0_16px_35px_-24px_rgba(255,75,44,0.55)]"
                          : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <button type="button" onClick={() => setActiveSection(group.id)} className="block w-full min-w-0 text-left">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className={`block truncate text-sm font-bold ${active ? "text-[#FF4B2C]" : "text-slate-900"}`}>{group.title}</span>
                            <p className="mt-1.5 min-h-[2.5rem] break-words text-[11px] leading-4 text-slate-500">{group.description}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${active ? "bg-[#FF4B2C] text-white" : "bg-slate-200 text-slate-600"}`}>
                            {group.fields.length}
                          </span>
                        </div>
                      </button>

                      <div className="mt-3 flex min-w-0 flex-col gap-3 border-t border-slate-200/80 pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1">
                            <span className={`inline-flex h-2 w-2 shrink-0 rounded-full ${isVisible ? "bg-emerald-500" : "bg-amber-500"}`} />
                            <span className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              {isVisible ? "Sichtbar" : "Ausgeblendet"}
                            </span>
                          </div>
                          <Switch
                            checked={isVisible}
                            onCheckedChange={(checked) => toggleSectionVisibility(group.id as HomepageSectionId, checked)}
                            className="data-[state=checked]:bg-[#FF4B2C]"
                            aria-label={`${group.title} sichtbar schalten`}
                          />
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
                          <button
                            type="button"
                            aria-label={`${group.title} nach oben verschieben`}
                            onClick={() => moveSection(group.id as HomepageSectionId, "up")}
                            disabled={isFirst}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#FF4B2C] hover:text-[#FF4B2C] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`${group.title} nach unten verschieben`}
                            onClick={() => moveSection(group.id as HomepageSectionId, "down")}
                            disabled={isLast}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#FF4B2C] hover:text-[#FF4B2C] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="flex min-w-0 flex-col rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-6 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4B2C]">
                    {HOMEPAGE_SECTION_LABELS[activeSectionId]}
                  </div>
                  <h2 className="mt-3 break-words text-2xl font-extrabold text-slate-900">{activeGroup.title}</h2>
                  <p className="mt-2 max-w-3xl break-words text-sm leading-relaxed text-slate-500">{activeGroup.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${sectionVisibility[activeSectionId] !== false ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {sectionVisibility[activeSectionId] !== false ? "Sektion aktiv" : "Sektion ausgeblendet"}
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {activeGroup.fields.length} Felder
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="content" className="space-y-5">
              <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-[1.25rem] bg-slate-100 p-2">
                <TabsTrigger value="content" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white">Inhalte</TabsTrigger>
                <TabsTrigger value="structure" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white">Struktur</TabsTrigger>
                <TabsTrigger value="design" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white">Design</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-0">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">{renderTextFields()}</div>
              </TabsContent>

              <TabsContent value="structure" className="mt-0">
                {renderStructureTab()}
              </TabsContent>

              <TabsContent value="design" className="mt-0">
                <SectionStyleEditor value={activeSectionStyle} onChange={(nextStyle) => updateSectionStyle(activeSectionId, nextStyle)} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="min-w-0 xl:sticky xl:top-6 xl:self-start">
            <SectionPreviewPanel
              sectionId={activeSectionId}
              sectionLabel={HOMEPAGE_SECTION_LABELS[activeSectionId]}
              preview={getPreviewPayload(activeSectionId)}
              styleVars={resolveHomepageSectionStyleVars(sectionStyles, activeSectionId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomepage;
