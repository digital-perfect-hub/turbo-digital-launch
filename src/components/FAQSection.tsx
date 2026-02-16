import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: faqs = [] } = useQuery({
    queryKey: ["faq_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faq_items").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="faq" className="py-20 md:py-32" ref={ref}>
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <p className="section-label">Wissensbasis für KMU</p>
          <h2 className="section-title">
            Du hast Fragen? <span className="gradient-gold-text">Wir haben die Antworten!</span>
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.id} value={`item-${i}`} className="glass-card px-6 border-border/60 rounded-xl overflow-hidden">
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-5 text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
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
