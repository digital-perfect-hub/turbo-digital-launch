import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { defaultTestimonials, type TestimonialItem, useSiteSettings } from "@/hooks/useSiteSettings";

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const { getSetting, getJsonSetting } = useSiteSettings();
  const testimonials = getJsonSetting<TestimonialItem[]>("home_testimonials", defaultTestimonials);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-20 sm:py-24 md:py-28 bg-surface" aria-label="Testimonials">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="section-label">{getSetting("home_testimonials_kicker")}</p>
          <h2 className="section-title">{getSetting("home_testimonials_title")}</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            <Quote className="text-primary/10 absolute top-6 left-6" size={60} />
            <div className="flex gap-1 mb-8 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="text-primary fill-primary" />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={current} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                <p className="text-lg md:text-2xl text-center leading-relaxed mb-8 text-foreground/85">
                  „{testimonials[current]?.text}"
                </p>
                <div className="text-center">
                  <p className="font-bold text-primary text-lg">{testimonials[current]?.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[current]?.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
              className="h-12 w-12 p-0 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
              aria-label="Vorheriges Testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-primary w-8" : "bg-muted-foreground/20 w-1.5"}`} />
              ))}
            </div>
            <button
              onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
              className="h-12 w-12 p-0 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
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
