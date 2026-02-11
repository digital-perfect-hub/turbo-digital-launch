import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, BarChart3, Users, Zap } from "lucide-react";

const features = [
  { icon: Users, title: "Persönlicher Webdesigner", desc: "Statt wechselnder Ansprechpartner arbeitest du direkt mit mir zusammen." },
  { icon: BarChart3, title: "Websites, die verkaufen", desc: "Conversion-orientiertes Design, das Besucher zu Kunden macht." },
  { icon: Shield, title: "Technisches SEO", desc: "Struktur, Ladezeit, Indexierung – Google versteht deine Website." },
  { icon: Zap, title: "Performance First", desc: "Blitzschnelle Ladezeiten für maximale Nutzererfahrung." },
];

const TrustSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-36 bg-surface" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
            <p className="section-label">Über mich</p>
            <h2 className="section-title">
              Keine anonyme Agentur.{" "}
              <span className="gradient-gold-text">Du arbeitest direkt mit mir.</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Ich bin Markus Schulz – Experte für Webdesign, SEO & digitale Sichtbarkeit.
              Über 6 Jahre Erfahrung in der Entwicklung leistungsstarker Websites – mit Fokus
              auf Performance, maximale Sichtbarkeit und nachhaltige Lead-Gewinnung.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Wir arbeiten nach Analysen, Fakten und Daten – nicht nach Bauchgefühl.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }} className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-5 group hover:border-primary/40 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="text-primary" size={20} />
                </div>
                <h3 className="font-bold text-sm mb-1.5">{f.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
