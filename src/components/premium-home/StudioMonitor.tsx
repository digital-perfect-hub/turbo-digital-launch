import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, Clapperboard, Coins, UserRound } from "lucide-react";
import { FrameStill, type StillCrop, type StillTone } from "./FrameStill";

// Vereinfachte Darstellung der Creator-Studio-Oberfläche mit Beispieldaten. Das sind keine Bildschirmfotos:
// Farben, Begriffe und Funktionen entsprechen dem Produkt (Creator, Szenen, Kostenvorschau, Planung), die
// Inhalte sind erfunden und als Beispiel gekennzeichnet.

type TabId = "creator" | "szenen" | "kosten" | "planung";

const TABS: Array<{ id: TabId; label: string; Icon: typeof UserRound }> = [
  { id: "creator", label: "Creator", Icon: UserRound },
  { id: "szenen", label: "Szenen", Icon: Clapperboard },
  { id: "kosten", label: "Kosten", Icon: Coins },
  { id: "planung", label: "Planung", Icon: CalendarDays },
];

const SCENES: Array<{ title: string; meta: string; status: string; state: "done" | "run" | "wait"; tone: StillTone; crop: StillCrop }> = [
  { title: "Dachterrasse, Nacht", meta: "Bild", status: "Fertig", state: "done", tone: "violet", crop: "mid" },
  { title: "Neonpassage", meta: "Video, 8 s", status: "Fertig", state: "done", tone: "teal", crop: "wide" },
  { title: "Studio, Gegenlicht", meta: "Video, 5 s", status: "Läuft", state: "run", tone: "ember", crop: "close" },
  { title: "Café am Morgen", meta: "Bild", status: "Wartet auf Freigabe", state: "wait", tone: "dawn", crop: "mid" },
];

const WEEK = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const SLOTS: Record<number, Array<{ time: string; label: string }>> = {
  0: [{ time: "09:00", label: "Reel" }],
  2: [{ time: "18:30", label: "Story" }, { time: "20:00", label: "Reel" }],
  3: [{ time: "12:15", label: "Bild" }],
  4: [{ time: "17:00", label: "Reel" }],
  6: [{ time: "10:00", label: "Bild" }],
};

const CreatorPanel = () => (
  <div className="pm-mon__creator">
    <div className="pm-mon__master">
      <FrameStill tone="ember" crop="close" reticle />
      <span className="pm-mon__tag">Masterbild</span>
    </div>
    <div className="pm-mon__fields">
      <p className="pm-mon__kicker">Creator · Beispiel</p>
      <h3 className="pm-mon__name">Juno Ark</h3>
      <dl className="pm-mon__dl">
        <div>
          <dt>Steckbrief</dt>
          <dd>Fiktive Person, Anfang 30. Kurzes silbernes Haar, kleiner orangefarbener Ohrring, dunkle Technikjacke.</dd>
        </div>
        <div>
          <dt>Format</dt>
          <dd>
            <span className="pm-chip">9:16</span>
            <span className="pm-chip">10 s</span>
          </dd>
        </div>
        <div>
          <dt>Referenzpaket</dt>
          <dd className="pm-mon__pack">
            {(["ember", "teal", "violet", "steel", "dawn"] as StillTone[]).map((tone, index) => (
              <span key={tone} className="pm-mon__thumb">
                <FrameStill tone={tone} crop={index % 2 ? "mid" : "close"} />
              </span>
            ))}
            <span className="pm-mon__ok">5 von 5 freigegeben</span>
          </dd>
        </div>
      </dl>
    </div>
  </div>
);

const ScenesPanel = () => (
  <div className="pm-mon__scenes">
    <p className="pm-mon__kicker">Szenen · Juno Ark</p>
    <ul className="pm-mon__grid">
      {SCENES.map((scene) => (
        <li key={scene.title} className={`pm-mon__scene pm-mon__scene--${scene.state}`}>
          <div className="pm-mon__frame">
            <FrameStill tone={scene.tone} crop={scene.crop} />
            {scene.state === "run" ? <span className="pm-mon__progress" aria-hidden="true" /> : null}
          </div>
          <strong>{scene.title}</strong>
          <span className="pm-mon__meta">{scene.meta}</span>
          <span className={`pm-status pm-status--${scene.state}`}>{scene.status}</span>
        </li>
      ))}
    </ul>
  </div>
);

