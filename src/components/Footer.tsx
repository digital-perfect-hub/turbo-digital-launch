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
    <footer className="footer-shell relative overflow-hidden pt-24 pb-12">

      <div className="section-container relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_auto_auto_auto]">
          <div className="max-w-sm">
            <div className="mb-8">
              {!settings.use_text_logo && logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-10 w-auto object-contain brightness-0 invert" />
              ) : (
                <span
                  className={`text-3xl font-black tracking-tighter ${fontClass}`}
                  style={{ color: settings.text_logo_color_hex === "#000000" || settings.text_logo_color_hex === "#0F172A" ? "var(--hero-headline)" : settings.text_logo_color_hex || "var(--hero-headline)" }}
                >
                  {brandName}
                  {settings.show_logo_dot !== false && (
                    <span style={{ color: settings.logo_dot_color_hex || settings.primary_color_hex || "var(--theme-primary-hex)" }}>.</span>
                  )}
                </span>
              )}
            </div>

            <p className="footer-muted mb-8 leading-relaxed">
              {settings.footer_description || "Premium Webdesign, SEO und digitale Vertriebsmaschinen für Agenturen und Brands."}
            </p>

            {settings.show_socials !== false && (
              <div className="flex items-center gap-4">
                {settings.social_instagram_url && (
                  <a href={settings.social_instagram_url} target="_blank" rel="noreferrer" className="footer-social h-12 w-12 rounded-2xl flex items-center justify-center transition-all">
                    <Instagram size={20} />
                  </a>
                )}
                {settings.social_linkedin_url && (
                  <a href={settings.social_linkedin_url} target="_blank" rel="noreferrer" className="footer-social h-12 w-12 rounded-2xl flex items-center justify-center transition-all">
                    <Linkedin size={20} />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-6 text-lg font-bold">{footerNavTitle}</h4>
            <ul className="footer-muted space-y-4">
              {navLinks.map((link: any, idx: number) => (
                <li key={idx}>
                  {link.url.startsWith("#") ? (
                    <button onClick={() => document.querySelector(link.url)?.scrollIntoView({ behavior: "smooth" })} className="footer-link outline-none">
                      {link.label}
                    </button>
                  ) : (
                    <a href={link.url} className="footer-link">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-bold">{footerLegalTitle}</h4>
            <ul className="footer-muted space-y-4">
              {legalLinks.map((link: any, idx: number) => (
                <li key={idx}>
                  <Link to={link.url} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-bold">{footerContactTitle}</h4>
            <ul className="footer-muted space-y-4">
              {contactItems.map((item, index) => {
                const Icon = footerIconMap[item.icon || "mail"] || Mail;
                const content = (
                  <>
                    <Icon size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      {item.label ? <div className="footer-subtle text-[11px] font-semibold uppercase tracking-[0.18em]">{item.label}</div> : null}
                      <div>{item.value}</div>
                    </div>
                  </>
                );

                return (
                  <li key={`${item.value}-${index}`} className="max-w-[240px]">
                    {item.url ? (
                      <a href={item.url} className="footer-link flex items-start gap-3">
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

        <div className="footer-divider mt-20 flex flex-col items-center justify-between gap-6 border-t pt-8 md:flex-row">
          <p className="footer-subtle text-sm">{renderedCopyright}</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="footer-link footer-muted group flex items-center gap-2 text-sm font-bold uppercase tracking-widest outline-none">
            {backToTopText} <ArrowUp size={16} className="text-primary transition-transform group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
