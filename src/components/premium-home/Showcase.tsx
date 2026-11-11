import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Film as FilmIcon, Image as ImageIcon, ImagePlay, Type } from "lucide-react";
import { Depth, Reveal } from "./motion";
import { Clip, useOnScreen } from "./media";
import { requestInterest } from "./AppShell";
import { AI_NOTE, CREATORS, WORLDS } from "./content";

/**
 * Creator-Galerie: vier Figuren aus unserem eigenen Studio. Oben wählt man die Figur, die Bühne zeigt ihre Szenen
 * als Kartenstapel (die nächste Szene liegt schon dahinter), rechts stehen alle Szenen zum Anklicken. Videos laufen
 * stumm und schalten am Ende zur nächsten Szene weiter, Bilder nach ein paar Sekunden.
 */
export const CreatorGallery = () => {
  const reduce = useReducedMotion();
  const [who, setWho] = useState(0);
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [stageRef, onScreen] = useOnScreen<HTMLDivElement>(0.4);

  const creator = CREATORS[who];
  const scenes = creator.scenes;
  const total = scenes.length;
  const current = scenes[index % total];
  const next = () => setIndex((value) => (value + 1) % total);

  // Bilder bleiben fünf Sekunden stehen, Videos melden ihr Ende selbst.
  useEffect(() => {
    if (!auto || !onScreen || reduce || current.kind !== "bild") return;
    const timer = window.setTimeout(next, 5000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, onScreen, reduce, current.id]);

  const pickCreator = (value: number) => {
    setWho(value);
    setIndex(0);
    setAuto(true);
  };
  const pickScene = (value: number) => {
    setAuto(false);
    setIndex(value);
  };
  const step = (delta: number) => pickScene((index + delta + total) % total);

  return (
    <section id="creator" className="pm-section pv-gal" aria-labelledby="pv-gal-title">
      <div className="pv-gal__bg" aria-hidden="true" />
      <div className="pm-wrap">
        <div className="pv-head">
          <Reveal>
            <p className="pm-kicker">Echte Beispiele aus unserem Studio</p>
            <h2 id="pv-gal-title" className="pm-h2">Vier Creator. Immer dieselbe Person.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="pm-body">
              Maria, Laura, Maya und Leon gibt es nicht. Wir haben sie in Creator Studio angelegt und seitdem immer wieder neu
              fotografiert und gefilmt. Klick dich durch: anderer Ort, andere Kleidung, anderes Licht. Das Gesicht bleibt.
            </p>
          </Reveal>
        </div>

        <div className="pv-gal__who" role="tablist" aria-label="Creator wählen">
          {CREATORS.map((item, position) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={position === who}
              className={`pv-who${position === who ? " is-active" : ""}`}
              onClick={() => pickCreator(position)}
            >
              <img src={item.scenes[0].thumb} alt="" width={96} height={96} loading="lazy" decoding="async" />
              <span>
                <strong>{item.name}</strong>
                <em>{item.line}</em>
              </span>
            </button>
          ))}
        </div>

        <div className="pv-gal__grid">
          <Depth className="pv-gal__stage-wrap">
            <div className="pv-gal__stage" ref={stageRef}>
              <span className="pv-gal__ghost pv-gal__ghost--2" aria-hidden="true">
                <img src={scenes[(index + 2) % total].poster} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="pv-gal__ghost pv-gal__ghost--1" aria-hidden="true">
                <img src={scenes[(index + 1) % total].poster} alt="" loading="lazy" decoding="async" />
              </span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.figure
                  key={`${creator.id}-${current.id}`}
                  className="pv-gal__card"
                  style={{ transformPerspective: 1200 }}
                  initial={reduce ? false : { opacity: 0, scale: 0.9, x: 56, rotateY: -16 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 1.05, x: -48, rotateY: 10 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {current.kind === "video" ? (
                    <Clip src={current.src} poster={current.poster} label={`${creator.name}: ${current.title}`} loop={!auto} onEnded={auto ? next : undefined} />
                  ) : (
                    <div className="pv-clip"><img src={current.src} alt={`${creator.name}: ${current.title}`} loading="lazy" decoding="async" /></div>
                  )}
                  <figcaption>
                    <span>{current.kind === "video" ? <FilmIcon size={12} aria-hidden="true" /> : <ImageIcon size={12} aria-hidden="true" />}{current.kind === "video" ? "Video" : "Bild"}</span>
                    <strong>{current.title}</strong>
                    <em>{`${(index % total) + 1} / ${total}`}</em>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
              <div className="pv-gal__nav">
                <button type="button" onClick={() => step(-1)} aria-label="Vorige Szene"><ArrowLeft size={18} aria-hidden="true" /></button>
                <button type="button" onClick={() => step(1)} aria-label="Nächste Szene"><ArrowRight size={18} aria-hidden="true" /></button>
              </div>
            </div>
          </Depth>

          <div className="pv-gal__side">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={creator.id}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="pm-label">{creator.line}</p>
                <h3 className="pv-gal__name">{creator.name}</h3>
                <p className="pm-body">{creator.about}</p>
                <ul className="pv-gal__thumbs" aria-label={`Szenen von ${creator.name}`}>
                  {scenes.map((item, position) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={position === index % total ? "is-active" : undefined}
                        aria-pressed={position === index % total}
                        aria-label={`${item.title} (${item.kind === "video" ? "Video" : "Bild"})`}
                        onClick={() => pickScene(position)}
                      >
                        <img src={item.thumb} alt="" width={160} height={284} loading="lazy" decoding="async" />
                        {item.kind === "video" ? <i aria-hidden="true"><FilmIcon size={11} /></i> : null}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="pv-gal__fact">{`${total} Szenen, alle aus denselben Referenzbildern entstanden.`}</p>
              </motion.div>
            </AnimatePresence>
            <a className="pm-btn" href="#kontakt" onClick={() => requestInterest("Creator Studio: Pilotzugang")}>
              Eigenen Creator erstellen <ArrowRight size={18} aria-hidden="true" />
            </a>
            <p className="pm-caption">{AI_NOTE}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Tippt einen Text Zeichen für Zeichen, wenn er wechselt.
const useTyped = (text: string, enabled: boolean) => {
  const [count, setCount] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let value = 0;
    const timer = window.setInterval(() => {
      value += 2;
      setCount(value);
      if (value >= text.length) window.clearInterval(timer);
    }, 22);
    return () => window.clearInterval(timer);
  }, [text, enabled]);
  return text.slice(0, count);
};

const WORLD_FACTS = [
  { icon: Type, title: "Aus einem Satz", text: "Du beschreibst, was zu sehen sein soll. Das Studio macht daraus ein Video in Quer- oder Hochformat." },
  { icon: ImagePlay, title: "Oder aus einem Bild", text: "Lade ein eigenes Bild hoch oder nimm eines aus deiner Bibliothek als Startbild für das Video." },
  { icon: FilmIcon, title: "Weiterverwenden", text: "Freie Videos landen in derselben Bibliothek. Du kannst sie schneiden, mit Creator-Clips mischen und einplanen." },
] as const;

/**
 * Freie Videos ohne Creator: fünf Clips, die aus je einem Satz entstanden sind. Die Bühne zeigt den Satz, tippt ihn
 * beim Wechsel neu und spielt das Video dazu; am Ende geht es von selbst zum nächsten.
 */
export const FreeWorlds = () => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [ref, onScreen] = useOnScreen<HTMLDivElement>(0.35);
  const world = WORLDS[active];
  const typed = useTyped(world.prompt, onScreen && !reduce);
  const next = () => setActive((value) => (value + 1) % WORLDS.length);

  return (
    <section id="welten" className="pm-section pv-worlds" aria-labelledby="pv-worlds-title">
      <div className="pv-worlds__bg" aria-hidden="true" />
      <div className="pm-wrap">
        <div className="pv-head">
          <Reveal>
            <p className="pm-kicker">Freie Videos ohne Creator</p>
            <h2 id="pv-worlds-title" className="pm-h2">Ein Satz. Eine ganze Welt.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="pm-body">
              Creator Studio kann mehr als Personen. Beschreib einen Drohnenflug, eine Landschaft oder eine Filmszene, und du
              bekommst ein fertiges Video. Diese fünf Clips sind genau so entstanden.
            </p>
          </Reveal>
        </div>

        <Depth className="pv-world">
          <div className="pv-world__stage" ref={ref}>
            <AnimatePresence initial={false}>
              <motion.div
                key={world.id}
                className="pv-world__film"
                initial={reduce ? false : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
              >
                <Clip src={world.src} poster={world.poster} label={world.title} loop={!auto} onEnded={auto ? next : undefined} />
              </motion.div>
            </AnimatePresence>
            <span className="pv-world__shade" aria-hidden="true" />
            <div className="pv-world__prompt">
              <span>Beschreibung</span>
              <p aria-hidden="true">{typed}<i /></p>
              <p className="pm-sr">{world.prompt}</p>
            </div>
            <p className="pv-world__title">{world.title}</p>
          </div>
          <ul className="pv-world__tabs" aria-label="Freie Videos">
            {WORLDS.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={index === active ? "is-active" : undefined}
                  aria-pressed={index === active}
                  onClick={() => {
                    setAuto(false);
                    setActive(index);
                  }}
                >
                  <img src={item.thumb} alt="" width={320} height={180} loading="lazy" decoding="async" />
                  <span>{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </Depth>

        <ul className="pv-facts">
          {WORLD_FACTS.map((fact, index) => {
            const Icon = fact.icon;
            return (
              <li key={fact.title}>
                <Reveal delay={index * 0.07} className="pv-fact">
                  <span aria-hidden="true"><Icon size={18} strokeWidth={1.7} /></span>
                  <h3>{fact.title}</h3>
                  <p>{fact.text}</p>
                </Reveal>
              </li>
            );
          })}
        </ul>
        <p className="pm-caption">KI-generiert in Creator Studio mit MiniMax H3 (Text zu Video). Die Beschreibungen sind sinngemäß aus dem Englischen übersetzt.</p>
      </div>
    </section>
  );
};
