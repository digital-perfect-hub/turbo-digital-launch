import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, Check, Download, Music2, Scissors, Send, Volume2 } from "lucide-react";
import { Depth, Reveal, useInViewOnce } from "./motion";
import { Clip } from "./media";
import { CREATORS, STEPS, WORLDS } from "./content";

// „So funktioniert's“: die sieben Schritte im Studio. Links die Schritte, rechts ein nachgebautes Studio-Fenster,
// das zu jedem Schritt zeigt, was man dort tut. Die Fenster sind vereinfachte Nachbauten mit echten Ergebnissen.

const pad = (value: number) => String(value).padStart(2, "0");
const maria = CREATORS[0];
const scene = (id: string) => maria.scenes.find((item) => item.id === id) ?? maria.scenes[0];
const cafe = scene("maria-cafe");
const studio = scene("maria-studio");
const gipfel = scene("maria-gipfel");
const altstadt = scene("maria-altstadt");

const Window = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="pv-win">
    <div className="pv-win__bar" aria-hidden="true">
      <i /><i /><i />
      <span>Creator Studio</span>
      <b>{title}</b>
    </div>
    <div className="pv-win__body">{children}</div>
  </div>
);

const Chip = ({ children }: { children: ReactNode }) => <span className="pv-chip">{children}</span>;

const DemoCreator = () => (
  <Window title="Creator">
    <div className="pv-d-creator">
      <figure className="pv-d-creator__face">
        <img src={studio.poster} alt="" loading="lazy" decoding="async" />
        <figcaption>Hauptbild</figcaption>
      </figure>
      <div className="pv-d-creator__form">
        <dl>
          <div><dt>Name</dt><dd>Maria Noelle</dd></div>
          <div><dt>Haare</dt><dd>braun, wellig, lang</dd></div>
          <div><dt>Augen</dt><dd>blau</dd></div>
          <div><dt>Merkmal</dt><dd>Sommersprossen</dd></div>
          <div><dt>Stil</dt><dd>natürlich, sportlich</dd></div>
        </dl>
        <p className="pv-d-label">Ansichten</p>
        <ul className="pv-d-views">
          {["Hauptbild", "Frontal", "Dreiviertel", "Seite", "Ganzkörper"].map((view) => (
            <li key={view}><Check size={12} aria-hidden="true" />{view}</li>
          ))}
        </ul>
      </div>
    </div>
  </Window>
);

const DemoImages = () => (
  <Window title="Bilder">
    <div className="pv-d-prompt"><span>Was soll zu sehen sein?</span><p>im Café am Fenster, beiger Mantel, Morgenlicht</p></div>
    <ul className="pv-d-grid">
      {[cafe, studio, gipfel, altstadt].map((item) => (
        <li key={item.id}><img src={item.poster} alt="" loading="lazy" decoding="async" /><span>{item.title}</span></li>
      ))}
    </ul>
    <p className="pv-d-foot"><Check size={13} aria-hidden="true" /> Vier Bilder, eine Person</p>
  </Window>
);

const SCENE_ROWS = [
  { item: cafe, what: "Sie nimmt einen Schluck und lächelt.", outfit: "beiger Mantel" },
  { item: altstadt, what: "Sie geht langsam auf die Kamera zu.", outfit: "langer Mantel" },
  { item: gipfel, what: "Wind im Haar, Blick zum Sonnenaufgang.", outfit: "Outdoorjacke" },
];

const DemoScenes = () => (
  <Window title="Produktion">
    <ol className="pv-d-scenes">
      {SCENE_ROWS.map((row, index) => (
        <li key={row.item.id}>
          <img src={row.item.thumb} alt="" loading="lazy" decoding="async" />
          <div>
            <b>{`Szene ${index + 1} · ${row.item.title}`}</b>
            <span>{row.what}</span>
            <em>Outfit: {row.outfit}</em>
          </div>
        </li>
      ))}
    </ol>
    <div className="pv-d-row">
      <Chip><Volume2 size={13} aria-hidden="true" /> Sprecherstimme</Chip>
      <Chip><Music2 size={13} aria-hidden="true" /> Musik</Chip>
    </div>
  </Window>
);

const DemoVideo = () => (
  <Window title="Creator-Video">
    <div className="pv-d-i2v">
      <figure><img src={cafe.poster} alt="" loading="lazy" decoding="async" /><figcaption>Bild</figcaption></figure>
      <ArrowRight size={22} aria-hidden="true" />
      <figure><Clip src={cafe.src} poster={cafe.poster} label="Maria Noelle im Café, als Video" /><figcaption>Video · 6 s</figcaption></figure>
    </div>
    <div className="pv-d-row">
      <Chip>MiniMax H3</Chip>
      <Chip>Hochformat 9:16</Chip>
      <Chip>Kostenvorschau 0,78 $</Chip>
    </div>
  </Window>
);

const DemoFree = () => (
  <Window title="Freies Video">
    <div className="pv-d-prompt"><span>Beschreib dein Video</span><p>{WORLDS[0].prompt}</p></div>
    <div className="pv-d-wide"><Clip src={WORLDS[0].src} poster={WORLDS[0].poster} label={WORLDS[0].title} /></div>
    <div className="pv-d-row">
      <Chip>Text zu Video</Chip>
      <Chip>Querformat 16:9</Chip>
      <Chip>8 s</Chip>
    </div>
  </Window>
);

