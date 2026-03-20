import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const navItems = [
  { label: "Leistungen", href: "#leistungen" },
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
  const fontClass = settings.logo_font_family === 'serif' ? 'font-serif' : settings.logo_font_family === 'mono' ? 'font-mono' : '';

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMobileOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "py-4 bg-background/90 backdrop-blur-xl shadow-lg border-b border-border" : "py-6 bg-transparent"
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between">
          
          {/* ... andere Header Sachen ... */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="relative z-10 flex items-center gap-3 group outline-none">
            {!settings.use_text_logo && logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <span 
                className={`text-2xl font-black tracking-tighter transition-opacity hover:opacity-80 ${fontClass}`} 
                style={{ color: settings.text_logo_color_hex || 'inherit' }}
              >
                {brandName}
                {settings.show_logo_dot !== false && (
                  <span style={{ color: settings.logo_dot_color_hex || settings.primary_color_hex || '#FF4B2C' }}>.</span>
                )}
              </span>
            )}
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button key={item.href} onClick={() => scrollTo(item.href)} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest outline-none">
                {item.label}
              </button>
            ))}
            <button onClick={() => scrollTo("#kontakt")} className="btn-primary !py-3 !px-6 shadow-[0_10px_20px_-10px_rgba(var(--primary),0.3)] transition-colors" style={{ '--tw-hover-bg': 'var(--cta-hover)' } as any}>
              Anfrage starten
            </button>
          </nav>

          <button className="lg:hidden relative z-10 p-2 text-foreground outline-none" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 bg-background pt-32 pb-10 px-6 lg:hidden border-b border-border shadow-2xl">
            <div className="flex flex-col gap-6 items-center">
              {navItems.map((item) => (
                <button key={item.href} onClick={() => scrollTo(item.href)} className="text-2xl font-bold text-foreground hover:text-primary transition-colors outline-none">{item.label}</button>
              ))}
              <button onClick={() => scrollTo("#kontakt")} className="btn-primary w-full mt-4 !py-4 text-lg">Projekt anfragen</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;