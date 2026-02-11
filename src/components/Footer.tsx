import { Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="dark-section py-12 border-t border-white/10">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Digital-Perfect" className="h-8 w-auto" />
            <span className="font-heading font-bold text-sm">
              DIGITAL<span className="text-primary">-PERFECT</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs opacity-60">
            <a href="#" className="hover:text-primary transition-colors">Impressum</a>
            <a href="#" className="hover:text-primary transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-primary transition-colors">AGB</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-white/15 hover:border-primary hover:text-primary transition-colors">
              <Instagram size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-white/15 hover:border-primary hover:text-primary transition-colors">
              <Linkedin size={16} />
            </a>
          </div>
        </div>

        <div className="text-center mt-8 text-xs opacity-40">
          © 2026 Digital-Perfect. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
