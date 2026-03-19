import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FAQSection = () => {
  const { getSetting } = useSiteSettings();

  const { data: faqs = [] } = useQuery({
    queryKey: ["faq_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faq_items").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="faq" className="py-20 sm:py-24 md:py-28 bg-background" aria-label="FAQ">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="section-label">{getSetting("home_faq_kicker")}</p>
          <h2 className="section-title">{getSetting("home_faq_title")}</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.id} value={`item-${index}`} className="glass-card px-6 rounded-2xl overflow-hidden">
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-5 text-base md:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm md:text-base">
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
