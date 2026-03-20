import { Instagram, Linkedin, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const Footer = () => {
  const { logoUrl, settings } = useGlobalTheme();
  const brandName = settings.company_name || "Digital-Perfect";

  return (
    <footer className="dark-section border-t border-white/8 py-14">
      <div className="section-container">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto_auto] lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-10 w-auto object-contain" />
              ) : (
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-950">DP</div>
              )}
              <div>
                <p className="font-heading text-lg font-bold text-white">{brandName}</p>
                <p className="text-sm text-slate-300">Webdesign, SEO und digitale Vertriebsseiten mit klarer Conversion-Struktur</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="flex items-center gap-2"><MapPin size={15} className="text-primary" /> Österreich / Deutschland</div>
              <div className="flex items-center gap-2"><Mail size={15} className="text-primary" /> Projektanfragen digital & persönlich</div>
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Rechtliches</p>
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <Link to="/impressum" className="transition-colors hover:text-white">Impressum</Link>
              <Link to="/datenschutz" className="transition-colors hover:text-white">Datenschutz</Link>
              <Link to="/agb" className="transition-colors hover:text-white">AGB</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Socials</p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/5 text-white transition-colors hover:border-white/25 hover:bg-white/10">
                <Instagram size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/5 text-white transition-colors hover:border-white/25 hover:bg-white/10">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/8 pt-6 text-sm text-slate-400">
          © 2026 {brandName}. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
