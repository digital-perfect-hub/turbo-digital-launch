import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { defaultWhyChoosePoints, type WhyChoosePoint, useSiteSettings } from "@/hooks/useSiteSettings";

const WhyChooseSection = () => {
  const { getSetting, getJsonSetting } = useSiteSettings();
  const points = getJsonSetting<WhyChoosePoint[]>("home_why_choose_points", defaultWhyChoosePoints);

  return (
    <section className="bg-surface py-24 sm:py-32 relative overflow-hidden" aria-label="Warum wir?">
      {/* Subtiler Glow im Hintergrund */}
      <div className="absolute -top-[20%] -right-[10%] w-[1000px] h-[1000px] bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_50%)] opacity-[0.03] pointer-events-none blur-[120px]" />

      <div className="section-container relative z-10">
        <div className="grid gap-12 xl:grid-cols-[0.85fr_1.15fr] xl:gap-16">
          
          {/* Linke Seite: Deep Dark Card (Sticky) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="xl:sticky xl:top-32 xl:self-start rounded-[2.5rem] bg-slate-950 p-10 md:p-12 lg:p-14 overflow-hidden relative shadow-2xl"
          >
            {/* Innerer Dark Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none" />
            
            <div className="relative z-10">
              <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-300 backdrop-blur-md mb-6">
                {getSetting("home_why_choose_kicker", "Unsere DNA")}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                {getSetting("home_why_choose_title", "Warum Agenturen & Brands auf uns setzen.")}
              </h2>
              <p className="text-lg leading-relaxed text-slate-400 mb-10">
                Wir verschwenden keine Zeit mit endlosen Feedbackschleifen und abstrakten Konzepten. Wir liefern funktionierende digitale Infrastruktur, die Leads generiert und Marken nach vorn bringt.
              </p>
              
              <button
                onClick={() => document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-primary !px-8 !py-4 !text-base shadow-[0_0_40px_-10px_rgba(var(--primary),0.4)]"
              >
                Kostenlos anfragen
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>

          {/* Rechte Seite: Premium Grid Cards */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 content-start">
            {points.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full"
              >
                {/* Hover Glow */}
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_70%)] opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110">
                      <CheckCircle2 size={24} strokeWidth={2.5} />
                    </div>
                    <span className="text-4xl font-black text-slate-100 group-hover:text-primary/10 transition-colors duration-500 select-none">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">{point.title}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground flex-1">{point.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;