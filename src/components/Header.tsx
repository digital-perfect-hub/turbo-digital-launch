import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type NavLink = {
  id: string;
  label: string;
  url: string;
  parent_id: string | null;
  sort_order: number;
};

type HeaderProps = {
  forceSolid?: boolean;
  solidBackgroundClassName?: string;
};

const Header = ({ forceSolid = false, solidBackgroundClassName }: HeaderProps) => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMobileDropdowns, setOpenMobileDropdowns] = useState<Record<string, boolean>>({});

  const { logoUrl, settings } = useGlobalTheme();

  const { data: links = [] } = useQuery({
    queryKey: ["navigation_links_frontend", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("navigation_links").select("*").eq("site_id", siteId).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      if (error) throw error;
      return data as NavLink[];
    },
  });

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const brandName = useMemo(() => settings.company_name || "Digital-Perfect", [settings.company_name]);
  const logoFontClass = settings.logo_font_family === "serif" ? "font-serif" : settings.logo_font_family === "mono" ? "font-mono" : "";
  const navFontFamily = settings.nav_font_family === "serif" ? "font-serif" : settings.nav_font_family === "mono" ? "font-mono" : "font-sans";
  const navFontWeight = settings.nav_font_weight === "normal" ? "font-normal" : settings.nav_font_weight === "medium" ? "font-medium" : settings.nav_font_weight === "extrabold" ? "font-extrabold" : "font-bold";
  const navFontStyle = settings.nav_font_style === "italic" ? "italic" : "not-italic";
  const navTypographyClasses = `${navFontFamily} ${navFontWeight} ${navFontStyle}`;

  const handleLinkClick = (url: string) => {
    if (url.startsWith("#")) {
      document.querySelector(url)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = url;
    }
    setIsMobileOpen(false);
  };

  const toggleMobileDropdown = (id: string) => {
    setOpenMobileDropdowns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const topLevelLinks = links.filter((l) => !l.parent_id);
  const getChildren = (parentId: string) => links.filter((l) => l.parent_id === parentId);

  const desktopNavColor = forceSolid ? "var(--hero-headline)" : "var(--nav-text, var(--surface-page-foreground))";
  const desktopNavHoverColor = forceSolid ? "var(--theme-primary-hex)" : "var(--nav-hover-text, var(--theme-primary-hex))";
  const dropdownShellClass = forceSolid ? "header-dropdown-shell" : "shadow-xl";
  const dropdownShellStyle = forceSolid ? undefined : { background: "var(--nav-bg)", borderColor: "var(--nav-border)", backdropFilter: "blur(20px)" };
  const dropdownHoverBg = forceSolid ? "color-mix(in srgb, var(--hero-headline) 8%, transparent)" : "var(--nav-hover-bg, rgba(255,75,44,0.05))";
  const mobileOverlayClass = forceSolid ? "header-mobile-shell" : "text-foreground";
  const mobileOverlayStyle = forceSolid ? undefined : { background: "var(--nav-bg)", borderColor: "var(--nav-border)", backdropFilter: "blur(20px)" };
  const logoColor = forceSolid ? "var(--hero-headline)" : settings.text_logo_color_hex || desktopNavColor;
  const navigationThemeSettings = ((settings.navigation_theme && typeof settings.navigation_theme === "object" && !Array.isArray(settings.navigation_theme))
    ? (settings.navigation_theme as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const navCtaLabel = typeof navigationThemeSettings.cta_label === "string" && navigationThemeSettings.cta_label.trim()
    ? navigationThemeSettings.cta_label.trim()
    : "Anfrage starten";
  const navCtaLink = typeof navigationThemeSettings.cta_link === "string" && navigationThemeSettings.cta_link.trim()
    ? navigationThemeSettings.cta_link.trim()
    : "#kontakt";
  const headerClassName = forceSolid
    ? `py-4 header-solid-shell border-b ${solidBackgroundClassName || ""}`
    : isScrolled
      ? "py-4 shadow-lg border-b"
      : "py-6 bg-transparent";
  const headerStyle = forceSolid || !isScrolled ? undefined : { background: "var(--nav-bg)", borderColor: "var(--nav-border)", backdropFilter: "blur(20px)" };

  return (
    <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${headerClassName}`} style={headerStyle}>
      <div className="section-container">
        <div className="flex items-center justify-between">
          <Link to="/" className="relative z-10 flex items-center gap-3 group outline-none">
            {!settings.use_text_logo && logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <span className={`text-2xl font-black tracking-tighter transition-opacity hover:opacity-80 ${logoFontClass}`} style={{ color: logoColor }}>
                {brandName}
                {settings.show_logo_dot !== false && (
                  <span style={{ color: settings.logo_dot_color_hex || settings.primary_color_hex || "var(--theme-primary-hex)" }}>.</span>
                )}
              </span>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {topLevelLinks.map((item) => {
              const children = getChildren(item.id);
              const hasChildren = children.length > 0;

              return (
                <div key={item.id} className="relative group flex items-center">
                  <button
                    onClick={() => !hasChildren ? handleLinkClick(item.url) : null}
                    className={`relative flex items-center gap-1.5 py-1 text-sm uppercase tracking-widest outline-none transition-colors duration-300 ${navTypographyClasses}`}
                    style={{ color: desktopNavColor }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = desktopNavHoverColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = desktopNavColor)}
                  >
                    {item.label}
                    {hasChildren && <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />}

                    {settings.nav_show_underline && (
                      <span
                        className={`absolute -bottom-1 left-0 h-[2px] w-full ${
                          settings.nav_animate_underline
                            ? "origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
                            : "opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        }`}
                        style={{ backgroundColor: forceSolid ? "var(--theme-primary-hex)" : "var(--nav-underline, var(--theme-primary-hex))" }}
                      />
                    )}
                  </button>

                  {hasChildren && (
                    <div className="absolute left-0 top-full min-w-[200px] translate-y-2 pt-4 opacity-0 invisible transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className={`flex flex-col gap-1 rounded-2xl border p-2 ${dropdownShellClass}`} style={dropdownShellStyle}>
                        {children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => handleLinkClick(child.url)}
                            className={`rounded-xl px-4 py-2.5 text-left text-sm transition-colors duration-300 ${navTypographyClasses}`}
                            style={{ color: desktopNavColor }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = desktopNavHoverColor;
                              e.currentTarget.style.backgroundColor = dropdownHoverBg;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = desktopNavColor;
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {navCtaLabel ? (
              <button
                onClick={() => handleLinkClick(navCtaLink)}
                className={forceSolid ? "btn-primary !px-6 !py-3 shadow-[0_10px_20px_-10px_rgba(var(--primary),0.3)] transition-colors" : "nav-cta-button inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5"}
              >
                {navCtaLabel}
              </button>
            ) : null}
          </nav>

          <button className={`relative z-10 p-2 outline-none lg:hidden ${forceSolid ? "header-solid-text" : "text-foreground"}`} onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 overflow-y-auto border-b px-6 pb-10 pt-32 shadow-2xl lg:hidden ${mobileOverlayClass}`}
            style={mobileOverlayStyle}
          >
            <div className="flex flex-col gap-4">
              {topLevelLinks.map((item) => {
                const children = getChildren(item.id);
                const hasChildren = children.length > 0;
                const isOpen = openMobileDropdowns[item.id];

                return (
                  <div key={item.id} className={`flex flex-col border-b pb-4 ${forceSolid ? "header-solid-border" : "border-border/50"}`}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => !hasChildren ? handleLinkClick(item.url) : toggleMobileDropdown(item.id)}
                        className={`flex-1 text-left text-xl outline-none ${forceSolid ? "header-solid-text" : "text-foreground"} ${navTypographyClasses}`}
                      >
                        {item.label}
                      </button>
                      {hasChildren && (
                        <button onClick={() => toggleMobileDropdown(item.id)} className={`p-2 ${forceSolid ? "header-solid-icon" : "text-primary"}`}>
                          <ChevronDown size={20} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>

                    {hasChildren && isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className={`mt-4 flex flex-col gap-3 pl-4 ${forceSolid ? "header-solid-border border-l-2" : "border-l-2 border-primary/20"}`}>
                        {children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => handleLinkClick(child.url)}
                            className={`text-left text-base outline-none ${forceSolid ? "header-solid-muted" : "text-muted-foreground hover:text-primary"} ${navTypographyClasses}`}
                          >
                            {child.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              })}
              {navCtaLabel ? (
                <button
                  onClick={() => handleLinkClick(navCtaLink)}
                  className={forceSolid ? "btn-primary mt-6 w-full !py-4 text-lg shadow-xl" : "nav-cta-button mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-lg font-bold shadow-xl transition-all duration-300 hover:-translate-y-0.5"}
                >
                  {navCtaLabel}
                </button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
