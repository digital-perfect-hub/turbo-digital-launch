import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { Reel } from "./content";

// Bewegte Medien sparen: bei aktivierter Datenspar-Funktion oder sehr langsamer Verbindung bleiben die Standbilder stehen.
// Entschieden wird einmal je Seitenaufruf, beim ersten Bereich, der fragt: Die Schätzung des Browsers schwankt, während die
// Seite lädt, und ohne das sähe ein Bereich Videos vor und der nächste nicht.
let liteMedia: boolean | null = null;
export const prefersLiteMedia = () => {
  if (typeof navigator === "undefined") return false;
  if (liteMedia === null) {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    liteMedia = Boolean(connection?.saveData) || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
  }
  return liteMedia;
};

/* ───── Abspielen: eine Stelle für alle Videos der Seite ─────
 *
 * Ein Telefon startet ein Video nur von selbst, wenn es stumm ist und inline läuft, und manche gar nicht: im
 * Stromsparmodus, im Datensparmodus oder wenn Autoplay am Gerät abgeschaltet ist, lehnt der Browser jeden Start ab, der
 * nicht während einer Berührung kommt. Deshalb läuft jeder Start über `start`: Wird er abgelehnt, merkt sich die Seite
 * das Video und startet es bei der nächsten Berührung, noch während diese läuft (nur dann lässt der Browser es zu).
 * Dieselbe Berührung stößt auch die Videos an, die schon da sind, aber noch nicht laufen sollen: Ein Video, das einmal
 * während einer Berührung gestartet wurde, darf danach von selbst anlaufen. Clips und Ringkarten nehmen ihr Video-Element
 * deshalb aus einem Vorrat und geben es zurück: Nach der ersten Berührung liegen dort freie Elemente, und jeder spätere
 * Clip läuft ohne weitere Berührung an, auch wenn die Galerie von selbst weiterschaltet. Das Attribut `autoplay` wird bewusst nicht
 * gesetzt: Safari hält solche Videos nach eigenen Regeln an und setzt sie fort, und das verträgt sich nicht mit einer
 * Steuerung von außen.
 */
const wanting = new Set<HTMLVideoElement>(); // sollen gerade laufen
const refused = new Set<HTMLVideoElement>(); // Start vom Browser abgelehnt, warten auf eine Berührung
const known = new Set<HTMLVideoElement>(); // alle Videos, die es gerade gibt
const freed = new WeakSet<HTMLVideoElement>(); // schon einmal während einer Berührung gestartet
const quiet = new WeakSet<HTMLVideoElement>(); // Beiwerk (Ringkarten): eine Ablehnung ändert die Anzeige der Seite nicht
const idle: HTMLVideoElement[] = []; // Vorrat: freie Elemente ohne Quelle
const IDLE_TARGET = 4;
const watchers = new Set<() => void>();
let everRefused = false;
let unlockedAt = -1e9;
let listening = false;

const emit = () => watchers.forEach((watcher) => watcher());
const subscribe = (watcher: () => void) => {
  watchers.add(watcher);
  return () => void watchers.delete(watcher);
};

// Protokoll für die Prüfansicht am Gerät (Adresse mit ?videotest); ohne sie wird nichts aufgezeichnet.
export const VIDEO_TEST = typeof window !== "undefined" && /[?&]videotest\b/.test(window.location.search);
export const playbackLog: string[] = [];
const log = (video: HTMLVideoElement | null, what: string) => {
  if (!VIDEO_TEST) return;
  const file = video ? (video.currentSrc || video.src || "ohne Quelle").split("/").pop() : "Seite";
  playbackLog.push(`${(performance.now() / 1000).toFixed(1)}s ${file}: ${what}`);
  if (playbackLog.length > 60) playbackLog.shift();
};

// React setzt "muted" nur als Eigenschaft; hier zusätzlich als Attribut, sonst blockiert Safari den Start gelegentlich.
const armVideo = (video: HTMLVideoElement) => {
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
};

const make = () => {
  const video = document.createElement("video");
  video.tabIndex = -1;
  video.setAttribute("aria-hidden", "true");
  armVideo(video);
  return video;
};

// Während einer Berührung kurz anstoßen: Danach lässt der Browser das Element auch ohne Berührung starten.
const free = (video: HTMLVideoElement) => {
  freed.add(video);
  armVideo(video);
  try {
    const attempt = video.play();
    video.pause();
    attempt?.catch(() => undefined);
  } catch {
    /* ohne Quelle: nichts zu tun */
  }
};

