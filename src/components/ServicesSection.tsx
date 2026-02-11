import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Monitor, ShoppingCart, Search, MapPin, Bot, Wrench, BarChart, Repeat, ArrowUpRight } from "lucide-react";

const services = [
  { icon: Monitor, title: "Website-Erstellung", desc: "High-Performance Websites, die schnell laden und Besucher zu Kunden machen." },
  { icon: ShoppingCart, title: "Onlineshop-Erstellung", desc: "Skalierbare Shops mit Conversion-Fokus und nahtlosen Kauferlebnissen." },
  { icon: Search, title: "SEO & Sichtbarkeit", desc: "Technisches & Content-SEO für Rankings, die bleiben." },
  { icon: MapPin, title: "Lokale SEO & Google", desc: "Regionale Sichtbarkeit, Google-Profil und lokale Landingpages." },
  { icon: Bot, title: "KI-gestützte SEO", desc: "Moderne KI-Strategien für smarte Content-Produktion." },
  { icon: Repeat, title: "Website-Relaunch", desc: "Modernes Design, besseres SEO und höhere Performance." },
  { icon: Wrench, title: "Wartung & Performance", desc: "Laufende Betreuung, Updates und Performance-Checks." },
  { icon: BarChart, title: "SEO-Analysen", desc: "Datenbasierte Analysen mit klaren Handlungsempfehlungen." },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="py-24 md:py-36" ref={ref}>
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <p className="section-label">Unsere Leistungen</p>
          <h2 className="section-title">
            Webdesign, das für dich arbeitet.{" "}
            <span className="gradient-gold-text">Rund um die Uhr.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass-card p-6 group hover:border-primary/40 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={16} className="text-primary" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <s.icon className="text-primary" size={20} />
              </div>
              <h3 className="font-bold text-sm mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
