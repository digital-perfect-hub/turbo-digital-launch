import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createDefaultLoadingScreenConfig, parseLoadingScreenConfig, type LoadingScreenConfig } from "@/lib/site-ui-config";

type LoadingScreenProps = {
  heading?: string;
  subtext?: string;
  bgHex?: string;
  textHex?: string;
  config?: Partial<LoadingScreenConfig> | LoadingScreenConfig;
};

const fontClassMap = {
  default: "font-sans",
  sans: "font-sans",
  display: "font-display",
  serif: "font-serif",
  mono: "font-mono",
} as const;

const headingSizeClassMap = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
} as const;

const subtextSizeClassMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
} as const;

export const LoadingScreen = ({ heading, subtext, bgHex, textHex, config }: LoadingScreenProps) => {
  const mergedConfig = {
    ...createDefaultLoadingScreenConfig(),
    ...parseLoadingScreenConfig(config || {}),
  };

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const interval = 30;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = window.setInterval(() => {
      currentStep += 1;
      const newProgress = Math.min(99, Math.floor(100 * (1 - Math.pow(1 - currentStep / steps, 3))));
      setProgress(newProgress);

      if (currentStep >= steps) window.clearInterval(timer);
    }, interval);

    return () => window.clearInterval(timer);
  }, []);

  const resolvedHeading = heading || mergedConfig.heading;
  const resolvedSubtext = subtext || mergedConfig.subtext;
  const resolvedBackground = bgHex || mergedConfig.background_color;
  const resolvedText = textHex || mergedConfig.text_color;
  const showSpinner = mergedConfig.mode === "spinner" || mergedConfig.mode === "both";
  const showBar = mergedConfig.mode === "bar" || mergedConfig.mode === "both";
  const progressLabel = `${mergedConfig.progress_prefix || ""}${progress}${mergedConfig.progress_suffix || ""}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300"
      style={{ backgroundColor: resolvedBackground, color: resolvedText }}
    >
      <div
        className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] pointer-events-none"
        style={{ backgroundColor: mergedConfig.accent_color, opacity: 0.08 }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 px-6 text-center">
        {showSpinner ? (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full blur-xl animate-pulse" style={{ backgroundColor: mergedConfig.accent_color, opacity: 0.18 }} />
            <Loader2 className="relative z-10 h-16 w-16 animate-spin opacity-85" style={{ color: mergedConfig.spinner_color || resolvedText }} />
            {mergedConfig.show_percentage ? (
              <div
                className={`absolute inset-0 z-20 flex items-center justify-center text-sm font-bold tracking-tight ${fontClassMap[mergedConfig.progress_font_family]}`}
                style={{ color: resolvedText }}
              >
                {progressLabel}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-2">
          <h2
            className={`${headingSizeClassMap[mergedConfig.heading_size]} ${fontClassMap[mergedConfig.heading_font_family]} font-black uppercase tracking-[0.18em]`}
          >
            {resolvedHeading}
          </h2>
          <p
            className={`${subtextSizeClassMap[mergedConfig.subtext_size]} ${fontClassMap[mergedConfig.subtext_font_family]} uppercase tracking-[0.22em] animate-pulse`}
            style={{ opacity: 0.68 }}
          >
            {resolvedSubtext}
          </p>
        </div>

        {showBar ? (
          <div className="w-full space-y-2">
            <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: mergedConfig.track_color }}>
              <div
                className="h-full rounded-full transition-[width] duration-150 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor: mergedConfig.fill_color,
                  boxShadow: `0 0 24px ${mergedConfig.fill_color}`,
                }}
              />
            </div>
            {!showSpinner && mergedConfig.show_percentage ? (
              <div className={`text-xs font-semibold tracking-[0.18em] uppercase ${fontClassMap[mergedConfig.progress_font_family]}`} style={{ opacity: 0.7 }}>
                {progressLabel}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
