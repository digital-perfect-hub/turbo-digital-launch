import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-background/95 backdrop-blur-xl shadow-sm border-b border-border" : "bg-background"
      }`}
    >
      <div className="border-b border-border bg-surface/60">
        <div className="section-container h-11 flex items-center justify-center">
          <p className="text-xs sm:text-sm font-semibold tracking-tight text-foreground text-center">
            {getSetting("home_header_topbar", "#1 Webdesign & SEO Agentur aus Österreich")}
          </p>
        </div>
      </div>

      <div className="section-container h-20 hidden lg:grid lg:grid-cols-[1fr_auto_1fr] items-center gap-6">
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => scrollTo("#hero")} className="flex items-center justify-center">
          <img src={logo} alt="Digital-Perfect Logo" className="h-20 w-auto object-contain" />
        </button>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => scrollTo("#shop")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            aria-label="Zum Shop"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>

      <div className="section-container h-20 flex lg:hidden items-center justify-between gap-4">
        <button className="p-2 text-foreground" onClick={() => setIsMobileOpen((value) => !value)}>
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <button onClick={() => scrollTo("#hero")} className="flex items-center justify-center">
          <img src={logo} alt="Digital-Perfect Logo" className="h-14 w-auto object-contain" />
        </button>
        <button
          onClick={() => scrollTo("#shop")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground"
          aria-label="Zum Shop"
        >
          <ShoppingBag size={17} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className="py-3 px-4 text-left rounded-xl text-sm font-medium text-foreground hover:bg-surface transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
