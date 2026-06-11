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
    priceGross: "1.380 € brutto",
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
    priceGross: "2.100 € brutto",
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
    priceGross: "3.000 € brutto",
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
                {activePackage.priceGross} inkl. 20 % USt.
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

        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
          {webdesignPackages.map((item, index) => {
            const Icon = item.icon;
            const featuredClass = item.featured
              ? "border-[#0a1842] bg-white shadow-none"
              : "border-[#0a1842] bg-white shadow-none";

            return (
              <motion.article
                key={item.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`dp-blue-card-border dp-blue-card-surface group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-2 p-10 transition-all duration-500 hover:-translate-y-1 ${featuredClass}`}
              >
                {item.featured ? (
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0a1842]" />
                ) : null}

                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                    {item.badge}
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    <Icon size={25} strokeWidth={1.7} />
                  </div>
                </div>

                <h3 className="text-2xl font-black tracking-tight text-foreground">
                  {item.name}
                </h3>
                <p className="mt-4 min-h-[78px] text-base leading-relaxed text-muted-foreground">
                  {item.description}
                </p>

                <div className="my-8 rounded-[1.5rem] border-2 border-[#0a1842] bg-white p-5">
                  <div className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Fixpreis ab
                  </div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tight text-primary">
                      {item.priceNet}
                    </span>
                    <span className="pb-2 text-sm font-semibold text-muted-foreground">
                      netto
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    {item.priceGross} inkl. 20 % USt.
                  </p>
                </div>

                <ul className="mb-8 space-y-4">
                  {item.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-3 text-sm leading-relaxed text-foreground/82"
                    >
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
                    item.featured
                      ? "btn-primary mt-auto w-full !justify-center !py-4 !text-base"
                      : "btn-outline mt-auto w-full !justify-center !py-4 !text-base"
                  }
                >
                  {item.cta}
                  <ArrowRight size={18} />
                </button>
              </motion.article>
            );
          })}
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
