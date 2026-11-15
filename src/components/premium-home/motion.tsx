import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const Reveal = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease: [0.2, 0, 0, 1], delay }}
    >
      {children}
    </motion.div>
  );
};

// true, sobald das Element einmal sichtbar war.
export const useInViewOnce = <T extends Element>(margin = "0px 0px -12% 0px") => {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || seen) return;
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [margin, seen]);
  return [ref, seen] as const;
};

const GLYPHS = "▓▒░#$%&*/<>{}[]01ABCDEFXZ";

// Überschrift, die sich beim ersten Sichtbarwerden von links nach rechts "entschlüsselt".
// Screenreader lesen immer den fertigen Text; bei reduzierter Bewegung steht er sofort da.
export const Decrypt = ({ text, className, as: Tag = "span" }: { text: string; className?: string; as?: "span" | "h2" | "h3" }) => {
  const reduce = useReducedMotion();
  const [ref, seen] = useInViewOnce<HTMLSpanElement>("0px 0px -18% 0px");
  const [shown, setShown] = useState(reduce ? text : "");

  useEffect(() => {
    if (reduce) {
      setShown(text);
      return;
    }
    if (!seen) return;
    const duration = Math.min(1400, 380 + text.length * 22);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const settled = Math.floor(progress * text.length);
      let next = "";
      for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (i < settled || char === " ") next += char;
        else if (i < settled + 6) next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else next += " ";
      }
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, reduce, text]);

  return (
    <Tag className={className}>
      <span className="pm-sr">{text}</span>
      {/* Der unsichtbare Endtext hält die Größe fest, der laufende Text liegt darüber: kein Springen im Layout. */}
      <span ref={ref} aria-hidden="true" className="pm-dc">
        <span className="pm-dc__ghost">{text}</span>
        <span className="pm-dc__live">{shown}</span>
      </span>
    </Tag>
  );
};

const matches = (query: string) => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches;
// Telefone und Tablets: Eine Unschärfe über einer großen Fläche (oft mit laufendem Video darin) kostet dort mehr, als sie bringt.
const isSmallOrTouch = () => matches("(max-width: 899px), (pointer: coarse)");
const hasFinePointer = () => matches("(hover: hover) and (pointer: fine)");

// Fährt aus der Tiefe nach vorn: klein, leicht gekippt und (am Rechner) unscharf, dann an seinen Platz. Für Bühnen, Karten und Fenster.
export const Depth = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => {
  const reduce = useReducedMotion();
  const [light] = useState(isSmallOrTouch);
  // Die Ebene wird dem Browser nur angekündigt, solange die Einfahrt läuft; danach kostet sie keinen Speicher mehr.
  const [settled, setSettled] = useState(false);
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1400, willChange: settled || reduce ? "auto" : "transform, opacity" }}
      initial={reduce ? false : light ? { opacity: 0, scale: 0.9, y: 48, rotateX: 12 } : { opacity: 0, scale: 0.86, y: 64, rotateX: 14, filter: "blur(10px)" }}
      whileInView={light ? { opacity: 1, scale: 1, y: 0, rotateX: 0 } : { opacity: 1, scale: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: light ? 0.9 : 1.1, ease: [0.16, 1, 0.3, 1], delay }}
      onAnimationComplete={() => setSettled(true)}
    >
      {children}
    </motion.div>
  );
};

/**
 * Neigt seinen Inhalt im Raum zum Mauszeiger hin und legt einen Lichtschein darüber. Nur mit Maus und ohne reduzierte
 * Bewegung; sonst bleibt der Inhalt, wie er ist. Die Werte gehen als CSS-Variablen direkt ans Element, ohne neu zu rendern.
 */
export const Tilt = ({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) => {
  const reduce = useReducedMotion();
  const [fine] = useState(hasFinePointer);
  const ref = useRef<HTMLDivElement>(null);
  const box = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const active = fine && !reduce;

  useEffect(() => () => window.cancelAnimationFrame(frame.current), []);

  const enter = () => {
    box.current = ref.current?.getBoundingClientRect() ?? null;
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    const rect = box.current;
    if (!node || !rect || event.pointerType !== "mouse") return;
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    window.cancelAnimationFrame(frame.current);
    frame.current = window.requestAnimationFrame(() => {
      node.style.setProperty("--pv-ry", `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
      node.style.setProperty("--pv-rx", `${((0.5 - y) * 2 * max).toFixed(2)}deg`);
      node.style.setProperty("--pv-gx", `${(x * 100).toFixed(1)}%`);
      node.style.setProperty("--pv-gy", `${(y * 100).toFixed(1)}%`);
      node.classList.add("is-tilting");
    });
  };
  const leave = () => {
    const node = ref.current;
    window.cancelAnimationFrame(frame.current);
    box.current = null;
    if (!node) return;
    node.classList.remove("is-tilting");
    node.style.removeProperty("--pv-ry");
    node.style.removeProperty("--pv-rx");
  };

  return (
    <div
      ref={ref}
      className={`pv-tilt${className ? ` ${className}` : ""}`}
      onPointerEnter={active ? enter : undefined}
      onPointerMove={active ? move : undefined}
      onPointerLeave={active ? leave : undefined}
    >
      {children}
      <span className="pv-tilt__sheen" aria-hidden="true" />
    </div>
  );
};
