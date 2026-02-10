import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, ArrowRight } from "lucide-react";

const serviceOptions = [
  "Website-Erstellung",
  "Onlineshop-Erstellung",
  "Website-Relaunch",
  "SEO & KI-Sichtbarkeit",
  "Lokale SEO-Optimierung",
  "Marketing-Beratung",
  "Sonstiges",
];

const budgetOptions = [
  "unter 2.000 €",
  "2.000 – 5.000 €",
  "5.000 – 10.000 €",
  "über 10.000 €",
];

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Supabase integration will be added later
    console.log("Form submitted:", formData);
    alert("Vielen Dank! Wir melden uns in Kürze bei dir.");
  };

  const update = (field: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <section id="kontakt" className="py-20 md:py-32 bg-surface" ref={ref}>
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">
              Kontakt
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-balance">
              Kostenloses <span className="gradient-gold-text">Erstgespräch</span> anfragen
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Erzähl mir kurz von deinem Projekt – Website, Onlineshop oder SEO & KI-Sichtbarkeit.
              Ich melde mich persönlich bei dir zurück.
            </p>

            <div className="space-y-6">
              {[
                { step: "1", label: "Formular ausfüllen", time: "1 Min." },
                { step: "2", label: "Kostenloser Kennenlern-Call", time: "15 Min." },
                { step: "3", label: "Strategie & Angebot erhalten", time: "" },
                { step: "4", label: "Umsetzung & Optimierung", time: "" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <span className="font-semibold">{s.label}</span>
                    {s.time && (
                      <span className="text-muted-foreground text-sm ml-2">({s.time})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-card p-6 md:p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="Dein Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Unternehmen</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => update("company", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="Firma (optional)"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">E-Mail *</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="deine@email.at"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefon *</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="+43 ..."
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Dienstleistung *</label>
                <select
                  required
                  value={formData.service}
                  onChange={(e) => update("service", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                >
                  <option value="">Bitte auswählen</option>
                  {serviceOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Budget *</label>
                <select
                  required
                  value={formData.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                >
                  <option value="">Bitte auswählen</option>
                  {budgetOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Webseite (optional)</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => update("website", e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="https://deine-webseite.at"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Projektbeschreibung *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => update("description", e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                placeholder="Beschreib kurz dein Unternehmen und dein Projekt..."
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.privacy}
                onChange={(e) => update("privacy", e.target.checked)}
                className="mt-1 accent-primary"
              />
              <span className="text-sm text-muted-foreground">
                Ich bin mit den Datenschutzbestimmungen einverstanden. *
              </span>
            </label>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-base hover:bg-gold-light transition-colors"
            >
              🚀 Jetzt kostenlos beraten lassen
              <ArrowRight size={18} />
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
