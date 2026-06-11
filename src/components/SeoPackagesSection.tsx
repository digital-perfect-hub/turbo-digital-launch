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
    grossPrice: "948 € brutto",
    interval: "/ Monat",
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
    grossPrice: "1.800 € brutto",
    interval: "/ Monat",
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
    grossPrice: "3.000 € brutto",
    interval: "/ Monat",
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
            className="rounded-[1.5rem] border-2 border-[#0a1842] bg-white px-5 py-4 text-sm font-semibold text-muted-foreground shadow-none"
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
              className="mobile-package-tab-card"
              onTouchStart={handlePackageTouchStart}
              onTouchEnd={handlePackageTouchEnd}
            >
            <div className="flex items-start justify-between gap-4">
              <div
                className={`inline-flex rounded-full border px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] ${
                  "border-primary/15 bg-primary/5 text-primary"
                }`}
              >
                {activePackage.badge}
              </div>
              <div
                className={
                  "rounded-2xl bg-primary/10 p-3 text-primary"
                }
              >
                <ActiveIcon size={24} strokeWidth={1.8} />
              </div>
            </div>

            <h3 className="mobile-package-active-title mt-8 text-2xl font-black tracking-tight">
              {activePackage.name}
            </h3>
            <p
              className="mt-4 text-base leading-relaxed text-muted-foreground"
            >
              {activePackage.description}
            </p>

            <div className="my-7 rounded-[1.5rem] border-2 border-[#0a1842] bg-white p-5">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Monatlich ab
              </div>
              <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
                <span className="text-5xl font-black leading-none tracking-tight text-primary">
                  {activePackage.price}
                </span>
                <span className="pb-1.5 text-sm font-semibold text-muted-foreground">
                  netto {activePackage.interval}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                {activePackage.grossPrice} inkl. 20 % USt. {activePackage.interval}
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
                  <span
                    className="text-foreground/82"
                  >
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

        <div className="hidden lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-6">
          {seoPackages.map((item, index) => {
            const Icon = item.icon;
            const cardClass = item.featured
              ? "relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 border-[#0a1842] bg-[#050B1F] p-10 text-white shadow-none lg:-mt-6"
              : "dp-blue-card-border dp-blue-card-surface relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 border-[#0a1842] bg-white p-10 shadow-none transition-all duration-500 hover:-translate-y-1";
            const badgeClass = item.featured
              ? "border-primary/35 bg-primary/15 text-primary"
              : "border-primary/15 bg-primary/5 text-primary";
            const mutedClass = item.featured
              ? "text-slate-300"
              : "text-muted-foreground";
            const titleClass = item.featured ? "package-title-on-dark" : "text-foreground";

            return (
              <motion.article
                key={item.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={cardClass}
              >
                {item.featured ? (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[#0a1842]" />
                ) : null}

                <div className="relative z-10 flex flex-1 flex-col">
                  <div className="mb-8 flex items-start justify-between gap-4">
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
                    className={`text-2xl font-black tracking-tight ${titleClass}`}
                    style={item.featured ? { color: "#ffffff" } : undefined}
                  >
                    {item.name}
                  </h3>
                  <p className={`mt-4 min-h-[78px] text-base leading-relaxed ${mutedClass}`}>
                    {item.description}
                  </p>

                  <div className={`my-8 rounded-[1.5rem] border-2 border-[#0a1842] p-5 ${item.featured ? "bg-white/5" : "bg-white"}`}>
                    <div className={`text-sm font-bold uppercase tracking-[0.18em] ${item.featured ? "text-slate-300" : "text-muted-foreground"}`}>
                      Monatlich ab
                    </div>
                    <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
                      <span className="text-6xl font-black tracking-tight text-primary">
                        {item.price}
                      </span>
                      <span className={`pb-2 text-sm font-semibold ${mutedClass}`}>
                        netto {item.interval}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm font-semibold ${mutedClass}`}>
                      {item.grossPrice} inkl. 20 % USt. {item.interval}
                    </p>
                  </div>

                  <ul className="mb-8 space-y-4">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm leading-relaxed">
                        <Check
                          className="mt-0.5 shrink-0 text-primary"
                          size={17}
                          strokeWidth={2.5}
                        />
                        <span className={item.featured ? "text-slate-100" : "text-foreground/82"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

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

        <div className="dp-blue-card-border dp-blue-card-surface mt-8 grid gap-4 rounded-[2rem] border-2 border-[#0a1842] bg-white p-6 text-sm leading-relaxed text-muted-foreground shadow-none md:grid-cols-3 md:p-8">
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
