import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, CheckCircle2, Menu, X } from "lucide-react";
import Footer from "@/components/Footer";
import SupportWidget from "@/components/support/SupportWidget";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { useToast } from "@/hooks/use-toast";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { FrameStill } from "./FrameStill";
import StudioMonitor from "./StudioMonitor";
import {
  CONTACT_SHEET,
  CONTROL_SPECS,
  FOUNDER,
  INDUSTRIES,
  INDUSTRY_NOTE,
  INTEREST_OPTIONS,
  MODEL_FAMILIES,
  NAV_LINKS,
  PIPELINE,
  PROJECTS,
  SERVICES,
  STUDIO_POINTS,
  STUDIO_URL,
} from "./content";
import "@/styles/premium-home.css";

const pad = (value: number) => String(value).padStart(2, "0");

const Reveal = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease: [0.2, 0, 0, 1], delay }}
    >
      {children}
    </motion.div>
  );
};

// Laufender Timecode im Hero: 24 Bilder pro Sekunde, steht bei reduzierter Bewegung still.
const Timecode = () => {
  const reduce = useReducedMotion();
  const [frames, setFrames] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const start = performance.now();
    const timer = window.setInterval(() => setFrames(Math.floor(((performance.now() - start) / 1000) * 24)), 42);
    return () => window.clearInterval(timer);
  }, [reduce]);

  return <span className="pm-tc">{`00:${pad(Math.floor(frames / 1440) % 60)}:${pad(Math.floor(frames / 24) % 60)}:${pad(frames % 24)}`}</span>;
};

// Laufzeitmarke am linken Rand: zeigt, wie weit man auf der Seite ist, als Timecode.
const PlayheadRail = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const seconds = Math.round(progress * 150);
  return (
    <div className="pm-rail" aria-hidden="true">
      <span className="pm-rail__line" />
      <span className="pm-rail__head" style={{ top: `${progress * 100}%` }}>
        <i />
        <b>{`${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`}</b>
      </span>
    </div>
  );
};

const PremiumNav = ({ brand }: { brand: string }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`pm-nav${scrolled || open ? " is-solid" : ""}`}>
      <div className="pm-nav__inner">
        <a href="/" className="pm-logo" aria-label={`${brand}, zur Startseite`} onClick={() => setOpen(false)}>
          {brand}
          <span className="pm-logo__dot">.</span>
        </a>
        <nav className="pm-nav__links" aria-label="Hauptnavigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>
        <div className="pm-nav__actions">
          <a className="pm-nav__app" href={STUDIO_URL} rel="noopener noreferrer">
            Zur App <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a className="pm-btn pm-btn--sm" href="#kontakt">Pilot anfragen</a>
          <button
            type="button"
            className="pm-nav__toggle"
            aria-expanded={open}
            aria-controls="pm-menu"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <div id="pm-menu" className="pm-menu" hidden={!open}>
        <nav aria-label="Mobile Navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <a href={STUDIO_URL} rel="noopener noreferrer">Zur App</a>
        </nav>
        <a className="pm-btn" href="#kontakt" onClick={() => setOpen(false)}>Pilot anfragen</a>
      </div>
    </header>
  );
};

const Hero = () => (
  <section className="pm-hero" aria-labelledby="pm-h1">
    <div className="pm-hero__bg" aria-hidden="true">
      <span className="pm-hero__glow" />
      <span className="pm-hero__grid" />
      <span className="pm-hero__scan" />
    </div>
    <div className="pm-hud" aria-hidden="true">
      <span className="pm-hud__rec"><i />REC</span>
      <Timecode />
      <span className="pm-hud__fmt">9:16 · 24 FPS</span>
    </div>
    <div className="pm-wrap pm-hero__grid-layout">
      <div className="pm-hero__copy">
        <p className="pm-eyebrow">Digital-Perfect · Software &amp; KI aus Österreich</p>
        <h1 id="pm-h1" className="pm-h1">
          <span className="pm-line"><span>Ein Gesicht.</span></span>
          <span className="pm-line"><span>Jede Szene.</span></span>
          <span className="pm-line pm-line--accent"><span>Volle Kostenkontrolle.</span></span>
        </h1>
        <p className="pm-lead">
          Creator Studio ist unser Produktionswerkzeug für KI-Figuren: Person einmal anlegen, Bilder und Videos erzeugen,
          schneiden, planen und vor jedem bezahlten Auftrag sehen, was er kostet.
        </p>
        <div className="pm-cta">
          <a className="pm-btn" href="#kontakt">Pilotzugang anfragen <ArrowRight size={18} aria-hidden="true" /></a>
          <a className="pm-btn pm-btn--ghost" href="#ablauf">So arbeitet das Studio</a>
        </div>
        <p className="pm-note">Pilotphase: Zugang auf Anfrage, mit persönlicher Einführung.</p>
      </div>
      <div className="pm-hero__stage">
        <StudioMonitor />
      </div>
    </div>
  </section>
);

