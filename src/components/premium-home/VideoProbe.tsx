import { useEffect, useState } from "react";
import { playbackLog } from "./media";

// Prüfansicht für ein echtes Gerät, nur mit ?videotest in der Adresse: zeigt für jedes Video der Seite, was der Browser
// meldet, und die letzten Zeilen des Abspiel-Protokolls. Ein Bildschirmfoto davon sagt, warum ein Video nicht läuft
// (Start abgelehnt, lädt nicht, Fehler), ohne dass am Gerät etwas eingerichtet werden muss.
const READY = ["nichts", "Metadaten", "aktuelles Bild", "etwas voraus", "genug"];
const NET = ["leer", "ruht", "lädt", "keine Quelle"];

const read = () =>
  Array.from(document.querySelectorAll("video")).map((video) => {
    const file = (video.currentSrc || video.src || "ohne Quelle").split("/").pop();
    const ranges = video.buffered;
    const have = ranges.length ? ranges.end(ranges.length - 1).toFixed(1) : "0";
    const state = video.error ? `FEHLER ${video.error.code}` : video.paused ? "steht" : "läuft";
    return `${file}: ${state}, ${video.currentTime.toFixed(1)}/${Number.isFinite(video.duration) ? video.duration.toFixed(1) : "?"} s, geladen bis ${have} s, bereit: ${READY[video.readyState]}, Netz: ${NET[video.networkState]}`;
  });

const VideoProbe = () => {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    const update = () => setLines([...read(), "— Protokoll —", ...playbackLog.slice(-14)]);
    update();
    const timer = window.setInterval(update, 700);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <pre
      aria-hidden="true"
      style={{ position: "fixed", zIndex: 9000, top: 0, left: 0, right: 0, maxHeight: "62vh", overflow: "hidden", margin: 0, padding: "6px 8px", background: "rgba(0, 0, 0, 0.82)", color: "#7dff9b", font: "10px/1.35 ui-monospace, Menlo, monospace", whiteSpace: "pre-wrap", pointerEvents: "none" }}
    >
      {`Videotest · ${navigator.userAgent.replace(/^.*?\((.*?)\).*?(Version\/[\d.]+|Chrome\/[\d.]+|CriOS\/[\d.]+).*$/, "$1 · $2")}\n${lines.join("\n")}`}
    </pre>
  );
};

export default VideoProbe;
