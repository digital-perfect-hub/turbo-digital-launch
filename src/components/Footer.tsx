import { Instagram, Linkedin, Mail, MapPin, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const Footer = () => {
  const { logoUrl, settings } = useGlobalTheme();
  const brandName = settings.company_name || "Digital-Perfect";
  const fontClass = settings.logo_font_family === 'serif' ? 'font-serif' : settings.logo_font_family === 'mono' ? 'font-mono' : '';

  return (
    <footer className="text-white pt-24 pb-12 relative overflow-hidden" style={{ backgroundColor: 'var(--footer-bg, #020617)' }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_50%)] opacity-[0.05] blur-[100px] pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_auto_auto_auto]">
          <div className="max-w-sm">
            <div className="mb-8">
              {!settings.use_text_logo && logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-10 w-auto object-contain brightness-0 invert" />
              ) : (
                <span 
                  className={`text-3xl font-black tracking-tighter text-white ${fontClass}`}
                  style={{ color: (settings.text_logo_color_hex === '#000000' || settings.text_logo_color_hex === '#0F172A') ? '#FFFFFF' : (settings.text_logo_color_hex || '#FFFFFF') }}
                >
                  {brandName}
                  {settings.show_logo_dot !== false && (
                    <span style={{ color: settings.logo_dot_color_hex || settings.primary_color_hex || '#FF4B2C' }}>.</span>
                  )}
                </span>
              )}
            </div>
            <p className="text-slate-400 leading-relaxed mb-8">
              Premium Webdesign, SEO und digitale Vertriebsmaschinen für Agenturen und Brands, die den Standard setzen wollen.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all text-white hover:text-primary">
                <Instagram size={20} />
              </a>
              <a href="#" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all text-white hover:text-primary">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Navigation</h4>
            <ul className="space-y-4 text-slate-400">
              <li><button onClick={() => document.querySelector('#leistungen')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary transition-colors outline-none">Leistungen</button></li>
              <li><button onClick={() => document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary transition-colors outline-none">Projekte</button></li>
              <li><button onClick={() => document.querySelector('#ablauf')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary transition-colors outline-none">Ablauf</button></li>
              <li><button onClick={() => document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary transition-colors outline-none">Shop</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Rechtliches</h4>
            <ul className="space-y-4 text-slate-400">
              <li><Link to="/impressum" className="hover:text-primary transition-colors">Impressum</Link></li>
              <li><Link to="/datenschutz" className="hover:text-primary transition-colors">Datenschutz</Link></li>
              <li><Link to="/agb" className="hover:text-primary transition-colors">AGB</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Kontakt</h4>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-center gap-3"><Mail size={18} className="text-primary shrink-0" /> {settings.imprint_contact || "info@digital-perfect.at"}</li>
              <li className="flex items-start gap-3 max-w-[200px]"><MapPin size={18} className="text-primary shrink-0 mt-1" /> {settings.imprint_address || "Wien, Österreich"}</li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} {brandName}. Alle Rechte vorbehalten.</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors outline-none">
            Back to Top <ArrowUp size={16} className="transition-transform group-hover:-translate-y-1 text-primary" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;