import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const serviceOptions = [
  "Website-Erstellung", "Onlineshop-Erstellung", "Website-Relaunch",
  "SEO & KI-Sichtbarkeit", "Lokale SEO-Optimierung", "Marketing-Beratung", "Sonstiges",
];

const budgetOptions = ["unter 2.000 €", "2.000 – 5.000 €", "5.000 – 10.000 €", "über 10.000 €"];

const inputClass = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all text-sm";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "", company: "", email: "", phone: "",
    service: "", budget: "", website: "", description: "", privacy: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        name: formData.name,
        company: formData.company || null,
        email: formData.email,
        phone: formData.phone || null,
        service: formData.service || null,
        budget: formData.budget || null,
        website: formData.website || null,
        description: formData.description || null,
      });
      if (error) throw error;
      setIsSubmitted(true);
      toast({ title: "Erfolgreich gesendet!", description: "Wir melden uns in Kürze bei dir." });
    } catch {
      toast({ title: "Fehler", description: "Bitte versuche es erneut.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  if (isSubmitted) {
    return (
      <section id="kontakt" className="py-24 md:py-36 bg-surface" ref={ref}>
        <div className="section-container text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 max-w-lg mx-auto">
            <CheckCircle2 size={48} className="text-secondary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Vielen Dank!</h3>
            <p className="text-muted-foreground">Ich melde mich persönlich bei dir zurück.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakt" className="py-24 md:py-36 bg-surface" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
            <p className="section-label">Kontakt</p>
            <h2 className="section-title">
              Kostenloses <span className="gradient-gold-text">Erstgespräch</span> anfragen
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Erzähl mir kurz von deinem Projekt – ich melde mich persönlich bei dir zurück.
            </p>
            <div className="space-y-5">
              {[
                { step: "01", label: "Formular ausfüllen", time: "1 Min." },
                { step: "02", label: "Kostenloser Kennenlern-Call", time: "15 Min." },
                { step: "03", label: "Strategie & Angebot erhalten" },
                { step: "04", label: "Umsetzung & Optimierung" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">{s.step}</div>
                  <div>
                    <span className="font-semibold text-sm">{s.label}</span>
                    {s.time && <span className="text-muted-foreground text-xs ml-2">({s.time})</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }} className="glass-card p-6 md:p-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Name *</label>
                <input required type="text" value={formData.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="Dein Name" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Unternehmen</label>
                <input type="text" value={formData.company} onChange={(e) => update("company", e.target.value)} className={inputClass} placeholder="Firma (optional)" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">E-Mail *</label>
                <input required type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="deine@email.at" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Telefon</label>
                <input type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="+43 ..." />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Dienstleistung *</label>
                <select required value={formData.service} onChange={(e) => update("service", e.target.value)} className={inputClass}>
                  <option value="">Bitte auswählen</option>
                  {serviceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Budget *</label>
                <select required value={formData.budget} onChange={(e) => update("budget", e.target.value)} className={inputClass}>
                  <option value="">Bitte auswählen</option>
                  {budgetOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Webseite (optional)</label>
              <input type="url" value={formData.website} onChange={(e) => update("website", e.target.value)} className={inputClass} placeholder="https://deine-webseite.at" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Projektbeschreibung *</label>
              <textarea required rows={3} value={formData.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} placeholder="Beschreib kurz dein Projekt..." />
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required checked={formData.privacy} onChange={(e) => update("privacy", e.target.checked)} className="mt-0.5 accent-primary" />
              <span className="text-xs text-muted-foreground">Ich bin mit den Datenschutzbestimmungen einverstanden. *</span>
            </label>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary disabled:opacity-50">
              {isSubmitting ? "Wird gesendet..." : "🚀 Jetzt kostenlos beraten lassen"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
