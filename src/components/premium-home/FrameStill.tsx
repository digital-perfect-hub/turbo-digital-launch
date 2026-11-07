import { useId } from "react";

// Symbolbild für eine Szene aus Creator Studio. Es ist bewusst kein Foto und kein KI-Ergebnis, sondern eine
// grafische Darstellung: dieselbe Silhouette (mit demselben orangefarbenen Ohrring als Erkennungsmerkmal)
// in wechselnden Szenen, Ausschnitten und Lichtstimmungen. So zeigt die Seite die Idee "eine Identität,
// viele Szenen", ohne Beispielergebnisse zu erfinden, die es noch nicht gibt.

export type StillTone = "ember" | "teal" | "violet" | "steel" | "dawn";
export type StillCrop = "close" | "mid" | "wide";

type Palette = { top: string; bottom: string; glow: string; accent: string; bokeh: string };

const PALETTES: Record<StillTone, Palette> = {
  ember: { top: "#3a1507", bottom: "#0c0605", glow: "#ff6b2c", accent: "#ff8c42", bokeh: "#ff6b2c" },
  teal: { top: "#05303a", bottom: "#04090c", glow: "#2fd5c4", accent: "#7ef0e2", bokeh: "#2fd5c4" },
  violet: { top: "#2a1448", bottom: "#07050c", glow: "#b46bff", accent: "#d5a8ff", bokeh: "#b46bff" },
  steel: { top: "#1d2a40", bottom: "#06080c", glow: "#6f9bff", accent: "#a9c3ff", bokeh: "#6f9bff" },
  dawn: { top: "#4a2412", bottom: "#100907", glow: "#ffb27a", accent: "#ffd2a8", bokeh: "#ffb27a" },
};

const CROPS: Record<StillCrop, { scale: number; dx: number; dy: number }> = {
  close: { scale: 1.62, dx: 0, dy: 26 },
  mid: { scale: 1.02, dx: 2, dy: 2 },
  wide: { scale: 0.64, dx: -12, dy: 44 },
};

const Scene = ({ tone, accent }: { tone: StillTone; accent: string }) => {
  switch (tone) {
    case "ember":
      return (
        <g opacity="0.5" fill={accent}>
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect key={`${row}-${col}`} x={52 + col * 9} y={16 + row * 12} width="6" height="8" opacity={(row + col) % 3 === 0 ? 0.9 : 0.25} />
            )),
          )}
        </g>
      );
    case "teal":
      return (
        <g stroke={accent} strokeWidth="1.1" opacity="0.7" strokeLinecap="round">
          <line x1="14" y1="0" x2="14" y2="92" />
          <line x1="22" y1="14" x2="22" y2="70" opacity="0.5" />
          <line x1="78" y1="0" x2="78" y2="110" />
        </g>
      );
    case "violet":
      return <circle cx="62" cy="34" r="17" fill={accent} opacity="0.32" />;
    case "steel":
      return (
        <g stroke={accent} strokeWidth="0.35" opacity="0.4">
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={i} x1={i * 6 - 6} y1="0" x2={i * 6 - 22} y2="160" />
          ))}
        </g>
      );
    default:
      return <rect x="0" y="88" width="90" height="6" fill={accent} opacity="0.22" />;
  }
};

export const FrameStill = ({
  tone,
  crop = "mid",
  className = "",
  reticle = false,
}: {
  tone: StillTone;
  crop?: StillCrop;
  className?: string;
  reticle?: boolean;
}) => {
  const uid = useId().replace(/:/g, "");
  const p = PALETTES[tone];
  const c = CROPS[crop];
  const silhouette = `translate(${45 + c.dx} ${100 + c.dy}) scale(${c.scale}) translate(-45 -100)`;

  return (
    <svg
      className={`pm-still ${className}`}
      viewBox="0 0 90 160"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Symbolbild einer Szene"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.top} />
          <stop offset="1" stopColor={p.bottom} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="0.74" cy="0.3" r="0.7">
          <stop offset="0" stopColor={p.glow} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={p.accent} stopOpacity="0.95" />
          <stop offset="0.5" stopColor={p.accent} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`vig-${uid}`} cx="0.5" cy="0.45" r="0.8">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.72" />
        </radialGradient>
        <filter id={`soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>

      <rect width="90" height="160" fill={`url(#bg-${uid})`} />
      <rect width="90" height="160" fill={`url(#glow-${uid})`} />
      <Scene tone={tone} accent={p.accent} />
      <g fill={p.bokeh} opacity="0.35" filter={`url(#soft-${uid})`}>
        <circle cx="12" cy="124" r="5" opacity="0.5" />
        <circle cx="26" cy="138" r="3" opacity="0.7" />
        <circle cx="80" cy="118" r="6" opacity="0.4" />
        <circle cx="70" cy="140" r="3.5" opacity="0.6" />
      </g>

      <g transform={silhouette}>
        {/* Schultern, Hals, Kopf, Haar: bewusst gesichtslos */}
        <path d="M2 172 C4 128 26 110 45 104 C64 110 86 128 88 172 Z" fill="#07080b" />
        <rect x="39" y="84" width="12" height="24" rx="4" fill="#07080b" />
        <ellipse cx="45" cy="64" rx="14.5" ry="18.5" fill="#07080b" />
        <path d="M29.5 60 C28 40 40 30 52 33 C62 36 62 48 60.5 56 C56 46 46 43 36 47 C33 49 31 53 29.5 60 Z" fill="#0d0f14" />
        {/* Licht von links: Kontur an Kopf und Schulter */}
        <g filter={`url(#soft-${uid})`} fill="none" stroke={`url(#rim-${uid})`} strokeWidth="1.1" strokeLinecap="round">
          <path d="M30.5 58 C30 72 36 84 42 87" />
          <path d="M3 168 C5 130 25 112 40 106" />
        </g>
        {/* Erkennungsmerkmal: kleiner orangefarbener Ohrring */}
        <circle cx="30.6" cy="68" r="1.5" fill="#ff6b2c" />
        <circle cx="30.6" cy="68" r="3.2" fill="#ff6b2c" opacity="0.28" />
        {/* Sucherrahmen um das Gesicht: gleiche Größe in jeder Szene, nur die Position folgt dem Ausschnitt */}
        {reticle ? (
          <path
            d="M26 48 V42 H32 M58 42 H64 V48 M26 82 V88 H32 M58 88 H64 V82"
            fill="none"
            stroke={p.accent}
            strokeWidth="1.3"
            strokeLinecap="square"
            vectorEffect="non-scaling-stroke"
            opacity="0.9"
          />
        ) : null}
      </g>

      <rect width="90" height="160" fill={`url(#vig-${uid})`} />
    </svg>
  );
};

export default FrameStill;
