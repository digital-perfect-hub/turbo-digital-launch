import { useEffect, useMemo, useRef, useState, type ElementType, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ArrowUpRight, Boxes, Command, CornerDownLeft, Film, FolderKanban, Search, Send, ShieldHalf, Sparkles, Terminal } from "lucide-react";
import { STUDIO_URL } from "./content";

// App-Schale der Premium-Startseite: aktive Sektion (Scrollspy), Befehlspalette (Strg/⌘ + K) und auf dem Telefon
// eine Tab-Leiste wie in einer App. Alles nur Navigation, keine Daten.

export const SPY_IDS = ["studio", "ablauf", "kontrolle", "leistungen", "branchen", "projekte", "kontakt"] as const;

// Vorauswahl im Anfrageformular, z. B. aus der Befehlspalette oder einem Button ("Pilotzugang", "Projekt").
export const INTEREST_EVENT = "pm:interest";
export const requestInterest = (option: string) => {
  window.dispatchEvent(new CustomEvent(INTEREST_EVENT, { detail: option }));
};

export const useScrollSpy = (ids: readonly string[]) => {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length || !("IntersectionObserver" in window)) return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
        const current = ids.find((id) => visible.get(id));
        setActive(current ?? null);
      },
      { rootMargin: "-42% 0px -52% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
};

type PaletteItem = {
  id: string;
  group: string;
  label: string;
  hint: string;
  icon: ElementType;
  run: () => void;
};

const go = (hash: string) => {
  const target = document.getElementById(hash);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${hash}`);
};

export const CommandPalette = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<PaletteItem[]>(
    () => [
      { id: "studio", group: "Springen", label: "Creator Studio", hint: "KI-Figuren, Szenen, Videos", icon: Sparkles, run: () => go("studio") },
      { id: "ablauf", group: "Springen", label: "Ablauf", hint: "Vom Steckbrief zum Reel", icon: Film, run: () => go("ablauf") },
      { id: "kontrolle", group: "Springen", label: "Kostenkontrolle", hint: "Vorschau, Limits, Tagesbudget", icon: ShieldHalf, run: () => go("kontrolle") },
      { id: "leistungen", group: "Springen", label: "Leistungen", hint: "SEO, Shops, Betreuung", icon: Terminal, run: () => go("leistungen") },
      { id: "branchen", group: "Springen", label: "Branchen mit Regeln", hint: "CBD, Cannabis, Dating", icon: Boxes, run: () => go("branchen") },
      { id: "projekte", group: "Springen", label: "Projekte", hint: "Ausgewählte Arbeiten", icon: FolderKanban, run: () => go("projekte") },
      {
        id: "pilot",
        group: "Aktionen",
        label: "Pilotzugang anfragen",
        hint: "Creator Studio testen",
        icon: Send,
        run: () => {
          requestInterest("Creator Studio: Pilotzugang");
          go("kontakt");
        },
      },
      {
        id: "projekt",
        group: "Aktionen",
        label: "Projekt anfragen",
        hint: "Website, Shop, SEO",
        icon: Send,
        run: () => {
          requestInterest("Webentwicklung, Shop oder Plattform");
          go("kontakt");
        },
      },
      {
        id: "app",
        group: "Aktionen",
        label: "Creator Studio öffnen",
        hint: "studio.digital-perfect.com",
        icon: ArrowUpRight,
        run: () => window.open(STUDIO_URL, "_blank", "noopener,noreferrer"),
      },
    ],
    [],
  );

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
  { id: "studio", label: "Studio", icon: Sparkles },
  { id: "ablauf", label: "Ablauf", icon: Film },
  { id: "leistungen", label: "Services", icon: Terminal },
  { id: "projekte", label: "Projekte", icon: FolderKanban },
] as const;

// Telefon: Tab-Leiste unten, sobald der Hero verlassen ist. Am Kontaktformular verschwindet sie wieder.
export const MobileDock = ({ active }: { active: string | null }) => {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const on = past && active !== "kontakt";

  return (
    <nav className={`pm-dock${on ? " is-on" : ""}`} aria-label="Schnellnavigation" aria-hidden={!on}>
      {DOCK.map((item) => {
        const Icon = item.icon;
        const current = active === item.id || (item.id === "studio" && active === "kontrolle") || (item.id === "leistungen" && active === "branchen");
        return (
          <a key={item.id} href={`#${item.id}`} className={current ? "is-active" : undefined} tabIndex={on ? 0 : -1} aria-current={current ? "location" : undefined}>
            <Icon size={19} aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        );
      })}
      <a href="#kontakt" className="pm-dock__cta" tabIndex={on ? 0 : -1}>
        <Send size={18} aria-hidden="true" />
        <span>Anfrage</span>
      </a>
    </nav>
  );
};
