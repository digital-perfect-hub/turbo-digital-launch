import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { HERO_FILM, MARIA_DISCLOSURE, REEL_SCENES } from "./content";

const pad = (value: number) => String(value).padStart(2, "0");

// Bewegte Medien sparen: bei aktivierter Datenspar-Funktion oder sehr langsamer Verbindung bleiben die Standbilder stehen.
const prefersLiteMedia = () => {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(connection?.saveData) || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
};

export const useMinWidth = (px: number) => {
  const query = `(min-width: ${px}px)`;
  const [matches, setMatches] = useState(() => (typeof window === "undefined" ? false : window.matchMedia(query).matches));
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
};

const timecode = (seconds: number) => {
  const whole = Math.floor(seconds);
  return `00:${pad(Math.floor(whole / 60))}:${pad(whole % 60)}:${pad(Math.floor((seconds - whole) * 24))}`;
};

/**
 * Showreel im Hero: vier echte Szenen derselben fiktiven Figur aus Creator Studio, nacheinander und einzeln wählbar.
 * Es läuft immer nur ein Video. Das nächste wird erst nach knapp der Hälfte des aktuellen geladen. Bei reduzierter
 * Bewegung, Datenspar-Modus oder blockiertem Autoplay bleibt das Standbild stehen; Abspielen und Pause sind immer bedienbar.
 */