const Ticker = () => (
  <div className="pm-ticker" role="group" aria-label="Über die Higgsfield-API angebundene Modelle">
    <span className="pm-ticker__label">Modelle über die Higgsfield-API</span>
    <div className="pm-ticker__track" aria-hidden="true">
      {[0, 1].map((copy) => (
        <ul key={copy}>
          {MODEL_FAMILIES.map((model) => (
            <li key={model}>{model}</li>
          ))}
        </ul>
      ))}
    </div>
    <ul className="pm-sr">
      {MODEL_FAMILIES.map((model) => (
        <li key={model}>{model}</li>
      ))}
    </ul>
  </div>
);

const StudioSection = () => (
  <section id="studio" className="pm-section" aria-labelledby="pm-studio-title">
    <div className="pm-wrap">
      <Reveal>
        <p className="pm-kicker">Creator Studio</p>
        <h2 id="pm-studio-title" className="pm-h2">Eine Person festlegen. In jeder Szene wiedererkennen.</h2>
        <p className="pm-body pm-body--wide">
          Das Masterbild und ein Referenzpaket bestimmen, wie dein Creator aussieht. Jede neue Szene startet von dieser
          Identität und nicht bei null.
        </p>
      </Reveal>
      <Reveal className="pm-sheet-wrap">
        <ul className="pm-sheet">
          {CONTACT_SHEET.map((item, index) => (
            <li key={`${item.title}-${index}`} className="pm-sheet__item">
              <div className="pm-sheet__frame">
                <FrameStill tone={item.tone} crop={item.crop} reticle />
              </div>
              <span className="pm-sheet__label">{item.title}</span>
            </li>
          ))}
        </ul>
        <p className="pm-caption">Symbolische Darstellung: eine Identität, sechs Szenen. Echte Beispiele folgen mit den ersten Piloten.</p>
      </Reveal>
      <div className="pm-points">
        {STUDIO_POINTS.map((point, index) => (
          <Reveal key={point.label} delay={index * 0.08} className="pm-point">
            <p className="pm-label">{point.label}</p>
            <h3>{point.title}</h3>
            <p>{point.text}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const PipelineSection = () => (
  <section id="ablauf" className="pm-section pm-section--alt" aria-labelledby="pm-flow-title">
    <div className="pm-wrap">
      <Reveal>
        <p className="pm-kicker">Ablauf</p>
        <h2 id="pm-flow-title" className="pm-h2">Vom Steckbrief zum Reel. Fünf Schritte, ein Werkzeug.</h2>
      </Reveal>
      <Reveal>
        <ol className="pm-strip">
          {PIPELINE.map((step, index) => (
            <li key={step.title} className="pm-frame">
              <span className="pm-frame__no">{pad(index + 1)}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {step.paid ? <span className="pm-frame__paid">Mit Kostenvorschau</span> : null}
            </li>
          ))}
        </ol>
        <div className="pm-strip__rail" aria-hidden="true">
          <span>Kostenprüfung vor jedem bezahlten Auftrag</span>
        </div>
      </Reveal>
    </div>
  </section>
);

const ControlSection = () => (
  <section id="kontrolle" className="pm-section" aria-labelledby="pm-control-title">
    <div className="pm-wrap pm-control">
      <Reveal className="pm-control__lead">
        <p className="pm-kicker">Kontrolle</p>
        <h2 id="pm-control-title" className="pm-h2">Kontrolle ist Teil des Produkts.</h2>
        <p className="pm-body">
          KI-Produktion kostet Geld pro Auftrag. Creator Studio zeigt die Kosten vorher, setzt Grenzen und führt Protokoll.
          Das ist kein Zusatz, sondern der Grund, warum wir das Werkzeug gebaut haben.
        </p>
        <a className="pm-btn" href="#kontakt">Pilotzugang anfragen <ArrowRight size={18} aria-hidden="true" /></a>
      </Reveal>
      <Reveal className="pm-spec" delay={0.1}>
        <dl>
          {CONTROL_SPECS.map((spec) => (
            <div key={spec.key}>
              <dt>{spec.key}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  </section>
);

const ServicesSection = () => (
  <section id="leistungen" className="pm-section pm-section--alt" aria-labelledby="pm-services-title">
    <div className="pm-wrap pm-services">
      <Reveal className="pm-services__lead">
        <p className="pm-kicker">Leistungen</p>
        <h2 id="pm-services-title" className="pm-h2">Und für alles drumherum: Technik, die Anfragen bringt.</h2>
        <p className="pm-body">
          Neben dem eigenen Produkt bauen und betreuen wir Websites, Shops und Plattformen, mit Schwerpunkt auf technischer SEO und Sichtbarkeit.
        </p>
      </Reveal>
      <ul className="pm-rows">
        {SERVICES.map((service, index) => (
          <li key={service.title}>
            <Reveal delay={index * 0.05} className="pm-row">
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              {"href" in service && service.href ? (
                <Link to={service.href} className="pm-row__link">{service.hrefLabel} <ArrowRight size={15} aria-hidden="true" /></Link>
              ) : null}
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const IndustriesSection = () => (
  <section id="branchen" className="pm-section pm-industries" aria-labelledby="pm-industries-title">
    <div className="pm-wrap">
      <Reveal>
        <p className="pm-kicker">Branchen mit Regeln</p>
        <h2 id="pm-industries-title" className="pm-h2">Wo andere an Sperren scheitern, fangen wir an zu planen.</h2>
        <p className="pm-body pm-body--wide">
          CBD, legales Cannabis und Dating-Plattformen kämpfen mit Werbeverboten, Plattformregeln und abgelehnten Zahlungsanbietern.
          Dort liegt unser Schwerpunkt bei technischer Betreuung, SEO und Reichweite.
        </p>
      </Reveal>
      <div className="pm-dossiers">
        {INDUSTRIES.map((industry, index) => (
          <Reveal key={industry.title} delay={index * 0.08}>
            <article className="pm-dossier">
              <p className="pm-dossier__tag">{industry.tag}</p>
              <h3>{industry.title}</h3>
              <p>{industry.text}</p>
              <ul className="pm-chips">
                {industry.scope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
      <p className="pm-industries__note">{INDUSTRY_NOTE}</p>
    </div>
  </section>
);

const ProjectsSection = () => (
  <section id="projekte" className="pm-section pm-section--alt" aria-labelledby="pm-projects-title">
    <div className="pm-wrap">
      <Reveal>
        <p className="pm-kicker">Projekte</p>
        <h2 id="pm-projects-title" className="pm-h2">Ausgewählte Projekte.</h2>
      </Reveal>
      <ul className="pm-projects">
        {PROJECTS.map((project, index) => (
          <li key={project.name}>
            <Reveal delay={index * 0.06}>
              <a className="pm-project" href={project.href} target="_blank" rel="noopener noreferrer">
                <span className="pm-project__shot">
                  <img src={project.image} alt={`Startseite von ${project.name}`} loading="lazy" decoding="async" />
                </span>
                <span className="pm-project__meta">
                  <strong>{project.name}</strong>
                  <span>{project.kind}</span>
                  <em>{project.host} <ArrowUpRight size={14} aria-hidden="true" /></em>
                </span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const FounderSection = () => (
  <section className="pm-section" aria-labelledby="pm-founder-title">
    <div className="pm-wrap pm-founder">
      <Reveal className="pm-founder__photo">
        <img src={FOUNDER.image} alt={`${FOUNDER.name}, Gründer von Digital-Perfect`} loading="lazy" decoding="async" />
      </Reveal>
      <Reveal className="pm-founder__copy" delay={0.1}>
        <p className="pm-kicker">Wer dahintersteht</p>
        <h2 id="pm-founder-title" className="pm-h2 pm-h2--small">{FOUNDER.name}</h2>
        <p className="pm-label">{FOUNDER.role}</p>
        <p className="pm-body">{FOUNDER.text}</p>
      </Reveal>
    </div>
  </section>
);

// Anfrageformular der Premium-Startseite. Es schreibt dieselben Felder in dieselbe Tabelle (`leads`) wie das
// bestehende Kontaktformular, damit Admin-Bereich und Benachrichtigungen unverändert weiterlaufen.
const PremiumContact = () => {
  const { activeSiteId } = useSiteContext();
  const { toast } = useToast();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const [form, setForm] = useState({ name: "", email: "", company: "", service: "", description: "", privacy: false });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field: string, value: string | boolean) => setForm((previous) => ({ ...previous, [field]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    try {
      const { error } = await supabase.from("leads").insert({
        site_id: siteId,
        name: form.name,
        company: form.company || null,
        email: form.email,
        phone: null,
        service: form.service || null,
        budget: null,
        website: null,
        description: form.description || null,
      });
      if (error) throw error;
      setSent(true);
      toast({ title: "Anfrage gesendet", description: "Wir melden uns persönlich bei dir." });
    } catch (error) {
      console.error("Lead submit failed", error);
      toast({
        title: "Das hat nicht geklappt",
        description: "Deine Anfrage wurde nicht gesendet. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="kontakt" className="pm-section pm-contact" aria-labelledby="pm-contact-title">
      <div className="pm-wrap pm-contact__grid">
        <Reveal className="pm-contact__lead">
          <p className="pm-kicker">Dein nächster Schritt</p>
          <h2 id="pm-contact-title" className="pm-h2">Pilotzugang oder Projekt?</h2>
          <p className="pm-body">
            Sag kurz, worum es geht. Du bekommst eine persönliche Antwort mit einem klaren nächsten Schritt.
          </p>
          <ul className="pm-contact__facts">
            <li>Creator Studio ist in der Pilotphase, der Zugang läuft auf Anfrage.</li>
            <li>Für Projekte beginnen wir mit einem kostenlosen Erstgespräch.</li>
            <li>Keine Ranking-Garantien, keine Verkaufsmasche.</li>
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          {sent ? (
            <div className="pm-form pm-form--done" role="status">
              <CheckCircle2 size={44} aria-hidden="true" />
              <h3>Danke, die Anfrage ist angekommen.</h3>
              <p>Wir melden uns persönlich bei dir.</p>
            </div>
          ) : (
            <form className="pm-form" onSubmit={submit}>
              <div className="pm-form__two">
                <label>
                  <span>Name</span>
                  <input required autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </label>
                <label>
                  <span>E-Mail</span>
                  <input required type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </label>
              </div>
              <div className="pm-form__two">
                <label>
                  <span>Unternehmen (optional)</span>
                  <input autoComplete="organization" value={form.company} onChange={(e) => update("company", e.target.value)} />
                </label>
                <label>
                  <span>Worum geht es?</span>
                  <select value={form.service} onChange={(e) => update("service", e.target.value)}>
                    <option value="">Bitte wählen</option>
                    {INTEREST_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span>Deine Nachricht</span>
                <textarea required rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
              </label>
              <label className="pm-form__privacy">
                <input type="checkbox" required checked={form.privacy} onChange={(e) => update("privacy", e.target.checked)} />
                <span>
                  Ich bin mit den Datenschutzbestimmungen einverstanden und stimme der Verarbeitung meiner Angaben zur Kontaktaufnahme zu.{" "}
                  <Link to="/datenschutz">Datenschutz lesen</Link>
                </span>
              </label>
              <button className="pm-btn pm-btn--block" type="submit" disabled={sending}>
                {sending ? "Wird gesendet …" : "Anfrage senden"}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
};

const PremiumHome = () => {
  const { settings } = useGlobalTheme();
  const brand = settings.company_name || "Digital-Perfect";

  return (
    <div className="pm">
      <a className="pm-skip" href="#inhalt">Zum Inhalt springen</a>
      <PremiumNav brand={brand} />
      <PlayheadRail />
      <main id="inhalt">
        <Hero />
        <Ticker />
        <StudioSection />
        <PipelineSection />
        <ControlSection />
        <ServicesSection />
        <IndustriesSection />
        <ProjectsSection />
        <FounderSection />
        <PremiumContact />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
};

export default PremiumHome;
