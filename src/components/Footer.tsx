import { Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const Footer = () => {
  const { logoUrl, settings } = useGlobalTheme();

  return (
    <footer className="bg-background py-12 border-t border-border/60">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {logoUrl && <img src={logoUrl} alt={settings.company_name || "Logo"} className="h-8 w-auto" />}
            <span className="font-heading font-bold text-sm">
              {settings.company_name || "Digital-Perfect"}
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs opacity-70">
            <Link to="/impressum" className="hover:text-primary transition-colors">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-primary transition-colors">Datenschutz</Link>
            <Link to="/agb" className="hover:text-primary transition-colors">AGB</Link>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-border/40 hover:border-primary hover:text-primary transition-colors">
              <Instagram size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-border/40 hover:border-primary hover:text-primary transition-colors">
              <Linkedin size={16} />
            </a>
          </div>
        </div>

        <div className="text-center mt-8 text-xs opacity-40">
          © 2026 {settings.company_name || "Digital-Perfect"}. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