export const ReelPlayer = () => {
  const reduce = useReducedMotion();
  const total = REEL_SCENES.length;
  const [active, setActive] = useState(0);
  const [lite] = useState(prefersLiteMedia);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const videos = useRef<Array<HTMLVideoElement | null>>([]);
  const bars = useRef<Array<HTMLElement | null>>([]);
  const clock = useRef<HTMLSpanElement>(null);

  const wanted = choice ?? (!reduce && !lite);
  const running = wanted && visible;

  useEffect(() => {
    const node = root.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && running) {
        video.preload = "auto";
        const attempt = video.play();
        if (attempt) {
          attempt.catch((error: DOMException) => {
            if (error?.name === "NotAllowedError") setChoice(false);
          });
        }
      } else {
        video.pause();
      }
    });
  }, [active, running]);

  // Zeitmarke und Fortschrittsbalken ohne React-Neuzeichnen, direkt aus der Abspielzeit.
  useEffect(() => {
    let frame = 0;
    let warmed = -1;
    const tick = () => {
      const video = videos.current[active];
      const bar = bars.current[active];
      if (video) {
        const duration = video.duration && Number.isFinite(video.duration) ? video.duration : REEL_SCENES[active].seconds;
        if (clock.current) clock.current.textContent = timecode(video.currentTime);
        if (bar) bar.style.transform = `scaleX(${Math.min(1, video.currentTime / duration)})`;
        const next = (active + 1) % total;
        if (warmed !== next && video.currentTime > duration * 0.45) {
          const upcoming = videos.current[next];
          if (upcoming && upcoming.preload !== "auto") {
            upcoming.preload = "auto";
            upcoming.load();
          }
          warmed = next;
        }
      }
      frame = window.requestAnimationFrame(tick);
    };
    if (running) frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      bars.current.forEach((bar) => {
        if (bar) bar.style.transform = "";
      });
    };
  }, [active, running, total]);

  const show = (index: number) => {
    const video = videos.current[index];
    if (video) video.currentTime = 0;
    if (clock.current) clock.current.textContent = timecode(0);
    setActive(index);
    if (choice === false) setChoice(true);
  };

  const scene = REEL_SCENES[active];
  const toggleLabel = wanted ? "Szenen anhalten" : "Szenen abspielen";

  return (
    <div className="pm-reel" ref={root} role="group" aria-roledescription="Szenenfolge" aria-label="Beispielszenen aus Creator Studio">
      <div className="pm-reel__col">
        <div className="pm-reel__frame">
          <img
            className="pm-reel__base"
            src={REEL_SCENES[0].poster}
            alt=""
            width={720}
            height={1280}
            decoding="async"
            {...({ fetchpriority: "high" } as Record<string, string>)}
          />
          {REEL_SCENES.map((item, index) => (
            <video
              key={item.id}
              ref={(node) => { videos.current[index] = node; }}
              className={`pm-reel__video${index === active ? " is-active" : ""}`}
              src={item.src}
              poster={item.poster}
              muted
              playsInline
              preload={index === 0 ? "auto" : "none"}
              onEnded={() => show((index + 1) % total)}
              tabIndex={-1}
              aria-hidden="true"
            />
          ))}
          <span className="pm-reel__shade" aria-hidden="true" />
          <span className="pm-reel__grain" aria-hidden="true" />
          <span className="pm-reel__marks" aria-hidden="true" />

          <div className="pm-reel__top">
            <div className="pm-reel__bars">
              {REEL_SCENES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pm-reel__bar${index < active ? " is-done" : ""}${index === active ? " is-active" : ""}`}
                  aria-label={`Szene ${index + 1} von ${total}: ${item.title}`}
                  aria-current={index === active ? "true" : undefined}
                  onClick={() => show(index)}
                >
                  <i ref={(node) => { bars.current[index] = node; }} />
                </button>
              ))}
            </div>
            <div className="pm-reel__status">
              <span className="pm-reel__rec" aria-hidden="true"><i />REC</span>
              <span className="pm-reel__tc" ref={clock} aria-hidden="true">{timecode(0)}</span>
              <span className="pm-reel__count" aria-hidden="true">{`${pad(active + 1)} / ${pad(total)}`}</span>
              <button type="button" className="pm-reel__toggle" onClick={() => setChoice(!wanted)} aria-label={toggleLabel} aria-pressed={wanted}>
                {wanted ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="pm-reel__info">
            <p className="pm-reel__scene">{scene.title}</p>
            <p className="pm-reel__model">{scene.model}</p>
          </div>
          <p className="pm-reel__ai">{MARIA_DISCLOSURE}</p>
        </div>

        <ul className="pm-reel__tabs">
          {REEL_SCENES.map((item, index) => (
            <li key={item.id}>
              <button type="button" className={`pm-reel__tab${index === active ? " is-active" : ""}`} onClick={() => show(index)} aria-pressed={index === active}>
                <img src={item.thumb} alt="" width={240} height={427} loading="lazy" decoding="async" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="pm-sr" aria-live="polite">{`Szene ${active + 1} von ${total}: ${scene.title}. ${MARIA_DISCLOSURE}`}</p>
    </div>
  );
};

/**
 * Hero-Film für den Rechner: ein 16:9-Film füllt den Hero, der Text liegt links auf der dunklen Bildhälfte.
 * Der Film läuft einmal (8 s) und bleibt dann auf dem letzten Bild stehen, es gibt keinen Schnitt zurück an den Anfang.
 * Bei reduzierter Bewegung, Datenspar-Modus oder blockiertem Autoplay bleibt das erste Bild stehen und der Film wird erst
 * auf Knopfdruck geladen. Abspielen, Pause und Wiederholen sind immer bedienbar. Wird nur ab 1024 px Breite gerendert.
 * Gibt zwei Geschwister zurück: die Bildebene hinter dem Hero-Text und die Bedienleiste darüber (sonst nicht klickbar).
 */
export const HeroFilm = () => {
  const reduce = useReducedMotion();
  const [lite] = useState(prefersLiteMedia);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [ended, setEnded] = useState(false);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const clock = useRef<HTMLSpanElement>(null);

  const wanted = choice ?? (!reduce && !lite);
  const running = wanted && visible && !ended;

  useEffect(() => {
    const node = root.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (running) {
      const attempt = element.play();
      if (attempt) {
        attempt.catch((error: DOMException) => {
          if (error?.name === "NotAllowedError") setChoice(false);
        });
      }
    } else {
      element.pause();
    }
  }, [running]);

  // Zeitmarke direkt aus der Abspielzeit, ohne React-Neuzeichnen.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const element = video.current;
      if (element && clock.current) clock.current.textContent = timecode(element.currentTime);
      frame = window.requestAnimationFrame(tick);
    };
    if (running) frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [running]);

  const toggle = () => {
    if (ended) {
      const element = video.current;
      if (element) element.currentTime = 0;
      if (clock.current) clock.current.textContent = timecode(0);
      setEnded(false);
      setChoice(true);
      return;
    }
    setChoice(!wanted);
  };

  const label = ended ? "Film noch einmal abspielen" : wanted ? "Film anhalten" : "Film abspielen";

  return (
    <>
      <div className="pm-film" ref={root} role="group" aria-roledescription="Film" aria-label="Beispielfilm aus Creator Studio">
        <img
          className="pm-film__poster"
          src={HERO_FILM.poster}
          alt=""
          width={1920}
          height={1080}
          decoding="async"
          {...({ fetchpriority: "high" } as Record<string, string>)}
        />
        <video
          ref={video}
          className={`pm-film__video${ready ? " is-ready" : ""}`}
          src={HERO_FILM.src}
          poster={HERO_FILM.poster}
          muted
          playsInline
          preload={wanted ? "auto" : "none"}
          onPlaying={() => setReady(true)}
          onEnded={() => setEnded(true)}
          tabIndex={-1}
          aria-hidden="true"
        />
        <span className="pm-film__shade" aria-hidden="true" />
        <span className="pm-film__grain" aria-hidden="true" />
        <p className="pm-sr">{`${HERO_FILM.title}. ${MARIA_DISCLOSURE}`}</p>
      </div>
      <div className="pm-film__hud">
        <p className="pm-film__scene">{HERO_FILM.title}</p>
        <p className="pm-film__model">{HERO_FILM.model}</p>
        <p className="pm-film__ai">{MARIA_DISCLOSURE}</p>
        <div className="pm-film__ctl">
          <span className="pm-film__rec" aria-hidden="true"><i />REC</span>
          <span className="pm-film__tc" ref={clock} aria-hidden="true">{timecode(0)}</span>
          <button type="button" className="pm-film__toggle" onClick={toggle} aria-label={label}>
            {ended ? <RotateCcw size={16} aria-hidden="true" /> : wanted ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </>
  );
};

/**
 * Kachel mit Standbild. Das Video wird erst geladen, wenn die Kachel in die Nähe des Bildschirms kommt, und
 * spielt stumm, solange sie zu mindestens der Hälfte sichtbar ist.
 */
export const LazyClip = ({ src, poster, label }: { src: string; poster: string; label: string }) => {
  const reduce = useReducedMotion();
  const [lite] = useState(prefersLiteMedia);
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const allowed = !reduce && !lite;

  useEffect(() => {
    const node = box.current;
    if (!node || !allowed || typeof IntersectionObserver === "undefined") return;
    const nearObserver = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "320px 0px" });
    const playObserver = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: 0.55 });
    nearObserver.observe(node);
    playObserver.observe(node);
    return () => {
      nearObserver.disconnect();
      playObserver.disconnect();
    };
  }, [allowed]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (playing) element.play().catch(() => undefined);
    else element.pause();
  }, [playing, near]);

  return (
    <div className="pm-clip" ref={box}>
      <img src={poster} alt={label} width={720} height={1280} loading="lazy" decoding="async" />
      {near && allowed ? (
        <video
          ref={video}
          className={`pm-clip__video${ready ? " is-ready" : ""}`}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={() => setReady(true)}
          tabIndex={-1}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
};
