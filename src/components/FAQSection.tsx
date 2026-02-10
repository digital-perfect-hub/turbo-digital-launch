import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Mit welchen Kosten kann ich rechnen?",
    a: "Die Kosten richten sich nach Art sowie Umfang deines Projekts. Im kostenlosen Erstgespräch analysieren wir deinen Bedarf im Detail und erstellen anschließend ein transparentes Angebot – exakt auf dein Ziel und Budget abgestimmt.",
  },
  {
    q: "Wie lange dauert in etwa die Umsetzung?",
    a: "Die Projektdauer hängt vom Umfang und der Komplexität ab. Eine einfache Website ist in der Regel innerhalb von 2–3 Wochen umsetzbar. Vor Projektstart erhältst du einen verbindlichen Zeitplan.",
  },
  {
    q: "Für welche Branchen bietet ihr eure Dienstleistungen an?",
    a: "Unsere Kunden stammen aus den unterschiedlichsten Branchen – vom Handwerk über Beratung, Steuer- und Rechtswesen bis hin zu Handel und Energiewirtschaft. Für jede Zielgruppe entwickeln wir ein individuelles Konzept.",
  },
  {
    q: "Wie kann ich mein Google-Ranking schnell verbessern?",
    a: "Lokale Rankings steigen schnell, wenn 4 Faktoren sauber umgesetzt werden: korrektes Google-Unternehmensprofil, regionale Landingpages, Bewertungswachstum beschleunigen und technisches SEO. Mit unseren NFC-Ständern können Bewertungen bis zu verzehnfacht werden.",
  },
  {
    q: "Kann ich auch einzelne Leistungen buchen?",
    a: "Ja, selbstverständlich. Alle Leistungen können auch einzeln gebucht werden – etwa nur Webdesign oder ausschließlich SEO-Betreuung. Viele Kunden entscheiden sich jedoch für ein Gesamtpaket für maximale Synergien.",
  },
  {
    q: "Kann ich meine Website nach der Erstellung selbst bearbeiten?",
    a: "Ja. Du erhältst vollständigen Zugang zu deinem System. All unsere Setups liefern wir als komplett fertige, sofort einsatzbereite Systeme, in denen du jederzeit selbst Inhalte anpassen oder hinzufügen kannst.",
  },
];

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="py-20 md:py-32" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">
            Wissensbasis für KMU
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Du hast Fragen? <span className="gradient-gold-text">Wir haben die Antworten!</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass-card px-6 border-border/50 rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-5 text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
