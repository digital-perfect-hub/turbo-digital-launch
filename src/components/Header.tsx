import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, ShieldCheck, Sparkles, X } from "lucide-react";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const navItems = [
  { label: "Leistungen", href: "#services" },
  { label: "Projekte", href: "#portfolio" },
  { label: "Ablauf", href: "#ablauf" },
  { label: "Bewertungen", href: "#stimmen" },
  { label: "FAQ", href: "#faq" },
];

const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { logoUrl, settings } = useGlobalTheme();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const brandName = useMemo(() => settings.company_name || "Digital-Perfect", [settings.company_name]);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMobileOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-white/10 bg-[var(--nav-topbar-bg)] backdrop-blur-xl">
        <div className="section-container flex min-h-[40px] items-center justify-between gap-4 text-xs font-medium text-[var(--nav-topbar-text)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--nav-topbar-accent) 14%, transparent)", color: "var(--nav-topbar-accent)" }}>
              <ShieldCheck size={13} />
            </span>
            <span>AT/DE Fokus · Webdesign, SEO & digitale Vertriebsseiten</span>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Sparkles size={13} className="text-[var(--nav-topbar-accent)]" />
            <span>Alles zentral steuerbar: Struktur, Hero, Farben und Content</span>
          </div>
        </div>
      </div>

      <div className="section-container pt-3">
        <div
          className="rounded-[1.8rem] border shadow-[0_24px_60px_-42px_rgba(15,23,42,0.26)] backdrop-blur-2xl transition-all duration-300"
          style={{
            background: "var(--nav-bg)",
            borderColor: "var(--nav-border)",
            boxShadow: isScrolled ? "0 28px 70px -38px rgba(15,23,42,0.34)" : undefined,
          }}
        >
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
            <button onClick={() => scrollTo("#hero")} className="flex items-center gap-3 text-left">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-11 w-auto object-contain md:h-12" loading="eager" />
              ) : (
                <div
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold"
                  style={{ background: "var(--nav-logo-badge-bg)", color: "var(--nav-logo-badge-text)" }}
                >
                  DP
                </div>
              )}
              <div>
                <div className="font-heading text-base font-extrabold tracking-[-0.03em] text-[var(--nav-text)] md:text-lg">{brandName}</div>
                <div className="max-w-[18rem] text-xs leading-snug text-[var(--nav-muted)]">Webdesign, SEO & digitale Vertriebsseiten mit klarer Struktur.</div>
              </div>
            </button>

            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--nav-muted)] transition-all duration-300 hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-hover-text)]"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="rounded-full border px-4 py-2.5 text-sm font-semibold text-[var(--nav-muted)]" style={{ borderColor: "var(--nav-border)", background: "rgba(255,255,255,0.52)" }}>
                Direkt mit Markus. Kein Agentur-Umweg.
              </div>
              <button onClick={() => scrollTo("#kontakt")} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-[0_22px_50px_-24px_rgba(255,132,0,0.58)]" style={{ background: "var(--nav-cta-bg)", color: "var(--nav-cta-text)" }}>
                Erstgespräch
                <ArrowRight size={16} />
              </button>
            </div>

            <button
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-[var(--nav-text)] shadow-[0_18px_40px_-26px_rgba(15,23,42,0.28)] lg:hidden"
              style={{ borderColor: "var(--nav-border)", background: "rgba(255,255,255,0.72)" }}
              onClick={() => setIsMobileOpen((value) => !value)}
              aria-label={isMobileOpen ? "Menü schließen" : "Menü öffnen"}
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          <AnimatePresence>
            {isMobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t lg:hidden"
                style={{ borderColor: "var(--nav-border)" }}
              >
                <div className="space-y-3 px-4 py-4 md:px-6">
                  <div className="premium-card p-3">
                    <div className="relative z-10 flex flex-col gap-2">
                      {navItems.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => scrollTo(item.href)}
                          className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[var(--nav-text)] transition-colors hover:bg-[var(--nav-hover-bg)]"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => scrollTo("#kontakt")} className="inline-flex w-full justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold" style={{ background: "var(--nav-cta-bg)", color: "var(--nav-cta-text)" }}>
                    Anfrage starten
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
