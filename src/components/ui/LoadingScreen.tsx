import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type LoadingScreenProps = {
  heading?: string;
  subtext?: string;
  bgHex?: string;
  textHex?: string;
};

export const LoadingScreen = ({ heading, subtext, bgHex, textHex }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  // Hochgeschwindigkeits-Counter für das Premium-Feeling (Ease-Out auf 99%)
  useEffect(() => {
    const duration = 1500; // 1.5 Sekunden max für die Animation
    const interval = 30; // Alle 30ms updaten
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(
        99,
        Math.floor(100 * (1 - Math.pow(1 - currentStep / steps, 3)))
      );
      setProgress(newProgress);

      if (currentStep >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300"
      style={{ backgroundColor: bgHex || "#0f172a", color: textHex || "#ffffff" }}
    >
      {/* Glow Effect Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-8 z-10">
        {/* Animated Icon & Progress */}
        <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-16 h-16 animate-spin relative z-10 opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center z-20 font-bold text-sm tracking-tighter">
              {progress}%
            </div>
        </div>
        
        {/* Typografie */}
        <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-display font-black tracking-widest uppercase">
              {heading || "DIGITAL-PERFECT"}
            </h2>
            <p className="text-xs uppercase tracking-[0.2em] opacity-60 animate-pulse">
              {subtext || "System wird geladen..."}
            </p>
        </div>
      </div>
    </div>
  );
};