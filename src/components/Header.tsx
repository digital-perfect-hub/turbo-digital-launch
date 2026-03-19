import { useEffect, useState } from "react";
import { Menu, ShoppingBag, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const navItems = [
  { label: "Startseite", href: "#hero" },
  { label: "Leistungen", href: "#services" },
  { label: "Referenzen", href: "#portfolio" },
  { label: "Shop", href: "#shop" },
  { label: "FAQ", href: "#faq" },
  { label: "Kontakt", href: "#kontakt" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { getSetting } = useSiteSettings();
  const { logoUrl, settings } = useGlobalTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setIsMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "border-b border-border/80 bg-background/90 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.65)] backdrop-blur-2xl"
          : "border-b border-border/40 bg-background/70 backdrop-blur-xl"
      }`}
    >
      <div className="border-b border-primary/15 bg-[linear-gradient(90deg,rgba(251,191,36,0.08),rgba(255,255,255,0.92),rgba(251,191,36,0.08))]">
        <div className="section-container flex h-11 items-center justify-center gap-2 text-center">
          <Sparkles size={14} className="text-primary" />
          <p className="text-xs font-semibold tracking-[0.02em] text-foreground sm:text-sm">
            {getSetting("home_header_topbar", "#1 Webdesign & SEO Agentur aus Österreich")}
          </p>
        </div>
      </div>

      <div className="section-container hidden h-[5.5rem] lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8">
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className="nav-link-gold min-h-[44px] rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:bg-card/80 hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => scrollTo("#hero")}
          className="group flex min-h-[44px] min-w-[44px] items-center justify-center gap-3 rounded-full border border-border/80 bg-card/80 px-4 py-2 shadow-[0_16px_50px_-38px_rgba(15,23,42,0.65)] transition-all duration-300 hover:border-primary/45 hover:shadow-[0_20px_60px_-34px_rgba(251,191,36,0.45)]"
          aria-label="Zur Startseite"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={settings.company_name || "Logo"}
              className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              loading="eager"
            />
          ) : null}
          <span className="hidden items-baseline gap-1 font-heading text-lg font-bold tracking-tight xl:inline-flex">
            {settings.company_name || "Digital-Perfect"}
          </span>
        </button>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => scrollTo("#kontakt")}
            className="btn-primary !px-6 !py-3 !text-sm"
            aria-label="Kostenloses Erstgespräch anfragen"
          >
            Erstgespräch
          </button>
          <button
            onClick={() => scrollTo("#shop")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card/70 text-muted-foreground transition-all duration-300 hover:border-primary hover:bg-card hover:text-foreground hover:shadow-[0_14px_36px_-24px_rgba(251,191,36,0.65)]"
            aria-label="Zum Shop"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>

      <div className="section-container flex h-20 items-center justify-between gap-4 lg:hidden">
        <button
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/80 bg-card/70 text-foreground shadow-[0_14px_35px_-28px_rgba(15,23,42,0.55)] transition-all duration-300 hover:border-primary/50 hover:bg-card"
          onClick={() => setIsMobileOpen((value) => !value)}
          aria-label={isMobileOpen ? "Menü schließen" : "Menü öffnen"}
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <button
          onClick={() => scrollTo("#hero")}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-2"
        >
          {logoUrl ? (
            <img src={logoUrl} alt={settings.company_name || "Logo"} className="h-10 w-auto object-contain" />
          ) : null}
          <span className="font-heading text-sm font-semibold">{settings.company_name || "Digital-Perfect"}</span>
        </button>

        <button
          onClick={() => scrollTo("#kontakt")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary"
          aria-label="Zum Kontaktformular"
        >
          <Sparkles size={17} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/70 bg-background/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="section-container py-4">
              <div className="premium-card overflow-hidden p-3">
                <div className="relative z-10 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => scrollTo(item.href)}
                      className="nav-link-gold min-h-[48px] rounded-2xl px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                    >
                      {item.label}
                    </button>
                  ))}
                  <button onClick={() => scrollTo("#kontakt")} className="btn-primary mt-3 w-full justify-center">
                    Kostenlos anfragen
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
