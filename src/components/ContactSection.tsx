import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { CheckCircle2, Clock3, Mail, PhoneCall } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { defaultContactSectionContent, type ContactTrustSignal, useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";

const inputClass =
  "w-full rounded-[1.25rem] border border-border bg-surface px-5 py-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground/60 hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-background";

const iconMap = {
  clock: Clock3,
  phone: PhoneCall,
  mail: Mail,
} as const;

const normalizeTrustSignals = (signals: ContactTrustSignal[]) =>
  signals.filter((signal) => signal?.title?.trim() || signal?.text?.trim()).slice(0, 3);

const ContactSection = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const { getSetting, getJsonSetting } = useSiteSettings();
  const content = getJsonSetting("contact_section_content", defaultContactSectionContent);
  const trustSignals = normalizeTrustSignals(content.trust_signals?.length ? content.trust_signals : defaultContactSectionContent.trust_signals);

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
        site_id: siteId,
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
      toast({
        title: content.success_toast_title || defaultContactSectionContent.success_toast_title,
        description: content.success_toast_description || defaultContactSectionContent.success_toast_description,
      });
    } catch {
      toast({
        title: content.error_toast_title || defaultContactSectionContent.error_toast_title,
        description: content.error_toast_description || defaultContactSectionContent.error_toast_description,
        variant: "destructive",
      });
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
            <h3 className="text-3xl font-extrabold text-foreground mb-4">{content.success_title || defaultContactSectionContent.success_title}</h3>
            <p className="text-lg text-muted-foreground">{content.success_text || defaultContactSectionContent.success_text}</p>
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
                {content.panel_description || getSetting("home_contact_description", defaultContactSectionContent.panel_description)}
              </p>

              <div className="space-y-8 border-t border-white/10 pt-8">
                {trustSignals.map((signal, index) => {
                  const Icon = iconMap[signal.icon] || Mail;
                  return (
                    <div key={`${signal.title}-${index}`} className="flex gap-5">
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
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.name}</label>
                  <input required type="text" value={formData.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder={content.placeholders.name} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.company}</label>
                  <input type="text" value={formData.company} onChange={(e) => update("company", e.target.value)} className={inputClass} placeholder={content.placeholders.company} />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.email}</label>
                  <input required type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder={content.placeholders.email} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.phone}</label>
                  <input type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder={content.placeholders.phone} />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.service}</label>
                  <select required value={formData.service} onChange={(e) => update("service", e.target.value)} className={inputClass}>
                    <option value="" disabled>
                      {content.placeholders.service_placeholder}
                    </option>
                    {(content.service_options?.length ? content.service_options : defaultContactSectionContent.service_options).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.budget}</label>
                  <select value={formData.budget} onChange={(e) => update("budget", e.target.value)} className={inputClass}>
                    <option value="" disabled>
                      {content.placeholders.budget_placeholder}
                    </option>
                    {(content.budget_options?.length ? content.budget_options : defaultContactSectionContent.budget_options).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.website}</label>
                <input type="url" value={formData.website} onChange={(e) => update("website", e.target.value)} className={inputClass} placeholder={content.placeholders.website} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.description}</label>
                <textarea required rows={4} value={formData.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} placeholder={content.placeholders.description} />
              </div>

              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/30">
                <input type="checkbox" required checked={formData.privacy} onChange={(e) => update("privacy", e.target.checked)} className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm leading-relaxed text-muted-foreground">{content.labels.privacy}</span>
              </label>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full !justify-center !py-4 !text-base disabled:opacity-60">
                {isSubmitting ? content.submitting_text : content.submit_text}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
