import { motion } from "framer-motion";
import { HelpCircle, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import {
  resolveHomepageSectionPatternClassFromSettings,
  resolveHomepageSectionStyleVarsFromSettings,
} from "@/lib/homepage-section-styles";
import type { LandingFaqBlockData } from "@/lib/landing-page-builder";

type FAQSectionProps = {
  overrideData?: LandingFaqBlockData | null;
};

type FaqItem = {
  question: string;
  answer: string;
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
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .eq("site_id", siteId)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const faqs: FaqItem[] =
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

  const columns = [
    faqs.filter((_, index) => index % 2 === 0),
    faqs.filter((_, index) => index % 2 === 1),
  ].filter((items) => items.length > 0);

  return (
    <section
      id="faq"
      className={`homepage-style-scope surface-section-shell ${sectionPatternClass} relative py-24 sm:py-32`}
      aria-label="FAQ"
      style={sectionStyleVars}
    >
      <div className="section-container relative z-10">
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] 2xl:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="xl:sticky xl:top-32"
          >
            <div
              className="overflow-hidden rounded-[2rem] border p-7 shadow-[0_34px_90px_-54px_rgba(14,31,83,0.24)] md:p-9"
              style={{
                borderColor: "color-mix(in srgb, var(--surface-card-border) 62%, var(--theme-secondary-hex) 38%)",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--surface-card) 94%, white 6%) 0%, color-mix(in srgb, var(--surface-card) 87%, var(--theme-secondary-hex) 7%) 100%)",
              }}
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <HelpCircle size={28} strokeWidth={2} />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold text-[var(--surface-card-text)]"
                  style={{
                    borderColor: "var(--surface-card-border)",
                    background: "color-mix(in srgb, var(--surface-card) 90%, white 10%)",
                  }}
                >
                  <Sparkles size={15} className="text-primary" />
                  Antworten vor dem Start
                </div>
              </div>

              <p className="section-label">{kicker}</p>
              <h2 className="section-title mt-4">{title}</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{description}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {[
                  "Ablauf transparent erklärt",
                  "Kosten & Umsetzung kompakt beantwortet",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.25rem] border px-4 py-3 text-sm font-medium text-[var(--surface-card-text)]"
                    style={{
                      borderColor: "var(--surface-card-border)",
                      background: "color-mix(in srgb, var(--surface-card) 92%, white 8%)",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className={`grid gap-4 ${columns.length > 1 ? "xl:grid-cols-2" : ""}`}
          >
            {columns.map((faqItems, columnIndex) => (
              <Accordion key={`faq-column-${columnIndex}`} type="single" collapsible className="space-y-4">
                {faqItems.map((faq, index) => {
                  const itemIndex = columnIndex + index * columns.length;
                  return (
                    <AccordionItem
                      key={`${faq.question}-${itemIndex}`}
                      value={`item-${itemIndex}`}
                      className="overflow-hidden rounded-[1.6rem] border px-5 shadow-[0_24px_70px_-54px_rgba(14,31,83,0.26)] transition-all duration-300 hover:-translate-y-0.5 data-[state=open]:border-primary/30 sm:px-6"
                      style={{
                        borderColor: "var(--surface-card-border)",
                        background:
                          "linear-gradient(180deg, var(--surface-card) 0%, color-mix(in srgb, var(--surface-card) 89%, var(--theme-secondary-hex) 5%) 100%)",
                      }}
                    >
                      <AccordionTrigger className="py-5 text-left text-base font-bold leading-7 text-foreground transition-colors hover:text-primary hover:no-underline md:text-[1.03rem]">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-sm leading-7 text-muted-foreground md:text-[0.98rem]">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
