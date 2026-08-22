import { useRef, useState, type TouchEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";

const seoPackages = [
  {
    badge: "Starter",
    tabLabel: "Starter",
    name: "SEO & KI Starter",
    price: "790 €",
    interval: "netto / Monat",
    taxNote: "zzgl. 20 % USt.",
    description:
      "Für kleine Unternehmen, die ihre Website technisch und inhaltlich sichtbar besser aufstellen wollen.",
    icon: Search,
    features: [
      "Monatlicher SEO- & KI-Sichtbarkeitscheck",
      "Technische Basisprüfung mit Maßnahmenliste",
      "1 Fokus-Seite oder Leistungsbereich optimieren",
      "Google Business Profil Kurzcheck",
      "Monatliches Kurzreporting",
    ],
    cta: "Starter anfragen",
  },
  {
    badge: "Am beliebtesten",
    tabLabel: "Wachstum",
    name: "SEO & KI Wachstum",
    price: "1.500 €",
    interval: "netto / Monat",
    taxNote: "zzgl. 20 % USt.",
    description:
      "Für Betriebe, die dauerhaft bei Google, lokalen Suchanfragen und KI-Antwortsystemen sichtbarer werden wollen.",
    icon: Radar,
    featured: true,
    features: [
      "SEO-Strategie für Website, Inhalte und lokale Sichtbarkeit",
      "2 Fokus-Seiten oder Leistungsbereiche monatlich optimieren",
      "KI-Sichtbarkeitsstruktur für ChatGPT, Gemini & Co.",
      "Content-Briefings mit Suchintention und interner Verlinkung",
      "Technik-, Indexierungs- und Conversion-Checks",
      "Detailreport mit klaren nächsten Maßnahmen",
    ],
    cta: "Wachstum anfragen",
  },
  {
    badge: "Dominanz",
    tabLabel: "Dominanz",
    name: "SEO & KI Dominanz",
    price: "2.500 €",
    interval: "netto / Monat",
    taxNote: "zzgl. 20 % USt.",
    description:
      "Für ambitionierte Unternehmen, die ganze Themencluster, Standorte und Anfragewege professionell ausbauen wollen.",
    icon: Bot,
    features: [
      "Strategische SEO- & AI-Visibility-Roadmap",
      "4 Fokus-Seiten oder Content-Assets monatlich",
      "Themencluster, interne Verlinkung und Entity-Struktur",
      "Local SEO, Schema-Prüfung und Wettbewerbsbeobachtung",
      "Conversion-Optimierung für Anfragewege",
      "Priorisierter Maßnahmenplan für Wachstum",
    ],
    cta: "Dominanz anfragen",
  },
];

const scrollToContact = () => {
  document
    .querySelector("#kontakt")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const SeoPackagesSection = () => {
  const [activePackageName, setActivePackageName] = useState(
    seoPackages[1].name,
  );
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(
    settings,
    "seo-packages",
  );

  const activePackage =
    seoPackages.find((item) => item.name === activePackageName) ??
    seoPackages[1];
  const ActiveIcon = activePackage.icon;
  const activePackageIndex = seoPackages.findIndex(
    (item) => item.name === activePackage.name,
  );
  const packageTouchStartX = useRef<number | null>(null);

  const selectPackageByOffset = (offset: number) => {
    const nextIndex =
      (activePackageIndex + offset + seoPackages.length) % seoPackages.length;
    setActivePackageName(seoPackages[nextIndex].name);
  };

  const handlePackageTouchStart = (event: TouchEvent<HTMLElement>) => {
    packageTouchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handlePackageTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (packageTouchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? packageTouchStartX.current;
    const deltaX = packageTouchStartX.current - endX;

    if (Math.abs(deltaX) > 45) {
      selectPackageByOffset(deltaX > 0 ? 1 : -1);
    }

    packageTouchStartX.current = null;
  };

  const kicker =
    getSetting("home_seo_packages_kicker", "SEO & KI Sichtbarkeit").trim() ||
    "SEO & KI Sichtbarkeit";
  const title =
    getSetting(
      "home_seo_packages_title",
      "Pakete für Unternehmen, die gefunden und empfohlen werden wollen.",
    ).trim() ||
    "Pakete für Unternehmen, die gefunden und empfohlen werden wollen.";
  const description =
    getSetting(
      "home_seo_packages_description",
      "Wir optimieren deine Website nicht nur für Google, sondern auch für KI-Suchen, lokale Sichtbarkeit und klare Anfragewege. Ohne leere Versprechen – mit sauberer Analyse, Struktur und Umsetzung.",
    ).trim() ||
    "Wir optimieren deine Website nicht nur für Google, sondern auch für KI-Suchen, lokale Sichtbarkeit und klare Anfragewege. Ohne leere Versprechen – mit sauberer Analyse, Struktur und Umsetzung.";

  return (
    <section
      id="seo-pakete"
      className="homepage-style-scope surface-section-shell relative overflow-hidden py-24 sm:py-32"
      aria-label="SEO und KI Pakete"
      style={sectionStyleVars}
    >
      <div className="section-container relative z-10">
        <div className="mb-14 flex flex-col gap-8 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <p className="section-label">{kicker}</p>
            <h2 className="section-title mt-4">{title}</h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="dp-blue-card-border dp-blue-card-surface rounded-[1.5rem] border-2 border-[#0a1842] bg-[#FAF6EE] px-5 py-4 text-sm font-semibold text-muted-foreground shadow-none"
          >
            <span className="text-primary">Wichtig:</span> SEO braucht saubere
            Umsetzung und Zeit. Wir versprechen keine Rankings, sondern ein
            belastbares System.
          </motion.div>
        </div>

        <div className="lg:hidden">
          <div className="mobile-package-tabs" role="tablist" aria-label="SEO und KI Paket wählen">
            {seoPackages.map((item) => (
              <button
                key={item.name}
                type="button"
                role="tab"
                aria-selected={activePackage.name === item.name}
                onClick={() => setActivePackageName(item.name)}
                className={`mobile-package-tab ${
                  activePackage.name === item.name ? "mobile-package-tab-active" : ""
                }`}
              >
                {item.featured ? (
                  <span className="mobile-package-tab-popular">Am beliebtesten</span>
                ) : null}
                <span className="mobile-package-tab-name">{item.tabLabel}</span>
              </button>
            ))}
          </div>

          <div className="mobile-package-tab-card-wrap">
            <motion.article
              key={activePackage.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="mobile-package-tab-card dp-blue-card-surface"
              onTouchStart={handlePackageTouchStart}
              onTouchEnd={handlePackageTouchEnd}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                  {activePackage.badge}
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <ActiveIcon size={24} strokeWidth={1.8} />
                </div>
              </div>

              <h3 className="mobile-package-active-title mt-8 text-2xl font-black tracking-tight">
                {activePackage.name}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {activePackage.description}
              </p>

              <div className="my-7 rounded-[1.5rem] border-2 border-[#0a1842] bg-[#FAF6EE] p-5">
                <div className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Monatlich ab
                </div>
                <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
                  <span className="text-5xl font-black leading-none tracking-tight text-primary">
                    {activePackage.price}
                  </span>
                  <span className="pb-1.5 text-sm font-semibold text-muted-foreground">
                    {activePackage.interval}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  {activePackage.taxNote}
                </p>
              </div>

              <ul className="space-y-3.5">
                {activePackage.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-relaxed">
                    <Check
                      className="mt-0.5 shrink-0 text-primary"
                      size={17}
                      strokeWidth={2.5}
                    />
                    <span className="text-foreground/82">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={scrollToContact}
                className={
                  activePackage.featured
                    ? "btn-primary mt-8 w-full !justify-center !py-4 !text-base"
                    : "btn-outline mt-8 w-full !justify-center !py-4 !text-base"
                }
              >
                {activePackage.cta}
                <ArrowRight size={18} />
              </button>
            </motion.article>

            <div className="mobile-package-dots" aria-label="SEO Paket wechseln">
              {seoPackages.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`mobile-package-dot ${
                    activePackage.name === item.name ? "mobile-package-dot-active" : ""
                  }`}
                  onClick={() => setActivePackageName(item.name)}
                  aria-label={`${item.tabLabel} Paket anzeigen`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block mobile-package-edge-fade">
          <div className="mobile-package-carousel lg:grid lg:grid-cols-3 lg:items-stretch">
            {seoPackages.map((item, index) => {
              const Icon = item.icon;
              const cardClass = item.featured
                ? "relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 border-[#ff6b2c] bg-[#0A1842] p-8 text-[#FAF6EE] shadow-none sm:p-10 lg:-mt-6"
                : "dp-blue-card-border dp-blue-card-surface relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 border-[#ff6b2c] bg-[#FAF6EE] p-8 shadow-none transition-all duration-500 hover:-translate-y-1 sm:p-10";
              const badgeClass = item.featured
                ? "dp-popular-badge"
                : "border-primary/15 bg-primary/5 text-primary";
              const mutedClass = item.featured
                ? "text-[#FAF6EE]/72"
                : "text-muted-foreground";
              const titleClass = item.featured
                ? "text-[#FAF6EE]"
                : "text-foreground";
              const isExpandable = item.features.length > 5;
              const isExpanded = expandedPackage === item.name;
              const featureListClass = isExpandable && !isExpanded
                ? "mobile-package-feature-list-collapsed"
                : "";

              return (
                <motion.article
                  key={item.name}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={`${cardClass} mobile-package-card ${item.featured ? "mobile-package-card-dark" : ""} ${isExpanded ? "mobile-package-card-expanded" : ""}`}
                >
                  <div className="relative z-10 flex flex-1 flex-col">
                    <div className="mobile-package-badge-row mb-8 flex items-start justify-between gap-4">
                      <div
                        className={`inline-flex rounded-full border px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] ${badgeClass}`}
                      >
                        {item.badge}
                      </div>
                      <div
                        className={
                          item.featured
                            ? "rounded-2xl bg-primary/15 p-3 text-primary"
                            : "rounded-2xl bg-primary/10 p-3 text-primary"
                        }
                      >
                        <Icon size={25} strokeWidth={1.7} />
                      </div>
                    </div>

                    <h3
                      className={`dp-package-card-title text-2xl font-black tracking-tight ${titleClass}`}
                    >
                      {item.name}
                    </h3>
                    <p
                      className={`mobile-package-description mt-4 min-h-[78px] text-base leading-relaxed ${mutedClass}`}
                    >
                      {item.description}
                    </p>

                    <div className="mobile-package-price-row my-8">
                      <div className="flex items-end gap-2">
                        <span
                          className={`mobile-package-price text-5xl font-black tracking-tight sm:text-6xl ${item.featured ? "text-primary" : "text-primary"}`}
                        >
                          {item.price}
                        </span>
                        <span
                          className={`pb-2 text-sm font-semibold ${mutedClass}`}
                        >
                          {item.interval}
                        </span>
                      </div>
                      <p className={`mobile-package-tax-note mt-2 text-sm font-semibold ${mutedClass}`}>
                        {item.taxNote}
                      </p>
                    </div>

                    <ul className={`mobile-package-feature-list mb-4 space-y-4 ${featureListClass}`}>
                      {item.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex gap-3 text-sm leading-relaxed"
                        >
                          <span
                            className={
                              item.featured
                                ? "mt-0.5 text-primary"
                                : "mt-0.5 text-primary"
                            }
                          >
                            <Check size={17} strokeWidth={2.5} />
                          </span>
                          <span
                            className={
                              item.featured
                                ? "text-[#FAF6EE]/90"
                                : "text-foreground/82"
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {isExpandable ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPackage(isExpanded ? null : item.name)
                        }
                        className="mobile-package-more-button lg:hidden"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={scrollToContact}
                      className={
                        item.featured
                          ? "btn-primary mt-auto w-full !justify-center !py-4 !text-base"
                          : "btn-outline mt-auto w-full !justify-center !py-4 !text-base"
                      }
                    >
                      {item.cta}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="dp-blue-card-border dp-blue-card-surface mt-8 grid gap-4 rounded-[2rem] border-2 border-[#0a1842] bg-[#FAF6EE] p-6 text-sm leading-relaxed text-muted-foreground shadow-none md:grid-cols-3 md:p-8">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 shrink-0 text-primary" size={20} />
            <span>
              <strong className="text-foreground">AI Visibility:</strong>{" "}
              Inhalte werden so strukturiert, dass KI-Systeme Zusammenhänge
              besser verstehen können.
            </span>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={20} />
            <span>
              <strong className="text-foreground">Sauber & realistisch:</strong>{" "}
              Keine Fake-Garantien, keine riskanten Tricks, kein Black-Hat-SEO.
            </span>
          </div>
          <div className="flex gap-3">
            <ArrowRight className="mt-0.5 shrink-0 text-primary" size={20} />
            <span>
              <strong className="text-foreground">Lead-Fokus:</strong>{" "}
              Sichtbarkeit wird mit klaren Anfragewegen und Conversion-Struktur
              verbunden.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoPackagesSection;
