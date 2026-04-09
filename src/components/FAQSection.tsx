import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { resolveHomepageSectionPatternClassFromSettings, resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";
import type { LandingFaqBlockData } from "@/lib/landing-page-builder";

type FAQSectionProps = {
  overrideData?: LandingFaqBlockData | null;
};

const FAQSection = ({ overrideData }: FAQSectionProps) => {
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "faq");
  const sectionPatternClass = resolveHomepageSectionPatternClassFromSettings(settings, "faq");
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const { data: queriedFaqs = [] } = useQuery({
    queryKey: ["faq_items", siteId],
    enabled: !overrideData,
    queryFn: async () => {
      const { data, error } = await supabase.from("faq_items").select("*").eq("site_id", siteId).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const faqs =
    overrideData?.items && overrideData.items.length > 0
      ? overrideData.items
      : queriedFaqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }));

  if (!faqs.length) {
    return null;
  }

  const kicker = overrideData?.kicker?.trim() || getSetting("home_faq_kicker", "Häufige Fragen");
  const title = overrideData?.title?.trim() || getSetting("home_faq_title", "Klarheit vor Projektstart.");
  const description =
    overrideData?.description?.trim() ||
    "Offene Fragen? Hier findest du transparente Antworten zu unserem Prozess, den Kosten und der Zusammenarbeit.";

  return (
    <section
      id="faq"
      className={`homepage-style-scope surface-section-shell ${sectionPatternClass} relative overflow-hidden py-24 sm:py-32`}
      aria-label="FAQ"
      style={sectionStyleVars}
    >
      <div className="section-container relative z-10">
        <div className="grid items-start gap-12 xl:grid-cols-[0.8fr_1.2fr] xl:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="xl:sticky xl:top-32"
          >
            <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HelpCircle size={32} strokeWidth={2} />
            </div>
            <p className="section-label">{kicker}</p>
            <h2 className="section-title mt-4">{title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{description}</p>
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
                  key={`${faq.question}-${index}`}
                  value={`item-${index}`}
                  className="rounded-[1.5rem] border border-border bg-card px-6 shadow-sm transition-all hover:shadow-md data-[state=open]:border-primary/30 sm:px-8"
                >
                  <AccordionTrigger className="py-6 text-left text-lg font-bold text-foreground transition-colors hover:text-primary hover:no-underline">
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
