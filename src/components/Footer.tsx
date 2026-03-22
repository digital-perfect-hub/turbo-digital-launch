import { ArrowUp, Clock3, Globe, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { defaultFooterContactItems, type FooterContactItem, useSiteSettings } from "@/hooks/useSiteSettings";

const footerIconMap = {
  mail: Mail,
  "map-pin": MapPin,
  phone: Phone,
  clock: Clock3,
  globe: Globe,
} satisfies Record<string, typeof Mail>;

const resolveFooterHref = (item: FooterContactItem) => {
  if (item.url?.trim()) return item.url.trim();
  if (item.icon === "mail") return `mailto:${item.value}`;
  if (item.icon === "phone") return `tel:${item.value}`;
  return "";
};

const Footer = () => {
  const { logoUrl, settings } = useGlobalTheme();
  const { getSetting, getJsonSetting } = useSiteSettings();
  const brandName = settings.company_name || "Digital-Perfect";
  const fontClass = settings.logo_font_family === "serif" ? "font-serif" : settings.logo_font_family === "mono" ? "font-mono" : "";

  const navLinks = Array.isArray(settings.footer_nav_links) ? settings.footer_nav_links : [];
  const legalLinks = Array.isArray(settings.footer_legal_links) ? settings.footer_legal_links : [];
  const footerNavTitle = getSetting("footer_nav_title", "Navigation");
  const footerLegalTitle = getSetting("footer_legal_title", "Rechtliches");
  const footerContactTitle = getSetting("footer_contact_title", "Kontakt");
  const backToTopText = getSetting("footer_back_to_top_text", "Back to Top");
  const copyrightTemplate = getSetting("footer_copyright_text", "© {{year}} {{brand}}. Alle Rechte vorbehalten.");
  const footerContactItems = getJsonSetting<FooterContactItem[]>("footer_contact_items", defaultFooterContactItems)
    .filter((item) => item?.value?.trim())
    .map((item) => ({
      ...item,
      icon: item.icon || "mail",
      value: item.value.trim(),
      label: item.label?.trim() || "",
      url: resolveFooterHref(item),
    }));

  const renderedCopyright = copyrightTemplate
    .replace(/{{\s*year\s*}}/gi, String(new Date().getFullYear()))
    .replace(/{{\s*brand\s*}}/gi, brandName);

  const fallbackContactItems: FooterContactItem[] = [
    ...(settings.imprint_contact ? [{ icon: "mail" as const, value: settings.imprint_contact }] : []),
    ...(settings.imprint_address ? [{ icon: "map-pin" as const, value: settings.imprint_address }] : []),
  ];

  const contactItems = footerContactItems.length ? footerContactItems : fallbackContactItems;

  return (
    <footer className="text-white pt-24 pb-12 relative overflow-hidden" style={{ backgroundColor: "var(--footer-bg, #020617)" }}>
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
                  style={{ color: settings.text_logo_color_hex === "#000000" || settings.text_logo_color_hex === "#0F172A" ? "#FFFFFF" : settings.text_logo_color_hex || "#FFFFFF" }}
                >
                  {brandName}
                  {settings.show_logo_dot !== false && (
                    <span style={{ color: settings.logo_dot_color_hex || settings.primary_color_hex || "#FF4B2C" }}>.</span>
                  )}
                </span>
              )}
            </div>

            <p className="text-slate-400 leading-relaxed mb-8">
              {settings.footer_description || "Premium Webdesign, SEO und digitale Vertriebsmaschinen für Agenturen und Brands."}
            </p>

            {settings.show_socials !== false && (
              <div className="flex items-center gap-4">
                {settings.social_instagram_url && (
                  <a href={settings.social_instagram_url} target="_blank" rel="noreferrer" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all text-white hover:text-primary">
                    <Instagram size={20} />
                  </a>
                )}
                {settings.social_linkedin_url && (
                  <a href={settings.social_linkedin_url} target="_blank" rel="noreferrer" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all text-white hover:text-primary">
                    <Linkedin size={20} />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">{footerNavTitle}</h4>
            <ul className="space-y-4 text-slate-400">
              {navLinks.map((link: any, idx: number) => (
                <li key={idx}>
                  {link.url.startsWith("#") ? (
                    <button onClick={() => document.querySelector(link.url)?.scrollIntoView({ behavior: "smooth" })} className="hover:text-primary transition-colors outline-none">
                      {link.label}
                    </button>
                  ) : (
                    <a href={link.url} className="hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">{footerLegalTitle}</h4>
            <ul className="space-y-4 text-slate-400">
              {legalLinks.map((link: any, idx: number) => (
                <li key={idx}>
                  <Link to={link.url} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">{footerContactTitle}</h4>
            <ul className="space-y-4 text-slate-400">
              {contactItems.map((item, index) => {
                const Icon = footerIconMap[item.icon || "mail"] || Mail;
                const content = (
                  <>
                    <Icon size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      {item.label ? <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div> : null}
                      <div className="text-slate-300">{item.value}</div>
                    </div>
                  </>
                );

                return (
                  <li key={`${item.value}-${index}`} className="max-w-[240px]">
                    {item.url ? (
                      <a href={item.url} className="flex items-start gap-3 hover:text-white transition-colors">
                        {content}
                      </a>
                    ) : (
                      <div className="flex items-start gap-3">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-500">{renderedCopyright}</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors outline-none">
            {backToTopText} <ArrowUp size={16} className="transition-transform group-hover:-translate-y-1 text-primary" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
