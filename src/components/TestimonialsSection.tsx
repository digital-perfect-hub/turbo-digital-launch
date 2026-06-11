import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultTestimonials, useSiteSettings } from "@/hooks/useSiteSettings";
import { buildRawImageUrl } from "@/lib/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import {
  resolveHomepageSectionPatternClassFromSettings,
  resolveHomepageSectionStyleVarsFromSettings,
} from "@/lib/homepage-section-styles";

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

type RenderImageOptions = {
  width: number;
  quality: number;
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

const toSupabaseRenderUrl = (
  storagePath: string | null | undefined,
  options: RenderImageOptions,
) => {
  const rawUrl = buildRawImageUrl(storagePath);
  if (!rawUrl) return "";

  try {
    const isRelative = rawUrl.startsWith("/");
    const url = new URL(rawUrl, "https://digital-perfect.local");

    if (!url.pathname.includes("/storage/v1/object/public/")) {
      return rawUrl;
    }

    url.pathname = url.pathname.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/",
    );
    url.searchParams.set("width", String(options.width));
    url.searchParams.set("quality", String(options.quality));

    return isRelative ? `${url.pathname}${url.search}` : url.toString();
  } catch {
    return rawUrl;
  }
};

const getCarouselItemClassName = (count: number) => {
  if (count <= 1) return "pl-4 md:basis-full";
  if (count === 2) return "pl-4 md:basis-1/2";
  return "pl-4 md:basis-1/2 xl:basis-1/3";
};

const TestimonialsSection = () => {
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "testimonials");
  const sectionPatternClass = resolveHomepageSectionPatternClassFromSettings(settings, "testimonials");
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials", siteId],
    queryFn: async (): Promise<UiTestimonial[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select(TESTIMONIALS_SELECT)
        .eq("site_id", siteId)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return ((data as TestimonialRow[] | null) ?? [])
        .map(toUiTestimonial)
        .filter((item): item is UiTestimonial => Boolean(item));
    },
  });

  const effectiveTestimonials = testimonials.length > 0 ? testimonials : fallbackRows;

  useEffect(() => {
    if (!api || effectiveTestimonials.length <= 1) return;

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);

    const timer = window.setInterval(() => {
      const nextIndex = (api.selectedScrollSnap() + 1) % effectiveTestimonials.length;
      api.scrollTo(nextIndex);
    }, 5000);

    return () => {
      window.clearInterval(timer);
      api.off("select", onSelect);
    };
  }, [api, effectiveTestimonials.length]);

  return (
    <section
      className={`homepage-style-scope surface-section-shell ${sectionPatternClass} relative py-24 sm:py-32`}
      id="testimonials"
      style={sectionStyleVars}
    >
      <div className="pointer-events-none absolute inset-x-0 top-16 z-0 mx-auto h-72 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(14,31,83,0.10)_0%,rgba(14,31,83,0.035)_36%,transparent_72%)] blur-3xl" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="section-label mx-auto">{getSetting("home_testimonials_kicker", "Kundenstimmen")}</p>
          <h2 className="section-title mt-4">
            {getSetting("home_testimonials_title", "Das sagen unsere Kundinnen & Kunden")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {getSetting(
              "home_testimonials_description",
              "Echte Rückmeldungen aus Projekten, Relaunches und laufenden SEO-Setups – direkt aus der Praxis.",
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-14"
        >
          <Carousel setApi={setApi} opts={{ loop: effectiveTestimonials.length > 1, align: "start" }}>
            <CarouselContent className="-ml-4">
              {effectiveTestimonials.map((item) => (
                <CarouselItem key={item.id} className={getCarouselItemClassName(effectiveTestimonials.length)}>
                  <div
                    className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-7 md:p-8"
                    style={{
                      borderColor: "color-mix(in srgb, var(--surface-card-border) 58%, var(--theme-secondary-hex) 42%)",
                      background:
                        "linear-gradient(180deg, var(--surface-card) 0%, color-mix(in srgb, var(--surface-card) 87%, var(--theme-secondary-hex) 7%) 100%)",
                      boxShadow: "0 38px 110px -62px rgba(14,31,83,0.28)",
                    }}
                  >
                    <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--theme-secondary-hex)_36%,transparent),transparent)] opacity-90" />
                    <div className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(14,31,83,0.10)_0%,transparent_72%)] blur-2xl" />

                    <div className="mb-8 flex items-start justify-between gap-5">
                      <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold text-primary"
                        style={{
                          borderColor: "color-mix(in srgb, var(--theme-secondary-hex) 22%, transparent)",
                          background: "color-mix(in srgb, var(--theme-secondary-hex) 6%, transparent)",
                        }}
                      >
                        {Array.from({ length: item.rating }).map((_, index) => (
                          <Star key={index} size={15} className="fill-current" />
                        ))}
                        <span className="ml-1">{item.rating}.0</span>
                      </div>

                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-primary"
                        style={{
                          borderColor: "color-mix(in srgb, var(--theme-secondary-hex) 20%, transparent)",
                          background: "color-mix(in srgb, var(--theme-secondary-hex) 7%, transparent)",
                        }}
                      >
                        <Quote size={20} />
                      </div>
                    </div>

                    <p className="flex-1 text-lg font-medium leading-8 text-[var(--surface-card-text)] md:text-[1.14rem] md:leading-9">
                      “{item.text}”
                    </p>

                    <div className="mt-8 flex items-center gap-4 border-t pt-6"
                      style={{ borderColor: "color-mix(in srgb, var(--surface-card-border) 88%, transparent)" }}
                    >
                      <Avatar
                        className="h-16 w-16 border-2 shadow-[0_22px_42px_-28px_rgba(14,31,83,0.3)]"
                        style={{ borderColor: "var(--surface-card-border)" }}
                      >
                        {item.image_url ? (
                          <AvatarImage
                            src={toSupabaseRenderUrl(item.image_url, { width: 100, quality: 80 })}
                            alt={item.name}
                          />
                        ) : null}
                        <AvatarFallback
                          style={{
                            background: "var(--theme-secondary-hex)",
                            color: "hsl(var(--secondary-foreground))",
                          }}
                        >
                          {item.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="truncate text-lg font-bold text-[var(--surface-card-text)]">{item.name}</div>
                        <div className="mt-1 text-sm leading-6 text-[var(--surface-card-muted)]">{item.role}</div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {effectiveTestimonials.length > 1 ? (
            <div className="mt-7 flex items-center justify-center gap-2">
              {effectiveTestimonials.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2.5 rounded-full transition-all ${current === index ? "w-10 bg-primary" : "w-2.5"}`}
                  style={
                    current === index
                      ? undefined
                      : {
                          background:
                            "color-mix(in srgb, var(--surface-card-border) 78%, var(--surface-card-text) 22%)",
                        }
                  }
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
