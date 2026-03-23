import { motion, useInView } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock3, Mail, PhoneCall } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  defaultContactSectionContent,
  defaultSiteText,
  type ContactSectionContent,
  type ContactTrustSignal,
  useSiteSettings,
} from "@/hooks/useSiteSettings";
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
  signals
    .filter((signal) => signal?.title?.trim() || signal?.text?.trim())
    .slice(0, 3)
    .map((signal) => ({
      icon: signal.icon && iconMap[signal.icon] ? signal.icon : "mail",
      title: signal.title || "",
      text: signal.text || "",
    }));

const mergeContactContent = (value: ContactSectionContent | null | undefined): ContactSectionContent => ({
  panel_description: value?.panel_description || "",
  trust_signals: normalizeTrustSignals(value?.trust_signals?.length ? value.trust_signals : defaultContactSectionContent.trust_signals),
  labels: {
    ...defaultContactSectionContent.labels,
    ...(value?.labels || {}),
  },
  placeholders: {
    ...defaultContactSectionContent.placeholders,
    ...(value?.placeholders || {}),
  },
  service_options:
    value?.service_options?.filter((item) => item?.trim())?.length
      ? value.service_options.filter((item) => item?.trim())
      : defaultContactSectionContent.service_options,
  budget_options:
    value?.budget_options?.filter((item) => item?.trim())?.length
      ? value.budget_options.filter((item) => item?.trim())
      : defaultContactSectionContent.budget_options,
  submit_text: value?.submit_text || defaultContactSectionContent.submit_text,
  submitting_text: value?.submitting_text || defaultContactSectionContent.submitting_text,
  success_title: value?.success_title || defaultContactSectionContent.success_title,
  success_text: value?.success_text || defaultContactSectionContent.success_text,
  success_toast_title: value?.success_toast_title || defaultContactSectionContent.success_toast_title,
  success_toast_description: value?.success_toast_description || defaultContactSectionContent.success_toast_description,
  error_toast_title: value?.error_toast_title || defaultContactSectionContent.error_toast_title,
  error_toast_description: value?.error_toast_description || defaultContactSectionContent.error_toast_description,
});

const ContactSection = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const { getSetting, getJsonSetting } = useSiteSettings();

  const content = useMemo(
    () => mergeContactContent(getJsonSetting<ContactSectionContent>("contact_section_content", defaultContactSectionContent)),
    [getJsonSetting],
  );

  const kicker =
    getSetting("home_contact_kicker", defaultSiteText.home_contact_kicker).trim() || defaultSiteText.home_contact_kicker;
  const title =
    getSetting("home_contact_title", defaultSiteText.home_contact_title).trim() || defaultSiteText.home_contact_title;
  const sectionDescription =
    getSetting("home_contact_description", defaultSiteText.home_contact_description).trim() ||
    defaultSiteText.home_contact_description;

  const panelDescription = content.panel_description || sectionDescription;

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
        title: content.success_toast_title,
        description: content.success_toast_description,
      });
    } catch {
      toast({
        title: content.error_toast_title,
        description: content.error_toast_description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <section id="kontakt" className="bg-background py-24 md:py-32" ref={ref}>
        <div className="section-container text-center">
          <motion.div
            initial={{ scale: 0.86, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto max-w-lg rounded-[2.5rem] border border-border bg-card p-16 shadow-xl"
          >
            <CheckCircle2 size={64} className="mx-auto mb-6 text-primary" />
            <h3 className="mb-4 text-3xl font-extrabold text-foreground">{content.success_title}</h3>
            <p className="text-lg text-muted-foreground">{content.success_text}</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakt" className="relative overflow-hidden bg-background py-24 sm:py-32" ref={ref}>
      <div className="section-container relative z-10">
        <div className="grid gap-12 xl:grid-cols-[0.9fr_1.1fr] xl:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="dark-panel-shell relative self-start overflow-hidden rounded-[2.5rem] p-10 xl:sticky xl:top-32 md:p-14"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--hero-headline)_5%,transparent)_0%,transparent_50%)]" />

            <div className="relative z-10">
              <p className="dark-panel-kicker mb-6 inline-flex rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                {kicker}
              </p>

              <h2 className="dark-panel-title mb-6 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
                {title}
              </h2>

              <p className="dark-panel-body mb-12 text-lg leading-relaxed">{panelDescription}</p>

              <div className="dark-panel-divider space-y-8 border-t pt-8">
                {content.trust_signals.map((signal, index) => {
                  const Icon = iconMap[signal.icon] || Mail;

                  return (
                    <div key={`${signal.title}-${index}`} className="flex gap-5">
                      <div className="dark-panel-icon inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                        <Icon size={22} />
                      </div>

                      <div>
                        <h4 className="dark-panel-title mb-1 text-base font-bold">{signal.title}</h4>
                        <p className="dark-panel-body text-sm leading-relaxed">{signal.text}</p>
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
            className="rounded-[2.5rem] border border-border bg-card p-8 shadow-xl sm:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.name}</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={inputClass}
                    placeholder={content.placeholders.name}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.company}</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => update("company", e.target.value)}
                    className={inputClass}
                    placeholder={content.placeholders.company}
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.email}</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputClass}
                    placeholder={content.placeholders.email}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.phone}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputClass}
                    placeholder={content.placeholders.phone}
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.service}</label>
                  <select
                    required
                    value={formData.service}
                    onChange={(e) => update("service", e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      {content.placeholders.service_placeholder}
                    </option>
                    {content.service_options.map((opt) => (
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
                    {content.budget_options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.website}</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => update("website", e.target.value)}
                  className={inputClass}
                  placeholder={content.placeholders.website}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{content.labels.description}</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => update("description", e.target.value)}
                  className={`${inputClass} resize-none`}
                  placeholder={content.placeholders.description}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/30">
                <input
                  type="checkbox"
                  required
                  checked={formData.privacy}
                  onChange={(e) => update("privacy", e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm leading-relaxed text-muted-foreground">{content.labels.privacy}</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full !justify-center !py-4 !text-base disabled:opacity-60"
              >
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