const CostPanel = () => (
  <div className="pm-mon__cost">
    <p className="pm-mon__kicker">Kostenvorschau · Beispiel</p>
    <div className="pm-mon__dialog">
      <dl className="pm-mon__rows">
        <div><dt>Auftrag</dt><dd>Video · 9:16 · 8 s</dd></div>
        <div><dt>Modell</dt><dd>Kling v3.0</dd></div>
        <div className="pm-mon__estimate"><dt>Geschätzte Kosten</dt><dd>1,20 $</dd></div>
      </dl>
      <div className="pm-meter" role="img" aria-label="Der Auftrag nutzt 60 Prozent des Limits pro Auftrag">
        <div className="pm-meter__head"><span>Limit pro Auftrag</span><span>2,00 $</span></div>
        <div className="pm-meter__bar"><i style={{ width: "60%" }} /></div>
      </div>
      <div className="pm-meter" role="img" aria-label="Heute sind 34 Prozent des Tagesbudgets verbraucht">
        <div className="pm-meter__head"><span>Tagesbudget · heute 3,40 $</span><span>10,00 $</span></div>
        <div className="pm-meter__bar"><i style={{ width: "34%" }} /></div>
      </div>
      <div className="pm-mon__actions">
        <span className="pm-fakebtn pm-fakebtn--ghost">Abbrechen</span>
        <span className="pm-fakebtn">Freigeben und starten</span>
      </div>
    </div>
  </div>
);

const PlanPanel = () => (
  <div className="pm-mon__plan">
    <p className="pm-mon__kicker">Kalender · Warteschlange</p>
    <ol className="pm-mon__week">
      {WEEK.map((day, index) => (
        <li key={day}>
          <span className="pm-mon__day">{day}</span>
          {(SLOTS[index] ?? []).map((slot) => (
            <span key={slot.time} className="pm-mon__slot">
              <b>{slot.time}</b>
              {slot.label}
            </span>
          ))}
        </li>
      ))}
    </ol>
  </div>
);

const StudioMonitor = () => {
  const [tab, setTab] = useState<TabId>("creator");
  const [paused, setPaused] = useState(false);
  const refs = useRef<Record<TabId, HTMLButtonElement | null>>({ creator: null, szenen: null, kosten: null, planung: null });

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setTab((current) => TABS[(TABS.findIndex((item) => item.id === current) + 1) % TABS.length].id);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((item) => item.id === tab);
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else return;
    event.preventDefault();
    setTab(TABS[next].id);
    refs.current[TABS[next].id]?.focus();
  };

  return (
    <figure
      className="pm-mon"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="pm-mon__window">
        <div className="pm-mon__bar" aria-hidden="true">
          <span className="pm-mon__brand">Creator Studio</span>
          <span className="pm-mon__live"><i />Pilot</span>
        </div>
        <div className="pm-mon__body">
          <div className="pm-mon__tabs" role="tablist" aria-label="Bereiche von Creator Studio" onKeyDown={onKeyDown}>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                ref={(node) => { refs.current[id] = node; }}
                role="tab"
                id={`pm-tab-${id}`}
                aria-selected={tab === id}
                aria-controls={`pm-panel-${id}`}
                tabIndex={tab === id ? 0 : -1}
                className="pm-mon__tab"
                onClick={() => setTab(id)}
                type="button"
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="pm-mon__panel" role="tabpanel" id={`pm-panel-${tab}`} aria-labelledby={`pm-tab-${tab}`} key={tab}>
            {tab === "creator" ? <CreatorPanel /> : null}
            {tab === "szenen" ? <ScenesPanel /> : null}
            {tab === "kosten" ? <CostPanel /> : null}
            {tab === "planung" ? <PlanPanel /> : null}
          </div>
        </div>
      </div>
      <figcaption className="pm-mon__caption">Oberfläche vereinfacht dargestellt. Beispieldaten, keine Bildschirmfotos.</figcaption>
    </figure>
  );
};

export default StudioMonitor;
