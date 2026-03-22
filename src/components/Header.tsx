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

  const isSolidHeader = forceSolid || isScrolled;
  const desktopNavColor = forceSolid ? "rgba(255,255,255,0.86)" : "var(--nav-text, #94a3b8)";
  const desktopNavHoverColor = forceSolid ? "#FF4B2C" : "var(--nav-hover, #FF4B2C)";
  const dropdownBgClass = forceSolid ? "bg-[#0E1F53] border-white/10 shadow-[0_24px_64px_-28px_rgba(2,6,23,0.75)]" : "bg-background border-border shadow-xl";
  const dropdownHoverBg = forceSolid ? "rgba(255,255,255,0.08)" : "var(--nav-hover-bg, rgba(255,75,44,0.05))";
  const mobileOverlayClass = forceSolid ? "bg-[#0E1F53] border-white/10 text-white" : "bg-background border-border";
  const logoColor = forceSolid ? "#FFFFFF" : settings.text_logo_color_hex || "inherit";
  const headerClassName = forceSolid
    ? `py-4 ${solidBackgroundClassName || "bg-[#0E1F53] border-b border-white/10 shadow-lg shadow-slate-950/15"}`
    : isScrolled
      ? "py-4 bg-background/90 backdrop-blur-xl shadow-lg border-b border-border"
      : "py-6 bg-transparent";

  return (
    <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${headerClassName}`}>
      <div className="section-container">
        <div className="flex items-center justify-between">
          <Link to="/" className="relative z-10 flex items-center gap-3 group outline-none">
            {!settings.use_text_logo && logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <span className={`text-2xl font-black tracking-tighter transition-opacity hover:opacity-80 ${logoFontClass}`} style={{ color: logoColor }}>
                {brandName}
                {settings.show_logo_dot !== false && (
                  <span style={{ color: settings.logo_dot_color_hex || settings.primary_color_hex || "#FF4B2C" }}>.</span>
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
                        style={{ backgroundColor: forceSolid ? "#FF4B2C" : "var(--nav-underline,#FF4B2C)" }}
                      />
                    )}
                  </button>

                  {hasChildren && (
                    <div className="absolute left-0 top-full min-w-[200px] translate-y-2 pt-4 opacity-0 invisible transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className={`flex flex-col gap-1 rounded-2xl border p-2 ${dropdownBgClass}`}>
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

            <Link
              to="/forum"
              className={`relative flex items-center gap-1.5 py-1 text-sm uppercase tracking-widest outline-none transition-colors duration-300 ${navTypographyClasses}`}
              style={{ color: desktopNavColor }}
              onMouseEnter={(e) => (e.currentTarget.style.color = desktopNavHoverColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = desktopNavColor)}
            >
              Forum
              {settings.nav_show_underline && (
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] w-full ${
                    settings.nav_animate_underline
                      ? "origin-left scale-x-0 transition-transform duration-300 ease-out hover:scale-x-100"
                      : "opacity-0 transition-opacity duration-300 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: forceSolid ? "#FF4B2C" : "var(--nav-underline,#FF4B2C)" }}
                />
              )}
            </Link>


            <button
              onClick={() => handleLinkClick("#kontakt")}
              className="btn-primary !px-6 !py-3 shadow-[0_10px_20px_-10px_rgba(var(--primary),0.3)] transition-colors"
              style={{ "--tw-hover-bg": "var(--cta-hover)" } as any}
            >
              Anfrage starten
            </button>
          </nav>

          <button className={`relative z-10 p-2 outline-none lg:hidden ${forceSolid ? "text-white" : "text-foreground"}`} onClick={() => setIsMobileOpen(!isMobileOpen)}>
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
          >
            <div className="flex flex-col gap-4">
              {topLevelLinks.map((item) => {
                const children = getChildren(item.id);
                const hasChildren = children.length > 0;
                const isOpen = openMobileDropdowns[item.id];

                return (
                  <div key={item.id} className={`flex flex-col border-b pb-4 ${forceSolid ? "border-white/10" : "border-border/50"}`}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => !hasChildren ? handleLinkClick(item.url) : toggleMobileDropdown(item.id)}
                        className={`flex-1 text-left text-xl outline-none ${forceSolid ? "text-white" : "text-foreground"} ${navTypographyClasses}`}
                      >
                        {item.label}
                      </button>
                      {hasChildren && (
                        <button onClick={() => toggleMobileDropdown(item.id)} className={`p-2 ${forceSolid ? "text-[#FF4B2C]" : "text-primary"}`}>
                          <ChevronDown size={20} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>

                    {hasChildren && isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className={`mt-4 flex flex-col gap-3 pl-4 ${forceSolid ? "border-l-2 border-white/15" : "border-l-2 border-primary/20"}`}>
                        {children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => handleLinkClick(child.url)}
                            className={`text-left text-base outline-none ${forceSolid ? "text-white/80 hover:text-[#FF4B2C]" : "text-muted-foreground hover:text-primary"} ${navTypographyClasses}`}
                          >
                            {child.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              })}
              <div className={`flex flex-col border-b pb-4 ${forceSolid ? "border-white/10" : "border-border/50"}`}>
                <Link
                  to="/forum"
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex-1 text-left text-xl outline-none ${forceSolid ? "text-white" : "text-foreground"} ${navTypographyClasses}`}
                >
                  Forum
                </Link>
              </div>


              <button onClick={() => handleLinkClick("#kontakt")} className="btn-primary mt-6 w-full !py-4 text-lg shadow-xl">
                Projekt anfragen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
