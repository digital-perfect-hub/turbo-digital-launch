import { useRef, useState, type TouchEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Globe2, Layers3, MapPinned } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";

const webdesignPackages = [
  {
    badge: "Starter",
    tabLabel: "Starter",
    name: "Webdesign Starter",
    priceNet: "1.150 €",
    taxNote: "zzgl. 20 % USt.",
    description:
      "Die kompakte professionelle Grundlage für Unternehmen, die schnell sauber online sichtbar werden wollen.",
    icon: Globe2,
    features: [
      "Moderne, mobiloptimierte Startseite",
      "Klare Leistungsübersicht und Anfragewege",
      "Kontaktbuttons und Google Maps Einbindung",
      "Basis-SEO mit sauberer Seitenstruktur",
      "Domain sauber verbinden, Hosting optional",
    ],
    cta: "Starter anfragen",
  },
  {
    badge: "Am beliebtesten",
    tabLabel: "Business",
    name: "Webdesign Business",
    priceNet: "1.750 €",
    taxNote: "zzgl. 20 % USt.",
    description:
      "Für Betriebe mit mehreren Leistungen, die professionell erklärt, strukturiert und lokal auffindbar sein sollen.",
    icon: Layers3,
    featured: true,
    features: [
      "Startseite + bis zu 3 Unterseiten",
      "Mehrere Leistungen klar und verkaufsstark darstellen",
      "Lokale SEO-Basis und interne Verlinkung",
      "Google Maps, Kontaktbuttons und klare Anfragewege",
      "Mobile-first Aufbau mit professionellem Markenauftritt",
    ],
    cta: "Business anfragen",
  },
  {
    badge: "Local SEO Premium",
    tabLabel: "Premium",
    name: "Local SEO Premium Website",
    priceNet: "2.500 €",
    taxNote: "zzgl. 20 % USt.",
    description:
      "Für Unternehmen, die Website-Relaunch und lokale Sichtbarkeit in einem stärkeren Setup verbinden wollen.",
    icon: MapPinned,
    features: [
      "Startseite + bis zu 5 Seiten oder Leistungsbereiche",
      "Stärkere lokale SEO-Struktur für Linz und Umgebung",
      "LocalBusiness Schema und Google Business Profil Check",
      "Saubere interne Verlinkung und Anfragewege",
      "Professionelle Grundlage für laufende SEO-Betreuung",
    ],
    cta: "Premium anfragen",
  },
];

