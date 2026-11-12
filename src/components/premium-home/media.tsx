import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { Film } from "./content";

// Bewegte Medien sparen: bei aktivierter Datenspar-Funktion oder sehr langsamer Verbindung bleiben die Standbilder stehen.
export const prefersLiteMedia = () => {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(connection?.saveData) || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
};

// Autoplay auf Telefonen: iOS und Android starten ein Video nur von selbst, wenn es stumm ist und inline läuft.
// React setzt "muted" nur als Eigenschaft; hier zusätzlich als Attribut, sonst blockiert Safari den Start gelegentlich.
const armVideo = (video: HTMLVideoElement) => {
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
};

export const safePlay = (video: HTMLVideoElement, onBlocked: () => void = () => undefined) => {
  armVideo(video);
  const attempt = video.play();
  if (attempt) {
    attempt.catch((error: DOMException) => {
      if (error?.name === "NotAllowedError") onBlocked();
    });
  }
};

// Blockiert der Browser den Start (z. B. Stromsparmodus am iPhone), startet die erste Berührung, Taste oder
// Scrollbewegung die Videos.
const useUnblockOnGesture = (blocked: boolean, retry: () => void) => {
  useEffect(() => {
    if (!blocked) return;
    const events = ["pointerdown", "touchstart", "keydown", "scroll"] as const;
    const handler = () => retry();
    events.forEach((name) => window.addEventListener(name, handler, { once: true, passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, handler));
  }, [blocked, retry]);
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

// Ob Filme und Clips laufen: null heißt nach Voreinstellung (sie laufen, außer bei reduzierter Bewegung oder Datensparen),
// true oder false ist die Wahl der Person. Die Wahl gilt für alle bewegten Medien der Seite, nicht nur für die Bühne, an der
// sie getroffen wurde: Wer anhält, hält alles an.
let mediaChoice: boolean | null = null;
const mediaListeners = new Set<() => void>();
export const setMediaChoice = (value: boolean) => {
  mediaChoice = value;
  mediaListeners.forEach((listener) => listener());
};
const subscribeMedia = (listener: () => void) => {
  mediaListeners.add(listener);
  return () => void mediaListeners.delete(listener);
};
export const useMediaChoice = (): boolean | null => useSyncExternalStore(subscribeMedia, () => mediaChoice, () => null);

/** Anhalten und Abspielen für einen Bereich mit laufenden Clips; schaltet dieselbe Wahl wie die Bühne im Hero. */
export const MediaToggle = ({ className }: { className?: string }) => {
  const reduce = useReducedMotion();
  const [lite] = useState(prefersLiteMedia);
  const choice = useMediaChoice();
  const wanted = choice ?? (!reduce && !lite);
  const label = wanted ? "Videos anhalten" : "Videos abspielen";
  return (
    <button type="button" className={`pv-stage__toggle pv-media-toggle${className ? ` ${className}` : ""}`} onClick={() => setMediaChoice(!wanted)} aria-label={label} aria-pressed={wanted}>
      {wanted ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
    </button>
  );
};

// true, solange das Element zu einem Teil im Bild ist.
export const useOnScreen = <T extends Element>(threshold = 0.2, rootMargin = "0px") => {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting), { threshold, rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);
  return [ref, on] as const;
};

const FADE_MS = 900;

/**
 * Filmbühne im Hero: mehrere Filme laufen nacheinander und blenden ineinander über. Der nächste Film startet kurz
 * vor dem Ende des laufenden und legt sich weich darüber, es gibt also kein stehendes Bild und keinen Schnitt auf
 * Schwarz. Geladen wird immer nur der laufende Film und, ab der Hälfte, der nächste. Bei reduzierter Bewegung oder
 * Datenspar-Modus bleibt das erste Bild stehen; blockiert der Browser den Start, fährt das Standbild langsam und die
 * erste Berührung startet die Filme. Abspielen, Pause und die Szenenwahl sind immer bedienbar.
 */
export const FilmStage = ({ films, note }: { films: Film[]; note: string }) => {
  const reduce = useReducedMotion();
  const total = films.length;
  const [lite] = useState(prefersLiteMedia);
  const choice = useMediaChoice();
  const setChoice = setMediaChoice;
  const [rootRef, visible] = useOnScreen<HTMLDivElement>(0.1);
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<number[]>([0]);
  const [started, setStarted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const videos = useRef<Array<HTMLVideoElement | null>>([]);
  const bars = useRef<Array<HTMLElement | null>>([]);
  const activeRef = useRef(0);
  const fadeTimer = useRef(0);

  const wanted = choice ?? (!reduce && !lite);
  const running = wanted && visible;
  // Einmal gestartete Filme bleiben geladen, auch wenn pausiert wird.
  const [armed, setArmed] = useState(wanted);
  useEffect(() => {
    if (wanted) setArmed(true);
  }, [wanted]);

  const go = useCallback(
    (index: number) => {
      const from = activeRef.current;
      if (index === from) return;
      activeRef.current = index;
      const target = videos.current[index];
      if (target && target.readyState > 0) target.currentTime = 0;
      setLoaded((list) => (list.includes(index) ? list : [...list, index]));
      setPrevious(from);
      setActive(index);
      window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => {
        setPrevious(null);
        const old = videos.current[from];
        if (old) old.pause();
      }, FADE_MS + 60);
    },
    [],
  );

  useEffect(() => () => window.clearTimeout(fadeTimer.current), []);

  // Der aktive Film spielt, der vorige läuft während der Überblendung aus, alle anderen stehen.
  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && running) {
        safePlay(video, () => setBlocked(true));
      } else if (index !== previous || !running) {
        video.pause();
      }
    });
  }, [active, previous, running, attempt, loaded]);

  const retry = useCallback(() => {
    setBlocked(false);
    setAttempt((value) => value + 1);
  }, []);
  useUnblockOnGesture(blocked && wanted, retry);

  // Zurück im Tab: weiterlaufen lassen.
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) setAttempt((value) => value + 1);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Fortschritt, Vorladen des nächsten Films und der Wechsel kurz vor dem Ende, direkt aus der Abspielzeit.
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let lastTime = -1;
    let lastMove = performance.now();
    const tick = () => {
      const index = activeRef.current;
      const video = videos.current[index];
      const bar = bars.current[index];
      const next = (index + 1) % total;
      if (video) {
        const duration = video.duration && Number.isFinite(video.duration) ? video.duration : 8;
        if (bar) bar.style.transform = `scaleX(${Math.min(1, video.currentTime / duration)})`;
        if (video.currentTime !== lastTime) {
          lastTime = video.currentTime;
          lastMove = performance.now();
        } else if (!video.paused && performance.now() - lastMove > 6000 && total > 1) {
          // Hängt ein Film (Netz, Dekoder) länger als sechs Sekunden, geht es mit dem nächsten weiter.
          lastMove = performance.now();
          go(next);
        }
        if (total > 1) {
          if (video.currentTime > duration * 0.4) setLoaded((list) => (list.includes(next) ? list : [...list, next]));
          const upcoming = videos.current[next];
          const ready = upcoming ? upcoming.readyState >= 2 : false;
          if (duration - video.currentTime < FADE_MS / 1000 && ready) go(next);
        }
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [running, total, go]);

  const pick = (index: number) => {
    if (choice === false) setChoice(true);
    if (blocked) retry();
    bars.current.forEach((bar) => {
      if (bar) bar.style.transform = "";
    });
    go(index);
  };

  const current = films[active];
  const label = wanted ? "Filme anhalten" : "Filme abspielen";

  return (
    <div className={`pv-stage${blocked ? " is-blocked" : ""}${started ? " is-live" : ""}`} ref={rootRef} role="group" aria-roledescription="Filmfolge" aria-label="Beispiele aus Creator Studio">
      <div className="pv-stage__media" aria-hidden="true">
        <img className="pv-stage__poster" src={films[0].poster} alt="" decoding="async" {...({ fetchpriority: "high" } as Record<string, string>)} />
        {films.map((item, index) => (
          <video
            key={item.id}
            ref={(node) => { videos.current[index] = node; }}
            className={`pv-stage__video${index === active ? " is-active" : ""}${index === previous ? " is-previous" : ""}`}
            src={loaded.includes(index) && (armed || wanted) ? item.src : undefined}
            poster={index === 0 || loaded.includes(index) ? item.poster : undefined}
            muted
            playsInline
            autoPlay={index === 0 && wanted}
            preload={loaded.includes(index) ? "auto" : "none"}
            loop={total === 1}
            onPlaying={() => index === 0 && setStarted(true)}
            onEnded={() => index === activeRef.current && total > 1 && go((index + 1) % total)}
            onError={() => index === activeRef.current && total > 1 && go((index + 1) % total)}
            tabIndex={-1}
          />
        ))}
      </div>
      <div className="pv-stage__hud">
        <div className="pv-stage__now" aria-live="off">
          <span className="pv-stage__tag">{current.tag}</span>
          <strong>{current.title}</strong>
          <span className="pv-stage__who">{current.who}</span>
        </div>
        <ol className="pv-stage__list">
          {films.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={`pv-stage__pick${index === active ? " is-active" : ""}`}
                aria-label={`Film ${index + 1} von ${total}: ${item.title} (${item.who})`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => pick(index)}
              >
                <span className="pv-stage__bar"><i ref={(node) => { bars.current[index] = node; }} /></span>
                <span className="pv-stage__label">{item.who === "Ohne Creator" ? item.title.split(" ")[0] : item.who.split(" ")[0]}</span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="pv-stage__toggle" onClick={() => setChoice(!wanted)} aria-label={label} aria-pressed={wanted}>
          {wanted ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        </button>
      </div>
      <p className="pv-stage__note">{note}</p>
      <p className="pm-sr" aria-live="polite">{`${current.title}, ${current.who}. ${note}`}</p>
    </div>
  );
};

/**
 * Standbild mit Video darüber. Das Video wird erst geladen, wenn das Element in die Nähe des Bildschirms kommt, und
 * spielt stumm in Schleife, solange es gut sichtbar ist (oder `active` es verlangt).
 */
export const Clip = ({
  src,
  poster,
  label,
  loop = true,
  eager = false,
  onEnded,
}: {
  src: string;
  poster: string;
  label: string;
  loop?: boolean;
  eager?: boolean;
  onEnded?: () => void;
}) => {
  const reduce = useReducedMotion();
  const [lite] = useState(prefersLiteMedia);
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const choice = useMediaChoice();
  // Wer ausdrücklich abspielt, bekommt die Clips auch bei reduzierter Bewegung; wer anhält, hält alle an.
  const allowed = choice ?? (!reduce && !lite);

  useEffect(() => {
    const node = box.current;
    if (!node || !allowed || typeof IntersectionObserver === "undefined") return;
    const nearObserver = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "360px 0px" });
    const playObserver = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: 0.45 });
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
    if (playing && choice !== false) safePlay(element);
    else element.pause();
  }, [playing, near, choice]);

  return (
    <div className="pv-clip" ref={box}>
      <img src={poster} alt={label} loading={eager ? "eager" : "lazy"} decoding="async" />
      {near && allowed ? (
        <video
          ref={video}
          className={ready ? "is-ready" : undefined}
          src={src}
          muted
          loop={loop}
          playsInline
          // Geladen wird erst, wenn der Clip wirklich läuft: ein Clip knapp unter dem sichtbaren Bereich fing sonst an zu laden,
          // und der Browser brach diesen Abruf gleich wieder ab (als fehlgeschlagener Abruf sichtbar, am Telefon verschenktes Datenvolumen).
          preload={playing ? "auto" : "none"}
          onPlaying={() => setReady(true)}
          onEnded={onEnded}
          tabIndex={-1}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
};
