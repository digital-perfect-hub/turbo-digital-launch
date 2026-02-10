import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Monitor, ShoppingCart, Search, MapPin, Bot, Wrench, BarChart, Repeat } from "lucide-react";

const services = [
  {
    icon: Monitor,
    title: "Website-Erstellung",
    desc: "High-Performance Websites, die schnell laden, sauber strukturiert sind und Besucher zu Kunden machen.",
    color: "text-primary",
  },
  {
    icon: ShoppingCart,
    title: "Onlineshop-Erstellung",
    desc: "Skalierbare Shops mit Conversion-Fokus. Strukturierte Produktseiten und nahtlose Kauferlebnisse.",
    color: "text-secondary",
  },
  {
    icon: Search,
    title: "SEO & Sichtbarkeit",
    desc: "Technisches & Content-SEO für dauerhafte Relevanz. Rankings, die bleiben – nicht nur kurz aufflackern.",
    color: "text-primary",
  },
  {
    icon: MapPin,
    title: "Lokale SEO & Google Business",
    desc: "Regionale Sichtbarkeit maximieren. Google-Profil, Bewertungen und lokale Landingpages.",
    color: "text-secondary",
  },
  {
    icon: Bot,
    title: "KI-gestützte SEO & Content",
    desc: "Moderne KI-Strategien für smarte Content-Produktion und datenbasierte Optimierung.",
    color: "text-primary",
  },
  {
    icon: Repeat,
    title: "Website-Relaunch",
    desc: "Veraltete Seite? Wir relaunchen mit modernem Design, besserem SEO und höherer Performance.",
    color: "text-secondary",
  },
  {
    icon: Wrench,
    title: "Wartung & Performance",
    desc: "Laufende Betreuung, Updates und Performance-Checks für eine immer aktuelle Website.",
    color: "text-primary",
  },
  {
    icon: BarChart,
    title: "Projekt- & SEO-Analysen",
    desc: "Datenbasierte Analysen deiner Website mit klaren Handlungsempfehlungen und Reporting.",
    color: "text-secondary",
  },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="py-20 md:py-32" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">
            Unsere Leistungen
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-balance">
            Webdesign, das für dich arbeitet.{" "}
            <span className="gradient-gold-text">Rund um die Uhr.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Kompakter Überblick über unsere wichtigsten Leistungen für deinen digitalen Erfolg.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="glass-card p-6 group hover:border-primary/40 hover:glow-gold transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <s.icon className={s.color} size={24} />
              </div>
              <h3 className="font-bold text-base mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
