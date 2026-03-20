import { motion } from "framer-motion";
import { BarChart3, Gauge, Shield, Users } from "lucide-react";

const trustPoints = [
  {
    icon: Users,
    title: "Direkter Draht statt Agentur-Weitergabe",
    desc: "Keine anonymen Ketten, kein verlorenes Briefing. Entscheidungen werden schneller und sauberer umgesetzt.",
  },
  {
    icon: Gauge,
    title: "Premium-Look mit Performance-Fokus",
    desc: "Moderne Wirkung, lesbare Hierarchie und ein Aufbau, der auch mobil hochwertig verkauft.",
  },
  {
    icon: BarChart3,
    title: "Sichtbarkeit mit wirtschaftlicher Logik",
    desc: "SEO, Conversion und Nutzerführung werden als Business-System gedacht – nicht als Einzelbaustellen.",
  },
  {
    icon: Shield,
    title: "Robuste Struktur statt Zufallsdesign",
    desc: "Fallbacks, klare Sektionen und saubere Komponenten machen die Website belastbar und adminfähig.",
  },
];

const TrustSection = () => {
  return (
    <section className="relative z-20 bg-background pb-8 -mt-8 md:-mt-10" aria-label="Vertrauen">
      <div className="section-container">
        <div className="premium-card p-5 md:p-7 lg:p-8">
          <div className="relative z-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustPoints.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="rounded-[1.4rem] border border-slate-200/85 bg-white/88 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.16)]"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <feature.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
