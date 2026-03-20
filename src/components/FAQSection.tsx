import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
    <section id="faq" className="bg-surface py-20 sm:py-24 md:py-28" aria-label="FAQ">
      <div className="section-container">
        <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr] xl:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="premium-card p-8 md:p-10 xl:sticky xl:top-28 xl:self-start"
          >
            <div className="relative z-10">
              <p className="section-label">{getSetting("home_faq_kicker")}</p>
              <h2 className="section-title">{getSetting("home_faq_title")}</h2>
              <div className="mt-6 inline-flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-slate-950 text-white shadow-[0_28px_50px_-30px_rgba(15,23,42,0.55)]">
                <HelpCircle size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.id} value={`item-${index}`} className="premium-card overflow-hidden px-6 rounded-[1.55rem]">
                  <AccordionTrigger className="py-5 text-left text-base font-semibold text-slate-900 transition-colors hover:text-slate-700 md:text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-slate-600 md:text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