/** Ein Video-Element aus dem Vorrat (nach der ersten Berührung ein freies), sonst ein neues. */
const borrowVideo = () => idle.pop() ?? make();

const returnVideo = (video: HTMLVideoElement) => {
  video.pause();
  video.removeAttribute("src");
  video.load();
  video.className = "";
  video.loop = false;
  if (freed.has(video) && idle.length < IDLE_TARGET + 2) idle.push(video);
};

const start = (video: HTMLVideoElement) => {
  armVideo(video);
  let attempt: Promise<void> | undefined;
  try {
    attempt = video.play();
  } catch {
    return;
  }
  log(video, "Start verlangt");
  attempt?.then(
    () => {
      log(video, "läuft");
      if (refused.delete(video)) emit();
    },
    (error: DOMException) => {
      log(video, `Start abgelehnt (${error?.name ?? "unbekannt"})`);
      // AbortError heißt nur: Inzwischen kam eine Pause oder eine neue Quelle. Nur die Ablehnung des Browsers zählt.
      if (error?.name !== "NotAllowedError" || !wanting.has(video)) return;
      everRefused = true;
      if (!refused.has(video)) {
        refused.add(video);
        emit();
      }
    },
  );
};

// Läuft noch während der Berührung, nicht erst danach: Nur so gilt der Start als von der Person ausgelöst.
const onGesture = () => {
  let revived = false;
  wanting.forEach((video) => {
    if (!video.paused) return;
    if (refused.has(video)) revived = true;
    freed.add(video);
    start(video);
  });
  if (revived) {
    unlockedAt = performance.now();
    log(null, "Berührung: abgelehnte Videos gestartet");
  }
  if (!everRefused) return;
  known.forEach((video) => {
    if (!wanting.has(video) && !freed.has(video)) free(video);
  });
  while (idle.length < IDLE_TARGET) {
    const video = make();
    free(video);
    idle.push(video);
  }
};

const onReturn = () => {
  if (document.hidden) return;
  wanting.forEach((video) => {
    if (video.paused) start(video);
  });
};

const listen = () => {
  if (listening || typeof window === "undefined") return;
  listening = true;
  (["touchstart", "touchend", "pointerdown", "pointerup", "click", "keydown"] as const).forEach((name) => window.addEventListener(name, onGesture, { capture: true, passive: true }));
  document.addEventListener("visibilitychange", onReturn);
  window.addEventListener("pageshow", onReturn);
};

/** true für einen Augenblick nach der Berührung, die abgelehnte Videos gestartet hat: Ihr Klick soll nicht gleich wieder anhalten. */
const justUnlocked = () => performance.now() - unlockedAt < 800;

/**
 * Lässt das Video laufen, solange `on` gilt, und hält es sonst an. `present` sagt, ob es das Element gerade gibt (für
 * Videos, die erst später eingehängt werden). Bleibt ein Video stehen, obwohl es laufen soll, wird der Start wiederholt.
 */
export const useAutoPlay = (ref: RefObject<HTMLVideoElement | null>, on: boolean, present: unknown = true, beiwerk = false) => {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    listen();
    known.add(video);
    if (beiwerk) quiet.add(video);
    let timer = 0;
    if (on) {
      wanting.add(video);
      start(video);
      timer = window.setInterval(() => {
        if (video.paused && !refused.has(video) && !document.hidden) start(video);
      }, 2500);
    } else {
      video.pause();
    }
    return () => {
      window.clearInterval(timer);
      known.delete(video);
      wanting.delete(video);
      if (refused.delete(video)) emit();
    };
  }, [ref, on, present, beiwerk]);
};

/**
 * Hängt ein Video-Element aus dem Vorrat in `host` ein, solange `src` gesetzt ist, und gibt es danach zurück. Das Element
 * bekommt die Klasse is-ready, sobald es wirklich läuft. Liefert den Verweis auf das Element und ob es gerade eingehängt ist.
 */
export const usePooledVideo = (host: RefObject<HTMLElement | null>, src: string | null | undefined, onEnded?: () => void) => {
  const video = useRef<HTMLVideoElement | null>(null);
  const [attached, setAttached] = useState(false);
  const ended = useRef(onEnded);
  ended.current = onEnded;
  useEffect(() => {
    const parent = host.current;
    if (!src || !parent) return;
    const node = borrowVideo();
    const onPlaying = () => node.classList.add("is-ready");
    const onEnd = () => ended.current?.();
    node.addEventListener("playing", onPlaying);
    node.addEventListener("ended", onEnd);
    node.preload = "none";
    node.src = src;
    parent.appendChild(node);
    video.current = node;
    setAttached(true);
    return () => {
      node.removeEventListener("playing", onPlaying);
      node.removeEventListener("ended", onEnd);
      video.current = null;
      setAttached(false);
      node.remove();
      returnVideo(node);
    };
  }, [host, src]);
  return [video, attached] as const;
};

