import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { defaultTestimonials, type TestimonialItem, useSiteSettings } from "@/hooks/useSiteSettings";

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const { getSetting, getJsonSetting } = useSiteSettings();
  const testimonials = getJsonSetting<TestimonialItem[]>("home_testimonials", defaultTestimonials);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 6500);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section id="stimmen" className="bg-surface py-20 sm:py-24 md:py-28" aria-label="Testimonials">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="section-label">{getSetting("home_testimonials_kicker")}</p>
          <h2 className="section-title">{getSetting("home_testimonials_title")}</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-4xl"
        >
          <div className="premium-dark-card p-8 md:p-12">
            <Quote className="absolute left-6 top-6 text-white/10" size={62} />
            <div className="relative z-10">
              <div className="mb-8 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-gold text-gold" />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-center text-lg leading-relaxed text-slate-100 md:text-2xl">
                    „{testimonials[current]?.text}"
                  </p>
                  <div className="mt-8 text-center">
                    <p className="text-lg font-bold text-white">{testimonials[current]?.name}</p>
                    <p className="text-sm text-slate-300">{testimonials[current]?.role}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
              aria-label="Vorheriges Testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-slate-900" : "w-1.5 bg-slate-300"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
              aria-label="Nächstes Testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