const DemoEdit = () => (
  <Window title="Editor">
    <div className="pv-d-wide"><Clip src={WORLDS[1].src} poster={WORLDS[1].poster} label={WORLDS[1].title} /></div>
    <div className="pv-d-timeline" aria-hidden="true">
      <div className="pv-d-track">
        {[WORLDS[1].thumb, gipfel.thumb, WORLDS[0].thumb, altstadt.thumb].map((thumb, index) => (
          <span key={thumb} style={{ backgroundImage: `url(${thumb})`, flexGrow: [3, 2, 3, 2][index] }} />
        ))}
      </div>
      <div className="pv-d-track pv-d-track--music"><span><Music2 size={12} /> Musik</span></div>
      <i className="pv-d-playhead" />
    </div>
    <div className="pv-d-row">
      <Chip><Scissors size={13} aria-hidden="true" /> Kürzen und ordnen</Chip>
      <Chip><Download size={13} aria-hidden="true" /> Als MP4 exportieren</Chip>
    </div>
  </Window>
);

const WEEK = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const POSTS: Record<string, { time: string; where: string; thumb: string }> = {
  Mo: { time: "18:00", where: "Instagram", thumb: cafe.thumb },
  Mi: { time: "12:30", where: "TikTok", thumb: gipfel.thumb },
  Fr: { time: "19:00", where: "X", thumb: altstadt.thumb },
};

const DemoPost = () => (
  <Window title="Planung">
    <ul className="pv-d-week">
      {WEEK.map((day) => {
        const post = POSTS[day];
        return (
          <li key={day} className={post ? "has-post" : undefined}>
            <b>{day}</b>
            {post ? (
              <span>
                <img src={post.thumb} alt="" loading="lazy" decoding="async" />
                <em>{post.time}</em>
                <i>{post.where}</i>
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
    <div className="pv-d-row">
      <Chip><CalendarDays size={13} aria-hidden="true" /> Im Kalender einplanen</Chip>
      <Chip><Download size={13} aria-hidden="true" /> Herunterladen</Chip>
      <Chip><Send size={13} aria-hidden="true" /> Instagram: in Erprobung</Chip>
    </div>
  </Window>
);

const DEMOS: Record<string, () => JSX.Element> = {
  creator: DemoCreator,
  bilder: DemoImages,
  szenen: DemoScenes,
  videos: DemoVideo,
  frei: DemoFree,
  schnitt: DemoEdit,
  posten: DemoPost,
};

export const StudioSteps = ({ id = "studio" }: { id?: string }) => {
  const reduce = useReducedMotion();
  const [ref, seen] = useInViewOnce<HTMLDivElement>("0px 0px -25% 0px");
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!seen || !auto || reduce) return;
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % STEPS.length), 6000);
    return () => window.clearTimeout(timer);
  }, [seen, auto, active, reduce]);

  const pick = (index: number) => {
    setAuto(false);
    setActive(index);
  };

  const step = STEPS[active];
  const Demo = DEMOS[step.key];

  return (
    <section id={id} className="pm-section pm-light pv-steps" aria-labelledby="pv-steps-title">
      <div className="pm-wrap">
        <div className="pv-head">
          <Reveal>
            <p className="pm-kicker">So funktioniert Creator Studio</p>
            <h2 id="pv-steps-title" className="pm-h2">Vom ersten Bild bis zum fertigen Post.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="pm-body">
              Creator Studio ist ein Werkzeug im Browser. Du erschaffst eine erfundene Person, machst mit ihr immer neue Bilder
              und Videos und bringst sie bis zum fertigen Beitrag. Du brauchst dafür kein Technikwissen.
            </p>
          </Reveal>
        </div>
        <div className="pv-steps__grid" ref={ref}>
          <ol className="pv-steps__list">
            {STEPS.map((item, index) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={`pv-step${index === active ? " is-active" : ""}`}
                  aria-current={index === active ? "step" : undefined}
                  onClick={() => pick(index)}
                >
                  <span className="pv-step__no">{pad(index + 1)}</span>
                  <span className="pv-step__body">
                    <strong>{item.title}</strong>
                    <span className="pv-step__tab">{item.tab}</span>
                    <span className="pv-step__text">{item.text}</span>
                  </span>
                  {index === active && auto && !reduce && seen ? <i className="pv-step__timer" key={`t-${active}`} aria-hidden="true" /> : null}
                </button>
              </li>
            ))}
          </ol>
          <Depth className="pv-steps__demo">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step.key}
                initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
              >
                <Demo />
              </motion.div>
            </AnimatePresence>
            <div className="pv-steps__current" aria-live="polite">
              <p className="pv-steps__count">{`Schritt ${active + 1} von ${STEPS.length}`}</p>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </Depth>
        </div>
        <p className="pm-caption">Vereinfachte Darstellung der Oberfläche. Bilder und Videos sind echte Ergebnisse aus Creator Studio.</p>
      </div>
    </section>
  );
};
