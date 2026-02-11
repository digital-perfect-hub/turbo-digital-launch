import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Leistungen", href: "#services" },
  { label: "Referenzen", href: "#portfolio" },
  { label: "Shop", href: "#shop" },
  { label: "FAQ", href: "#faq" },
  { label: "Kontakt", href: "#kontakt" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-background/80 backdrop-blur-2xl border-b border-border/30 shadow-xl shadow-black/10" : "bg-transparent"}`}>
      <div className="section-container flex items-center justify-between h-16 md:h-20">
        <a href="#hero" onClick={() => scrollTo("#hero")} className="flex items-center gap-2.5">
          <img src={logo} alt="Digital-Perfect Logo" className="h-9 md:h-11 w-auto" />
          <span className="font-heading font-bold text-base hidden sm:block tracking-tight">
            DIGITAL<span className="text-primary">-PERFECT</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button key={item.href} onClick={() => scrollTo(item.href)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all">
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => scrollTo("#kontakt")} className="hidden md:inline-flex px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-gold-light transition-all shadow-lg shadow-primary/20">
            Kostenlos Beraten
          </button>
          <button className="lg:hidden p-2 text-foreground" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-background/95 backdrop-blur-2xl border-b border-border/30">
            <div className="section-container py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <button key={item.href} onClick={() => scrollTo(item.href)} className="py-3 px-4 text-left text-foreground hover:text-primary hover:bg-muted/30 rounded-xl transition-colors text-sm">
                  {item.label}
                </button>
              ))}
              <button onClick={() => scrollTo("#kontakt")} className="mt-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-center text-sm">
                Kostenlos Beraten
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