const scrollToContact = () => {
  document
    .querySelector("#kontakt")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const WebdesignPackagesSection = () => {
  const [activePackageName, setActivePackageName] = useState(
    webdesignPackages[1].name,
  );
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(
    settings,
    "webdesign-packages",
  );

  const activePackage =
    webdesignPackages.find((item) => item.name === activePackageName) ??
    webdesignPackages[1];
  const ActiveIcon = activePackage.icon;
  const activePackageIndex = webdesignPackages.findIndex(
    (item) => item.name === activePackage.name,
  );
  const packageTouchStartX = useRef<number | null>(null);

  const selectPackageByOffset = (offset: number) => {
    const nextIndex =
      (activePackageIndex + offset + webdesignPackages.length) %
      webdesignPackages.length;
    setActivePackageName(webdesignPackages[nextIndex].name);
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
    getSetting("home_webdesign_packages_kicker", "Webdesign Pakete").trim() ||
    "Webdesign Pakete";
  const title =
    getSetting(
      "home_webdesign_packages_title",
      "Websites, die Vertrauen aufbauen und Anfragen leichter machen.",
    ).trim() ||
    "Websites, die Vertrauen aufbauen und Anfragen leichter machen.";
  const description =
    getSetting(
      "home_webdesign_packages_description",
      "Drei klare Website-Pakete für Selbstständige, KMU und lokale Betriebe. Kein unnötiges Agentur-Blabla – sauberer Aufbau, schnelle Umsetzung und eine Struktur, die Besucher versteht.",
    ).trim() ||
    "Drei klare Website-Pakete für Selbstständige, KMU und lokale Betriebe. Kein unnötiges Agentur-Blabla – sauberer Aufbau, schnelle Umsetzung und eine Struktur, die Besucher versteht.";

  return (
    <section
      id="webdesign-pakete"
      className="homepage-style-scope surface-section-shell relative overflow-hidden py-24 sm:py-32"
      aria-label="Webdesign Pakete"
      style={sectionStyleVars}
    >
      <div className="section-container relative z-10">
        <div className="mx-auto mb-14 max-w-3xl text-center lg:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45 }}
            className="section-label mx-auto"
          >
            {kicker}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="section-title mt-4"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {description}
          </motion.p>
        </div>

        <div className="lg:hidden">
          <div className="mobile-package-tabs" role="tablist" aria-label="Webdesign Paket wählen">
            {webdesignPackages.map((item) => (
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

              <div className="my-7 rounded-[1.5rem] border-2 border-[#0a1842] bg-white p-5">
                <div className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Fixpreis ab
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-black leading-none tracking-tight text-primary">
                    {activePackage.priceNet}
                  </span>
                  <span className="pb-1.5 text-sm font-semibold text-muted-foreground">
                    netto
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  {activePackage.taxNote}
                </p>
              </div>

              <ul className="space-y-3.5">
                {activePackage.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-relaxed text-foreground/82">
                    <Check
                      className="mt-0.5 shrink-0 text-primary"
                      size={17}
                      strokeWidth={2.5}
                    />
                    <span>{feature}</span>
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

            <div className="mobile-package-dots" aria-label="Webdesign Paket wechseln">
              {webdesignPackages.map((item) => (
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
            {webdesignPackages.map((item, index) => {
              const Icon = item.icon;
              const cardClass = item.featured
                ? "group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 border-[#ff6b2c] bg-[#050B1F] p-8 text-white shadow-none sm:p-10 lg:-mt-6"
                : "dp-blue-card-border dp-blue-card-surface group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 border-[#ff6b2c] bg-white p-8 shadow-none transition-all duration-500 hover:-translate-y-1 sm:p-10";
              const badgeClass = item.featured
                ? "dp-popular-badge"
                : "border-primary/15 bg-primary/5 text-primary";
              const titleClass = item.featured ? "text-white" : "text-foreground";
              const mutedClass = item.featured ? "text-slate-300" : "text-muted-foreground";
              const featureTextClass = item.featured ? "text-slate-100" : "text-foreground/82";
              const priceBoxClass = item.featured
                ? "mobile-package-price-box my-8 rounded-[1.5rem] border border-white/15 bg-white/5 p-5"
                : "mobile-package-price-box my-8 rounded-[1.5rem] border-2 border-[#0a1842] bg-white p-5";
              const priceLabelClass = item.featured
                ? "text-slate-300"
                : "text-muted-foreground";
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
                      <div className={`inline-flex rounded-full border px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] ${badgeClass}`}>
                        {item.badge}
                      </div>
                      <div
                        className={
                          item.featured
                            ? "rounded-2xl bg-primary/15 p-3 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                            : "rounded-2xl bg-primary/10 p-3 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                        }
                      >
                        <Icon size={25} strokeWidth={1.7} />
                      </div>
                    </div>

                    <h3 className={`dp-package-card-title text-2xl font-black tracking-tight ${titleClass}`}>
                      {item.name}
                    </h3>
                    <p className={`mobile-package-description mt-4 min-h-[78px] text-base leading-relaxed ${mutedClass}`}>
                      {item.description}
                    </p>

                    <div className={priceBoxClass}>
                      <div className={`text-sm font-bold uppercase tracking-[0.18em] ${priceLabelClass}`}>
                        Fixpreis ab
                      </div>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="mobile-package-price text-5xl font-black tracking-tight text-primary">
                          {item.priceNet}
                        </span>
                        <span className={`pb-2 text-sm font-semibold ${priceLabelClass}`}>
                          netto
                        </span>
                      </div>
                      <p className={`mobile-package-tax-note mt-2 text-sm font-semibold ${priceLabelClass}`}>
                        {item.taxNote}
                      </p>
                    </div>

                    <ul className={`mobile-package-feature-list mb-4 space-y-4 ${featureListClass}`}>
                      {item.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex gap-3 text-sm leading-relaxed"
                        >
                          <Check
                            className="mt-0.5 shrink-0 text-primary"
                            size={17}
                            strokeWidth={2.5}
                          />
                          <span className={featureTextClass}>{feature}</span>
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

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
          Angebotspreise gelten als klare Projektgrundlage. Hosting und laufende
          Betreuung können separat ergänzt werden.
        </p>
      </div>
    </section>
  );
};

export default WebdesignPackagesSection;
