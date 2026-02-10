import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marcel M.",
    text: "Ich bin äußerst zufrieden mit der Zusammenarbeit mit Digital-Perfect. Markus hat meine Seite Event-Manifest komplett von Grund auf aufgebaut – inklusive Logo, SEO-Optimierung und vielen weiteren Details, an die ich selbst nie gedacht hätte.",
  },
  {
    name: "Fady A.",
    text: "Digital-Perfect betreut uns seit mehreren Monaten im Bereich Webdesign & SEO – modern, effizient und klar ergebnisorientiert. Wir sind sehr zufrieden und würden jederzeit wieder beauftragen.",
  },
  {
    name: "Marcel D.",
    text: "Wir werden seit 1,5 Jahren von Markus betreut und sind zu 100 Prozent zufrieden. Unser altes Design war fehlerhaft, langsam und hat trotz 6.000 € keinerlei Bestellungen gebracht. Markus hat alles umgekrempelt.",
  },
  {
    name: "Hochgatterer GmbH",
    text: "Die Zusammenarbeit für unser neues Logo und unsere neue Website war von Anfang bis Ende top. Man merkt sofort, dass hier viel Gefühl für Design, Farben und Markenwirkung vorhanden ist.",
  },
  {
    name: "Renate G.",
    text: "Habe eine SEO Optimierung sowie Shopify-Shop Erstellung gekauft. Die Ergebnisse waren sofort zu sehen – Wahnsinn, bin sehr zufrieden! Hier ist ein Profi am Werk.",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 md:py-32 bg-surface" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">
            Kundenstimmen
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Das sagen unsere <span className="gradient-gold-text">Kunden</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-card p-8 md:p-12 relative">
            <Quote className="text-primary/20 absolute top-6 left-6" size={48} />
            <div className="flex gap-1 mb-6 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="text-primary fill-primary" />
              ))}
            </div>
            <p className="text-lg md:text-xl text-center leading-relaxed mb-8 text-foreground/90">
              "{testimonials[current].text}"
            </p>
            <p className="text-center font-bold text-primary text-lg">
              {testimonials[current].name}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current ? "bg-primary w-8" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
