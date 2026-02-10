import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Persönlicher Webdesigner",
    desc: "Statt wechselnder Ansprechpartner arbeitest du direkt mit mir zusammen. Klare Abstimmung, moderne Designs und echte Unterstützung.",
  },
  {
    icon: BarChart3,
    title: "Websites, die verkaufen",
    desc: "Conversion-orientiertes Webdesign, das Besucher zu Anfragen und Kunden entwickelt. Ideal für Dienstleister und lokale Unternehmen.",
  },
  {
    icon: Shield,
    title: "Technisches SEO",
    desc: "Struktur, Ladezeit, Indexierung, Content – wir sorgen dafür, dass Google versteht, wofür deine Website steht.",
  },
];

const TrustSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-32 bg-surface" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">
              Über mich
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-balance">
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
              DIGITAL-PERFECT unterstützt KMU in Österreich & Deutschland mit modernem
              Webdesign, performanten Onlineshops und technischem SEO.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            {features.map((f, i) => (
              <div
                key={i}
                className="glass-card p-6 flex gap-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
