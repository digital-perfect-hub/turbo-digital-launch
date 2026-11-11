import { useEffect, useMemo, useRef, useState, type ElementType, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Bot, Command, CornerDownLeft, FolderKanban, Home, Layers, LayoutTemplate, Search, Send, Sparkles, Gauge } from "lucide-react";
import { STUDIO_URL } from "./content";

// App-Schale der Premium-Seiten: Befehlspalette (Strg/⌘ + K) und auf dem Telefon eine Tab-Leiste wie in einer App.
// Alles nur Navigation, keine Daten.

// Vorauswahl im Anfrageformular, z. B. aus der Befehlspalette oder einem Button ("Pilotzugang", "Projekt").
export const INTEREST_EVENT = "pm:interest";
let pendingInterest: string | null = null;
export const requestInterest = (option: string) => {
  pendingInterest = option;
  window.dispatchEvent(new CustomEvent(INTEREST_EVENT, { detail: option }));
};
export const takePendingInterest = () => {
  const value = pendingInterest;
  pendingInterest = null;
  return value;
};

export const scrollToId = (id: string) => {
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  return Boolean(target);
};

type PaletteItem = {
  id: string;
  group: string;
  label: string;
  hint: string;
  icon: ElementType;
  run: () => void;
};

export const CommandPalette = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const items = useMemo<PaletteItem[]>(() => {
    const contact = (interest: string) => () => {
      requestInterest(interest);
      scrollToId("kontakt");
    };
    return [
      { id: "home", group: "Seiten", label: "Startseite", hint: "Überblick", icon: Home, run: () => navigate("/") },
      { id: "studio", group: "Seiten", label: "Creator Studio", hint: "KI-Creator, Bilder, Videos, Planung", icon: Sparkles, run: () => navigate("/creator-studio") },
      { id: "web", group: "Seiten", label: "Webdesign & Entwicklung", hint: "Websites, Shops, Plattformen", icon: LayoutTemplate, run: () => navigate("/webdesign") },
      { id: "seo", group: "Seiten", label: "Technische SEO", hint: "Crawling, Indexierung, Ladezeit", icon: Gauge, run: () => navigate("/technische-seo") },
      { id: "geo", group: "Seiten", label: "KI-Sichtbarkeit (GEO)", hint: "ChatGPT, Perplexity, Google AI", icon: Bot, run: () => navigate("/ki-sichtbarkeit") },
      { id: "leistungen", group: "Seiten", label: "Leistungen", hint: "Alles im Überblick", icon: Layers, run: () => navigate("/leistungen") },
      { id: "projekte", group: "Seiten", label: "Projekte", hint: "Websites, die wir gebaut haben", icon: FolderKanban, run: () => navigate("/projekte") },
      { id: "kontakt", group: "Seiten", label: "Kontakt", hint: "Anfrage senden", icon: Send, run: () => navigate("/kontakt") },
      { id: "pilot", group: "Aktionen", label: "Pilotzugang anfragen", hint: "Creator Studio testen", icon: Send, run: contact("Creator Studio: Pilotzugang") },
      { id: "projekt", group: "Aktionen", label: "Projekt anfragen", hint: "Website, Shop, SEO, KI-Sichtbarkeit", icon: Send, run: contact("Webdesign oder Webentwicklung") },
      { id: "app", group: "Aktionen", label: "Creator Studio öffnen", hint: "studio.digital-perfect.com", icon: ArrowUpRight, run: () => window.open(STUDIO_URL, "_blank", "noopener,noreferrer") },
    ];
  }, [navigate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.label} ${item.hint} ${item.group}`.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  if (!open) return null;

  const run = (item: PaletteItem | undefined) => {
    if (!item) return;
    onClose();
    window.setTimeout(item.run, 30);
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((value) => Math.min(filtered.length - 1, value + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((value) => Math.max(0, value - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(filtered[index]);
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  let lastGroup = "";
  return (
    <div className="pm-cmd" role="dialog" aria-modal="true" aria-label="Befehlspalette" onMouseDown={onClose}>
      <div className="pm-cmd__panel" onMouseDown={(event) => event.stopPropagation()} onKeyDown={onKeyDown}>
        <div className="pm-cmd__search">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Wohin? Tippe z. B. „SEO“ oder „Pilot“"
            aria-label="Befehl suchen"
            aria-controls="pm-cmd-list"
            aria-activedescendant={filtered[index] ? `pm-cmd-${filtered[index].id}` : undefined}
          />
          <kbd>Esc</kbd>
        </div>
        <ul id="pm-cmd-list" className="pm-cmd__list" role="listbox">
          {filtered.length === 0 ? <li className="pm-cmd__empty">Nichts gefunden.</li> : null}
          {filtered.map((item, position) => {
            const Icon = item.icon;
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <li key={item.id} role="presentation">
                {showGroup ? <p className="pm-cmd__group">{item.group}</p> : null}
                <button
                  id={`pm-cmd-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected={position === index}
                  className={`pm-cmd__item${position === index ? " is-active" : ""}`}
                  onMouseEnter={() => setIndex(position)}
                  onClick={() => run(item)}
                >
                  <span className="pm-cmd__icon"><Icon size={16} aria-hidden="true" /></span>
                  <span className="pm-cmd__text">
                    <strong>{item.label}</strong>
                    <span>{item.hint}</span>
                  </span>
                  {position === index ? <CornerDownLeft size={14} aria-hidden="true" className="pm-cmd__enter" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="pm-cmd__foot" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> wählen</span>
          <span><kbd>↵</kbd> öffnen</span>
          <span className="pm-cmd__brand"><Command size={12} /> Digital-Perfect</span>
        </div>
      </div>
    </div>
  );
};

// Tastenkürzel Strg/⌘ + K für die Befehlspalette.
export const usePaletteHotkey = (setOpen: (updater: (value: boolean) => boolean) => void) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
};

const DOCK = [
  { to: "/", label: "Start", icon: Home },
  { to: "/creator-studio", label: "Studio", icon: Sparkles },
  { to: "/leistungen", label: "Leistungen", icon: Layers },
  { to: "/projekte", label: "Projekte", icon: FolderKanban },
] as const;

// Telefon: Tab-Leiste unten, sobald der Seitenkopf verlassen ist. Am Kontaktformular verschwindet sie wieder.
export const MobileDock = () => {
  const { pathname } = useLocation();
  const [past, setPast] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    const target = document.getElementById("kontakt");
    if (!target || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setAtContact(entry.isIntersecting), { rootMargin: "-30% 0px -30% 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  const on = past && !atContact;
  return (
    <nav className={`pm-dock${on ? " is-on" : ""}`} aria-label="Schnellnavigation" aria-hidden={!on}>
      {DOCK.map((item) => {
        const Icon = item.icon;
        const current = pathname === item.to || (item.to === "/leistungen" && ["/webdesign", "/technische-seo", "/ki-sichtbarkeit"].includes(pathname));
        return (
          <Link key={item.to} to={item.to} className={current ? "is-active" : undefined} tabIndex={on ? 0 : -1} aria-current={current ? "page" : undefined}>
            <Icon size={19} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <a href="#kontakt" className="pm-dock__cta" tabIndex={on ? 0 : -1}>
        <Send size={18} aria-hidden="true" />
        <span>Anfrage</span>
      </a>
    </nav>
  );
};
