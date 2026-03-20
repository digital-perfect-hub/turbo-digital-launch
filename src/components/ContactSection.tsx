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
  "Lokale SEO-Optimierung",
  "Marketing-Beratung",
  "Sonstiges / noch unsicher",
];

const budgetOptions = ["unter 2.000 €", "2.000 – 5.000 €", "5.000 – 10.000 €", "über 10.000 €"];

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/20";

const trustSignals = [
  { icon: Clock3, title: "Schnelle Rückmeldung", text: "Klare Erstreaktion statt tagelangem Schweigen." },
  { icon: PhoneCall, title: "Persönlicher Austausch", text: "Keine Hotline, sondern direkte Kommunikation zum Projekt." },
  { icon: Mail, title: "Klare nächste Schritte", text: "Du bekommst Struktur, Feedback und einen sauberen Fahrplan." },
];

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const { getSetting } = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "",
    budget: "",
    website: "",
    description: "",
    privacy: false,
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

  const update = (field: string, value: string | boolean) => setFormData((prev) => ({ ...prev, [field]: value }));

  if (isSubmitted) {
    return (
      <section id="kontakt" className="bg-background py-24 md:py-32" ref={ref}>
        <div className="section-container text-center">
          <motion.div initial={{ scale: 0.86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card mx-auto max-w-lg p-12">
            <div className="relative z-10">
              <CheckCircle2 size={52} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold text-slate-900">Vielen Dank!</h3>
              <p className="mt-3 text-slate-600">Ich melde mich persönlich bei dir zurück.</p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakt" className="bg-background py-24 md:py-32" ref={ref}>
      <div className="section-container">
        <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr] xl:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -34 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65 }}
            className="premium-dark-card p-8 md:p-10"
          >
            <div className="relative z-10">
              <p className="section-label">{getSetting("home_contact_kicker")}</p>
              <h2 className="section-title max-w-3xl text-white">{getSetting("home_contact_title")}</h2>
              <p className="max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">{getSetting("home_contact_description")}</p>

              <div className="mt-8 grid gap-4">
                {trustSignals.map((signal) => (
                  <div key={signal.title} className="rounded-[1.4rem] border border-white/12 bg-white/[0.06] p-4">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/14 text-primary">
                        <signal.icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{signal.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-300">{signal.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 34 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="premium-card p-6 md:p-8"
          >
            <div className="relative z-10 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Name *</label>
                  <input required type="text" value={formData.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="Dein Name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Unternehmen</label>
                  <input type="text" value={formData.company} onChange={(e) => update("company", e.target.value)} className={inputClass} placeholder="Unternehmen" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">E-Mail-Adresse *</label>
                  <input required type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="deine@email.at" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Telefonnummer *</label>
                  <input required type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="+43 ..." />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Dienstleistung *</label>
                  <select required value={formData.service} onChange={(e) => update("service", e.target.value)} className={inputClass}>
                    <option value="">Bitte auswählen</option>
                    {serviceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Budget *</label>
                  <select required value={formData.budget} onChange={(e) => update("budget", e.target.value)} className={inputClass}>
                    <option value="">Bitte auswählen</option>
                    {budgetOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Webseite (optional)</label>
                <input type="url" value={formData.website} onChange={(e) => update("website", e.target.value)} className={inputClass} placeholder="https://deine-webseite.at" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Projekt kurz beschreiben *</label>
                <textarea required rows={5} value={formData.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} placeholder="Beschreib kurz dein Projekt, Angebot und Ziel ..." />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white/88 p-4">
                <input type="checkbox" required checked={formData.privacy} onChange={(e) => update("privacy", e.target.checked)} className="mt-1 accent-primary" />
                <span className="text-xs leading-relaxed text-slate-600">Ich bin mit den Datenschutzbestimmungen einverstanden und möchte zur Projektanfrage kontaktiert werden.</span>
              </label>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
                {isSubmitting ? "Wird gesendet..." : "Jetzt kostenlos beraten lassen"}
                {!isSubmitting && <ArrowRight size={18} />}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
