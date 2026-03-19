import { motion } from "framer-motion";
import { Shield, TrendingUp, User } from "lucide-react";

const features = [
  {
    icon: User,
    title: "Persönlicher Webdesigner — keine anonyme Agentur",
    desc: "Statt wechselnder Ansprechpartner arbeitest du direkt mit mir zusammen. Klare Abstimmung, moderne Designs und echte Unterstützung.",
  },
  {
    icon: TrendingUp,
    title: "Websites & Onlineshops, die wirklich verkaufen",
    desc: "Conversion-orientiertes Webdesign, das Besucher zu Anfragen und Kunden entwickelt – ideal für Dienstleister, Shops und lokale Unternehmen.",
  },
  {
    icon: Shield,
    title: "Technisches SEO für mehr Sichtbarkeit",
    desc: "Struktur, Ladezeit, Indexierung, Content und interne Verlinkung – damit Google versteht, wofür deine Website steht.",
  },
];

const TrustSection = () => {
  return (
    <section className="py-20 sm:py-24 md:py-28 bg-background" aria-label="Warum">
      <div className="section-container">
        <div className="grid gap-5 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="glass-card p-7 transition-transform duration-500 hover:scale-[1.01]"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="text-primary" size={22} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-balance">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