/** true, solange der Browser den Start dieses Videos ablehnt (bis zur nächsten Berührung). */
export const useIsRefused = (ref: RefObject<HTMLVideoElement | null>) =>
  useSyncExternalStore(subscribe, () => (ref.current ? refused.has(ref.current) : false), () => false);

/** true, solange der Browser irgendein Video der Seite nicht von selbst starten lässt. */
const anyRefused = () => {
  for (const video of refused) if (!quiet.has(video)) return true;
  return false;
};
export const useAutoplayRefused = () => useSyncExternalStore(subscribe, anyRefused, () => false);

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

// Der Knopf zeigt „anhalten“ nur, wenn wirklich etwas läuft. Lehnt der Browser den Start ab, zeigt er „abspielen“, und der
// Klick darauf ist die Berührung, die alles startet.
const useMediaSwitch = () => {
  const reduce = useReducedMotion();
  const [lite] = useState(prefersLiteMedia);
  const choice = useMediaChoice();
  const stuck = useAutoplayRefused();
  const wanted = choice ?? (!reduce && !lite);
  const playing = wanted && !stuck;
  const toggle = () => setMediaChoice(stuck || justUnlocked() ? true : !wanted);
  return { wanted, playing, toggle };
};

/** Anhalten und Abspielen für einen Bereich mit laufenden Clips; schaltet dieselbe Wahl wie die Bühne im Hero. */
export const MediaToggle = ({ className }: { className?: string }) => {
  const { playing, toggle } = useMediaSwitch();
  const label = playing ? "Videos anhalten" : "Videos abspielen";
  return (
    <button type="button" className={`pv-stage__toggle pv-media-toggle${className ? ` ${className}` : ""}`} onClick={toggle} aria-label={label} aria-pressed={playing}>
      {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
    </button>
  );
};

// true, solange das Element zu einem Teil im Bild ist. `initial` gilt, bis die erste Messung da ist.
export const useOnScreen = <T extends Element>(threshold = 0.2, rootMargin = "0px", initial = false) => {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(initial);
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

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Filmbühne im Hero: ein durchgehender Film, in dem die einzelnen Filme schon ineinander überblenden (siehe Reel in
 * content.ts). Es gibt nur ein Video-Element und keinen Wechsel zwischen Dateien; welcher Film gerade zu sehen ist, liest
 * die Anzeige aus der Abspielzeit. Die Auswahl springt im Film an die Stelle. Bei reduzierter Bewegung oder Datenspar-Modus
 * bleibt das erste Bild stehen; lehnt der Browser den Start ab, fährt das Standbild langsam, und die erste Berührung
 * startet den Film. Abspielen, Pause und die Szenenwahl sind immer bedienbar.
 */
export const FilmStage = ({ reel, note }: { reel: Reel; note: string }) => {
  const films = reel.films;
  const total = films.length;
  const { wanted, playing, toggle } = useMediaSwitch();
  const choice = useMediaChoice();
  // Der Hero steht beim Laden oben im Bild: Der Film startet sofort und wartet nicht auf die erste Messung.
  const [rootRef, visible] = useOnScreen<HTMLDivElement>(0.1, "0px", true);
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const bars = useRef<Array<HTMLElement | null>>([]);
  const jump = useRef<number | null>(null);

  // Einmal gewollt, bleibt der Film geladen, auch wenn pausiert wird.
  const [armed, setArmed] = useState(wanted);
  useEffect(() => {
    if (wanted) setArmed(true);
  }, [wanted]);

  const running = wanted && visible;
  useAutoPlay(video, running && armed, armed);
  const blocked = useIsRefused(video);

  // Anzeige und Fortschritt direkt aus der Abspielzeit.
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let shown = -1;
    const tick = () => {
      const node = video.current;
      if (node) {
        const time = node.currentTime;
        let index = 0;
        if (time < reel.wrap) {
          for (let position = 1; position < total; position += 1) if (time >= films[position].cue) index = position;
        }
        if (index !== shown) {
          shown = index;
          setActive(index);
          bars.current.forEach((bar, position) => {
            if (bar && position !== index) bar.style.transform = position < index ? "scaleX(1)" : "scaleX(0)";
          });
        }
        const bar = bars.current[index];
        const from = films[index].cue;
        const to = index + 1 < total ? films[index + 1].cue : reel.wrap;
        if (bar) bar.style.transform = `scaleX(${time >= reel.wrap ? 0 : clamp01((time - from) / (to - from))})`;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [running, reel, films, total]);

  const seek = (node: HTMLVideoElement, time: number) => {
    try {
      node.currentTime = time;
    } catch {
      /* noch keine Metadaten: wird nach dem Laden nachgeholt */
    }
  };

  const pick = (index: number) => {
    if (choice === false || !wanted) setMediaChoice(true);
    const node = video.current;
    const time = films[index].start;
    if (node && node.readyState > 0) seek(node, time);
    else jump.current = time;
    setActive(index);
    bars.current.forEach((bar, position) => {
      if (bar) bar.style.transform = position < index ? "scaleX(1)" : "scaleX(0)";
    });
  };

  const current = films[active];
  const label = playing ? "Filme anhalten" : "Filme abspielen";

  return (
    <div className={`pv-stage${blocked ? " is-blocked" : ""}${started ? " is-live" : ""}`} ref={rootRef} role="group" aria-roledescription="Filmfolge" aria-label="Beispiele aus Creator Studio">
      <div className="pv-stage__media" aria-hidden="true">
        <img className="pv-stage__poster" src={reel.poster} alt="" decoding="async" {...({ fetchpriority: "high" } as Record<string, string>)} />
        <video
          ref={video}
          className="pv-stage__video"
          src={armed ? reel.src : undefined}
          poster={reel.poster}
          muted
          loop
          playsInline
          preload={armed ? "auto" : "none"}
          onPlaying={() => setStarted(true)}
          onLoadedMetadata={(event) => {
            if (jump.current === null) return;
            seek(event.currentTarget, jump.current);
            jump.current = null;
          }}
          tabIndex={-1}
        />
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
        <button type="button" className="pv-stage__toggle" onClick={toggle} aria-label={label} aria-pressed={playing}>
          {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        </button>
      </div>
      <p className="pv-stage__note">{note}</p>
      <p className="pm-sr" aria-live="polite">{`${current.title}, ${current.who}. ${note}`}</p>
    </div>
  );
};

/**
 * Standbild mit Video darüber. Das Video wird erst geladen, wenn das Element in die Nähe des Bildschirms kommt, und
 * spielt stumm in Schleife, solange es gut sichtbar ist.
 */
export const Clip = ({
  src,
  poster,
  label,
  loop = true,
  eager = false,
  small,
  onEnded,
}: {
  src: string;
  poster: string;
  label: string;
  loop?: boolean;
  eager?: boolean;
  /** Kleinere Fassung desselben Clips für schmale Bildschirme (Querformat-Clips am Telefon). */
  small?: string;
  onEnded?: () => void;
}) => {
  const reduce = useReducedMotion();
  const [lite] = useState(prefersLiteMedia);
  const roomy = useMinWidth(900);
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
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

  const [video, attached] = usePooledVideo(box, near && allowed ? (small && !roomy ? small : src) : null, onEnded);
  // Geladen wird erst, wenn der Clip wirklich läuft: ein Clip knapp unter dem sichtbaren Bereich fing sonst an zu laden,
  // und der Browser brach diesen Abruf gleich wieder ab (als fehlgeschlagener Abruf sichtbar, am Telefon verschenktes Datenvolumen).
  useEffect(() => {
    const node = video.current;
    if (!node) return;
    node.loop = loop;
    if (playing) node.preload = "auto";
  }, [video, attached, loop, playing]);
  useAutoPlay(video, attached && playing, attached);
  // Lässt der Browser den Clip nicht anlaufen, zählt er für die Bühne nach fünf Sekunden als gezeigt: Eine Galerie, die am
  // Ende eines Clips weiterschaltet, bleibt so nicht auf dem ersten Standbild stehen.
  const stuck = useIsRefused(video);
  const advances = Boolean(onEnded);
  const done = useRef(onEnded);
  done.current = onEnded;
  useEffect(() => {
    if (!stuck || !playing || !advances) return;
    const timer = window.setTimeout(() => done.current?.(), 5000);
    return () => window.clearTimeout(timer);
  }, [stuck, playing, advances]);

  return (
    <div className="pv-clip" ref={box}>
      <img src={poster} alt={label} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
    </div>
  );
};
