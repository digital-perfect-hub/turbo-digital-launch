import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, Mail, PhoneCall } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const serviceOptions = [
  "Webdesign / neue Webseite",
  "Onlineshop-Erstellung",
  "Website-Relaunch",
  "Landingpages / Verkaufsseiten",
  "SEO & KI-Sichtbarkeit",
  "Sonstiges / noch unsicher",
];

const budgetOptions = ["unter 2.000 €", "2.000 – 5.000 €", "5.000 – 10.000 €", "über 10.000 €"];

// Massiv aufgewertete Inputs für echte Conversion
const inputClass =
  "w-full rounded-[1.25rem] border border-border bg-surface px-5 py-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground/60 hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-background";

const trustSignals = [
  { icon: Clock3, title: "Schnelle Rückmeldung", text: "Wir melden uns in der Regel am selben Tag." },
  { icon: PhoneCall, title: "Persönlicher Austausch", text: "Kein Callcenter, direkter Draht zum Experten." },
  { icon: Mail, title: "Klare nächste Schritte", text: "Du bekommst sofort einen sauberen Fahrplan." },
];

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const { getSetting } = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "", company: "", email: "", phone: "", service: "", budget: "", website: "", description: "", privacy: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        name: formData.name, company: formData.company || null, email: formData.email, phone: formData.phone || null, service: formData.service || null, budget: formData.budget || null, website: formData.website || null, description: formData.description || null,
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

  const update = (field: string, value: string | boolean) => setFormData((prev) => ({ ...prev, [field]: value }));

  if (isSubmitted) {
    return (
      <section id="kontakt" className="bg-background py-24 md:py-32" ref={ref}>
        <div className="section-container text-center">
          <motion.div initial={{ scale: 0.86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[2.5rem] border border-border bg-card mx-auto max-w-lg p-16 shadow-xl">
            <CheckCircle2 size={64} className="mx-auto mb-6 text-primary" />
            <h3 className="text-3xl font-extrabold text-foreground mb-4">Vielen Dank!</h3>
            <p className="text-lg text-muted-foreground">Wir haben deine Anfrage erhalten und melden uns in Kürze persönlich bei dir zurück.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakt" className="bg-background py-24 sm:py-32 relative overflow-hidden" ref={ref}>
      <div className="section-container relative z-10">
        <div className="grid gap-12 xl:grid-cols-[0.9fr_1.1fr] xl:gap-20">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="rounded-[2.5rem] bg-slate-950 p-10 md:p-14 relative overflow-hidden shadow-2xl xl:sticky xl:top-32 xl:self-start"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none" />
            
            <div className="relative z-10">
              <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-300 backdrop-blur-md mb-6">
                {getSetting("home_contact_kicker", "Kontakt")}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                {getSetting("home_contact_title", "Lass uns über dein Projekt sprechen.")}
              </h2>
              <p className="text-lg leading-relaxed text-slate-400 mb-12">
                Fülle das Formular aus und wir melden uns zeitnah für eine erste, kostenlose Potenzialanalyse.
              </p>

              <div className="space-y-8 border-t border-white/10 pt-8">
                {trustSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <div key={signal.title} className="flex gap-5">
                      <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white mb-1">{signal.title}</h4>
                        <p className="text-sm leading-relaxed text-slate-400">{signal.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-[2.5rem] border border-border bg-card p-8 sm:p-12 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Name *</label>
                  <input required type="text" value={formData.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="Max Mustermann" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Unternehmen</label>
                  <input type="text" value={formData.company} onChange={(e) => update("company", e.target.value)} className={inputClass} placeholder="Muster GmbH" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">E-Mail *</label>
                  <input required type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="max@beispiel.de" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Telefonnummer</label>
                  <input type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="+43 664 1234567" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Was brauchst du? *</label>
                  <select required value={formData.service} onChange={(e) => update("service", e.target.value)} className={inputClass}>
                    <option value="" disabled>Bitte wählen...</option>
                    {serviceOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Budgetrahmen</label>
                  <select value={formData.budget} onChange={(e) => update("budget", e.target.value)} className={inputClass}>
                    <option value="" disabled>Bitte wählen...</option>
                    {budgetOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Aktuelle Webseite (optional)</label>
                <input type="url" value={formData.website} onChange={(e) => update("website", e.target.value)} className={inputClass} placeholder="https://deine-webseite.at" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Projekt kurz beschreiben *</label>
                <textarea required rows={4} value={formData.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} placeholder="Beschreib kurz dein Projekt, Angebot und Ziel ..." />
              </div>

              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/30">
                <input type="checkbox" required checked={formData.privacy} onChange={(e) => update("privacy", e.target.checked)} className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm leading-relaxed text-muted-foreground">Ich bin mit den Datenschutzbestimmungen einverstanden und möchte zur Projektanfrage kontaktiert werden.</span>
              </label>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-5 !text-lg shadow-[0_0_40px_-10px_rgba(var(--primary),0.4)] disabled:opacity-60 disabled:hover:scale-100">
                {isSubmitting ? "Wird gesendet..." : "Jetzt kostenlos anfragen"}
                {!isSubmitting && <ArrowRight size={20} />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;