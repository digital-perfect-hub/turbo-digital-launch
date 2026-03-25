import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";

const FAQSection = () => {
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "faq");
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const { data: faqs = [] } = useQuery({
    queryKey: ["faq_items", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("faq_items").select("*").eq("site_id", siteId).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="faq" className="homepage-style-scope surface-section-shell py-24 sm:py-32 relative overflow-hidden" aria-label="FAQ" style={sectionStyleVars}>
      <div className="section-container relative z-10">
        <div className="grid gap-12 xl:grid-cols-[0.8fr_1.2fr] xl:gap-16 items-start">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="xl:sticky xl:top-32"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-8">
              <HelpCircle size={32} strokeWidth={2} />
            </div>
            <p className="section-label">{getSetting("home_faq_kicker", "Häufige Fragen")}</p>
            <h2 className="section-title mt-4">{getSetting("home_faq_title", "Klarheit vor Projektstart.")}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Offene Fragen? Hier findest du transparente Antworten zu unserem Prozess, den Kosten und der Zusammenarbeit.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={faq.id} 
                  value={`item-${index}`} 
                  className="rounded-[1.5rem] border border-border bg-card px-6 sm:px-8 shadow-sm transition-all hover:shadow-md data-[state=open]:border-primary/30"
                >
                  <AccordionTrigger className="py-6 text-left text-lg font-bold text-foreground hover:no-underline hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
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