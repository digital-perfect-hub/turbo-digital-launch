import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultTestimonials, useSiteSettings } from "@/hooks/useSiteSettings";
import { buildRenderImageUrl } from "@/lib/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";

type TestimonialRow = {
  id: string;
  name?: string | null;
  role?: string | null;
  company?: string | null;
  quote?: string | null;
  text?: string | null;
  content?: string | null;
  image_url?: string | null;
  avatar_url?: string | null;
  rating?: number | null;
  sort_order?: number | null;
  is_visible?: boolean | null;
};

type UiTestimonial = {
  id: string;
  name: string;
  role: string;
  text: string;
  image_url: string | null;
  rating: number;
};

const toUiTestimonial = (row: TestimonialRow): UiTestimonial | null => {
  const text = row.quote?.trim() || row.text?.trim() || row.content?.trim() || "";
  const name = row.name?.trim() || "";
  const role = [row.role?.trim(), row.company?.trim()].filter(Boolean).join(" • ");

  if (!name || !text) return null;

  return {
    id: row.id,
    name,
    role: role || "Kundin / Kunde",
    text,
    image_url: row.image_url || row.avatar_url || null,
    rating: Math.max(1, Math.min(5, Number(row.rating ?? 5))),
  };
};

const fallbackRows: UiTestimonial[] = defaultTestimonials.map((item, index) => ({
  id: `fallback-${index}`,
  name: item.name,
  role: item.role,
  text: item.text,
  image_url: null,
  rating: 5,
}));

const TESTIMONIALS_SELECT = "*";

const TestimonialsSection = () => {
  const { getSetting } = useSiteSettings();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async (): Promise<UiTestimonial[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select(TESTIMONIALS_SELECT)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return ((data as TestimonialRow[] | null) ?? []).map(toUiTestimonial).filter((item): item is UiTestimonial => Boolean(item));
    },
  });

  const effectiveTestimonials = testimonials.length > 0 ? testimonials : fallbackRows;

  useEffect(() => {
    if (!api || effectiveTestimonials.length <= 1) return;

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);

    const timer = window.setInterval(() => {
      api.canScrollNext() ? api.scrollNext() : api.scrollTo(0);
    }, 6500);

    return () => {
      window.clearInterval(timer);
      api.off("select", onSelect);
    };
  }, [api, effectiveTestimonials.length]);

  return (
    <section id="stimmen" className="bg-surface py-20 sm:py-24 md:py-28" aria-label="Testimonials">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <p className="section-label">{getSetting("home_testimonials_kicker", "Kundenstimmen")}</p>
          <h2 className="section-title">{getSetting("home_testimonials_title", "Das sagen unsere Kundinnen & Kunden")}</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Echte Stimmen schaffen Vertrauen. Diese Sektion zieht ihre Inhalte jetzt direkt aus Supabase und respektiert strikt den Sichtbarkeitsstatus.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          <Carousel setApi={setApi} opts={{ align: "start", loop: effectiveTestimonials.length > 1 }} className="w-full">
            <CarouselContent>
              {effectiveTestimonials.map((item) => (
                <CarouselItem key={item.id} className="md:basis-1/2 xl:basis-1/3">
                  <Card className="premium-card h-full border-0 shadow-none">
                    <CardContent className="flex h-full flex-col p-6 md:p-7">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Quote size={22} />
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                          {Array.from({ length: item.rating }).map((_, index) => (
                            <Star key={index} size={15} className="fill-current" />
                          ))}
                        </div>
                      </div>

                      <p className="flex-1 text-base leading-relaxed text-[var(--surface-card-text)]">„{item.text}“</p>

                      <div className="mt-6 flex items-center gap-4 border-t pt-5" style={{ borderColor: "var(--surface-card-border)" }}>
                        <Avatar className="h-12 w-12 border" style={{ borderColor: "var(--surface-card-border)" }}>
                          {item.image_url ? <AvatarImage src={buildRenderImageUrl(item.image_url, { width: 180, quality: 80 })} alt={item.name} /> : null}
                          <AvatarFallback className="bg-secondary text-white">{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-base font-bold text-[var(--surface-card-text)]">{item.name}</p>
                          <p className="text-sm text-[var(--surface-card-muted)]">{item.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {effectiveTestimonials.length > 1 ? (
            <div className="mt-6 flex justify-center gap-2">
              {effectiveTestimonials.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${current === index ? "w-10 bg-primary" : "w-3 bg-primary/25 hover:bg-primary/40"}`}
                  aria-label={`Zu Testimonial ${index + 1} wechseln`}
                />
              ))}
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
