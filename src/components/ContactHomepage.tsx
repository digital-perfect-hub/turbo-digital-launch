import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Code2, Search, Sparkles, Quote, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { contactHomepageNavigation, type ContactHomepageContent } from "@/lib/contact-homepage";
import { buildAbsolutePublicUrl } from "@/lib/url";
import "@/styles/contact-homepage.css";

type Testimonial = { id: string; name?: string; role?: string; company?: string; quote?: string; text?: string; content?: string };
const icons = [Code2, Search, Sparkles];

function portraitSource(url: string, width: number) {
  if (!url.trim()) return "";
  const source = new URL(url, window.location.origin);
  if (source.pathname.includes("/storage/v1/object/public/")) {
    source.pathname = source.pathname.replace("/object/public/", "/render/image/public/");
  }
  if (source.pathname.includes("/render/image/public/")) {
    source.searchParams.set("width", String(width));
    source.searchParams.set("quality", "82");
  }
  return source.href;
}

const ContactHomepage = ({ content: c }: { content: ContactHomepageContent }) => {
  const projectSliderRef = useRef<HTMLDivElement>(null);
  const [projectIndex, setProjectIndex] = useState(0);
  const { activeSiteId } = useSiteContext();
  const { settings: theme, logoUrl } = useGlobalTheme();
  const { data: storedTestimonials = [] } = useQuery({
    queryKey: ["contact-homepage-testimonials", activeSiteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").eq("site_id", activeSiteId).eq("is_visible", true).order("sort_order").limit(3);
      if (error) throw error;
      return ((data ?? []) as Testimonial[]).map((row) => ({ ...row, text: row.quote || row.text || row.content || "" })).filter((row) => row.name && row.text);
    },
  });
  const testimonials: Testimonial[] = storedTestimonials.length ? storedTestimonials : c.testimonials.map((item, index) => ({ ...item, id: `contact-quote-${index}` }));
  const moveProject = (nextIndex: number) => {
    const index = (nextIndex + c.references.length) % c.references.length;
    projectSliderRef.current?.children[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setProjectIndex(index);
  };
  useEffect(() => {
    const slider = projectSliderRef.current;
    if (!slider) return;
    const onScroll = () => {
      const width = slider.clientWidth || 1;
      setProjectIndex(Math.round(slider.scrollLeft / width));
    };
    slider.addEventListener("scroll", onScroll, { passive: true });
    return () => slider.removeEventListener("scroll", onScroll);
  }, [c.references.length]);
  const nav = contactHomepageNavigation(c).filter((link) => link.url !== "#referenzen" || c.references.length > 0);
  const schema = [{
    "@context": "https://schema.org", "@type": "ProfessionalService",
    name: theme.company_name, url: buildAbsolutePublicUrl("/"), description: theme.meta_description,
    ...(logoUrl ? { logo: logoUrl } : {}),
  }, ...(c.faq.length ? [{
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: c.faq.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  }] : [])];

  return (
    <div className="contact-homepage">
      <SEO structuredData={schema} />
      <a className="contact-skip" href="#start">Zum Inhalt springen</a>
      <Header navigation={nav} contactCta={c.primaryCta} />
      <main>
        <section id="start" className={`ch-hero ${c.showPortrait ? "" : "ch-hero-no-portrait"}`}>
          <div className="ch-container ch-hero-grid">
            <div className="ch-hero-copy">
              <p className="ch-kicker">{c.kicker}</p>
              <h1>{c.headline}<br /><span>{c.highlight}</span></h1>
              <p className="ch-intro">{c.introduction}</p>
              <div className="ch-actions">
                <a className="ch-button" href="#kontakt">{c.primaryCta}<ArrowUpRight size={19} /></a>
                <a className="ch-text-link" href="#leistungen">{c.secondaryCta}<ArrowDown size={17} /></a>
              </div>
              <div className="ch-hero-byline"><span className="ch-dot" /><span>{c.founderName} · {c.founderRole}</span></div>
            </div>
            {c.showPortrait && c.portraitUrl ? <div className="ch-portrait">
              <div className="ch-portrait-orbit" aria-hidden="true" />
              <img className="ch-portrait-bg" src={portraitSource(c.portraitUrl, 700)} alt="" aria-hidden="true" />
              <img className="ch-portrait-main" src={portraitSource(c.portraitUrl, 1000)} srcSet={c.portraitUrl.includes("/storage/") ? `${portraitSource(c.portraitUrl, 600)} 600w, ${portraitSource(c.portraitUrl, 1000)} 1000w` : undefined} sizes="(max-width: 760px) 90vw, 48vw" width="900" height="1537" alt={c.portraitAlt} fetchPriority="high" />
              <div className="ch-portrait-side" aria-hidden="true">
                <span className="ch-portrait-side-line" />
                <div className="ch-portrait-services">
                  <strong>Digital-Perfect</strong>
                  <span className="ch-portrait-service"><Code2 size={15} /><b>Webdesign</b></span>
                  <span className="ch-portrait-service"><Search size={15} /><b>SEO</b></span>
                  <span className="ch-portrait-service"><Sparkles size={15} /><b>KI-Sichtbarkeit</b></span>
                </div>
              </div>
              <div className="ch-portrait-caption"><span>{c.founderName}</span><ArrowUpRight size={24} /></div>
            </div> : <div className="ch-hero-statement" aria-hidden="true">{c.services.map((service, index) => <span key={service.title}>{String(index + 1).padStart(2, "0")} — {service.title}</span>)}<ArrowUpRight /></div>}
          </div>
        </section>

        <div className="ch-proof"><div className="ch-container ch-proof-grid">{c.proof.map((item) => <div key={item.title}><Check size={18} /><div><strong>{item.title}</strong><span>{item.text}</span></div></div>)}</div></div>

        <section id="leistungen" className="ch-section ch-services">
          <div className="ch-container">
            <div className="ch-section-heading"><p className="ch-kicker">{c.servicesKicker}</p><h2>{c.servicesTitle}</h2><p>{c.servicesText}</p></div>
            <div className="ch-card-grid">{c.services.map((service, index) => {
              const Icon = icons[index % icons.length];
              return <article className="ch-service" key={service.title}><div className="ch-card-top"><Icon size={28} strokeWidth={1.5} /><span>{String(index + 1).padStart(2, "0")}</span></div><h3>{service.title}</h3><p>{service.text}</p><a href="#kontakt" aria-label={`${service.title}: ${c.serviceCta}`}>{c.serviceCta}<ArrowUpRight size={19} /></a></article>;
            })}</div>
          </div>
        </section>

        {testimonials.length > 0 && <section id="kundenstimmen" className="ch-section ch-references"><div className="ch-container">
          <div className="ch-section-heading"><p className="ch-kicker">{c.referencesKicker}</p><h2>{c.referencesTitle}</h2><p>{c.referencesText}</p></div>
          <div className="ch-card-grid">{testimonials.map((item) => <figure className="ch-quote" key={item.id}><Quote size={28} strokeWidth={1.5} aria-hidden="true" /><div className="ch-rating" aria-label="5 von 5 Sternen"><span className="ch-rating-stars" aria-hidden="true">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={16} strokeWidth={1.8} fill="currentColor" />)}</span><strong>5/5</strong></div><blockquote>{item.text}</blockquote><figcaption><div className="ch-initials" aria-hidden="true">{item.name?.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div><div><strong>{item.name}</strong><span>{[item.role, item.company].filter(Boolean).join(" · ")}</span></div></figcaption></figure>)}</div>
        </div></section>}

        {c.references.length > 0 && <section id="referenzen" className="ch-section ch-projects"><div className="ch-container">
          <div className="ch-section-heading"><p className="ch-kicker">DIGITAL-PERFECT PROJEKTE</p><h2>Websites, die im Kopf bleiben.</h2><p>Einige Auftritte, die wir uns als visuelle Referenz ansehen – mit klarer Struktur, eigener Haltung und einem starken ersten Eindruck.</p></div>
          <div className="ch-project-slider-shell">
            <button className="ch-project-arrow ch-project-arrow-prev" type="button" onClick={() => moveProject(projectIndex - 1)} aria-label="Vorheriges Projekt"><ArrowRight size={22} /></button>
            <div className="ch-project-slider" ref={projectSliderRef} aria-label="Referenzprojekte">
              {c.references.map((project) => <article className="ch-project-card" key={project.title} style={{ "--project-accent": project.accent } as CSSProperties}><a href={project.url} target="_blank" rel="noreferrer" className="ch-project-image"><span className="ch-browser-bar"><i /><i /><i /><b>{project.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</b></span><img src={project.image} alt={`Screenshot von ${project.title}`} loading="lazy" /><span className="ch-project-open"><ArrowUpRight size={19} /></span></a><div className="ch-project-body"><p className="ch-project-category">{project.category}</p><h3>{project.title}</h3><p>{project.description}</p><a className="ch-project-link" href={project.url} target="_blank" rel="noreferrer">Projekt ansehen <ArrowUpRight size={17} /></a></div></article>)}
            </div>
            <button className="ch-project-arrow ch-project-arrow-next" type="button" onClick={() => moveProject(projectIndex + 1)} aria-label="Nächstes Projekt"><ArrowRight size={22} /></button>
          </div>
          <div className="ch-project-controls" aria-label="Projekt auswählen">{c.references.map((project, index) => <button key={project.title} type="button" className={index === projectIndex ? "is-active" : ""} onClick={() => moveProject(index)} aria-label={`${project.title} anzeigen`} />)}</div>
        </div></section>}



        <section id="ueber-markus" className="ch-section ch-founder"><div className="ch-container ch-founder-grid">
          <div><p className="ch-kicker">{c.founderKicker}</p><h2>{c.founderTitle}</h2><a className="ch-button" href="#kontakt">{c.serviceCta}<ArrowUpRight size={19} /></a></div>
          <div><p className="ch-founder-text">{c.founderText}</p><div className="ch-founder-points">{c.founderPoints.map((point) => <div key={point.title}><Check size={19} /><div><h3>{point.title}</h3><p>{point.text}</p></div></div>)}</div><p className="ch-signature">{c.founderName}</p><p className="ch-founder-note">{c.founderNote}</p></div>
        </div></section>

        <section id="ablauf" className="ch-section"><div className="ch-container"><div className="ch-section-heading"><p className="ch-kicker">{c.processKicker}</p><h2>{c.processTitle}</h2></div><div className="ch-card-grid">{c.steps.map((step, index) => <article className="ch-step" key={step.title}><div className="ch-step-number">{String(index + 1).padStart(2, "0")}<ArrowRight size={20} /></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></div></section>

        <section id="faq" className="ch-section ch-faq"><div className="ch-container ch-faq-grid"><div><p className="ch-kicker">{c.faqKicker}</p><h2>{c.faqTitle}</h2></div><div>{c.faq.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></div></section>

        <ContactSection contactPage={c} />
      </main>
      <Footer navigation={nav} description={c.footerText} />
    </div>
  );
};

export default ContactHomepage;
