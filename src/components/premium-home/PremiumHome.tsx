import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { FilmStage, useMinWidth } from "./media";
import { Depth, Reveal } from "./motion";
import { OpsServices } from "./OpsSection";
import { PricingSection, usePricing } from "./Pricing";
import { StudioSteps } from "./StudioSteps";
import { CreatorGallery, FreeWorlds } from "./Showcase";
import { requestInterest } from "./AppShell";
import { PremiumContact, PremiumShell } from "./Shell";
import { AI_NOTE, COST_BAND, COST_POINTS, FOUNDER, HERO_TALL, HERO_WIDE, MODEL_FAMILIES, PROJECTS } from "./content";

const QUICK = ["Creator erstellen", "Bilder und Videos machen", "Schneiden, planen, posten"] as const;

// Hero: Filme füllen den ganzen Bildschirm (am Rechner Querformat, am Telefon Hochformat), blenden ineinander über
// und laufen endlos. Beim Scrollen zieht sich die Filmfläche wie ein Fenster zurück, der Text fährt nach oben weg.
const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const wide = useMinWidth(900);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const radius = useTransform(scrollYProgress, [0, 0.6], [0, 40]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyFade = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section ref={ref} className="pv-hero" aria-labelledby="pm-h1">
      <motion.div className="pv-hero__film" style={reduce ? undefined : { scale, borderRadius: radius }}>
        <FilmStage key={wide ? "wide" : "tall"} films={wide ? HERO_WIDE : HERO_TALL} note={AI_NOTE} />
      </motion.div>
      <motion.div className="pm-wrap pv-hero__copy" style={reduce ? undefined : { y: copyY, opacity: copyFade }}>
        <p className="pm-eyebrow">Creator Studio von Digital-Perfect</p>
        <h1 id="pm-h1" className="pm-h1 pv-h1">
          <span className="pm-line"><span>Dein eigener</span></span>
          <span className="pm-line"><span>KI-Creator.</span></span>
          <span className="pm-line pm-line--accent"><span>Bilder, Videos, Posts</span></span>
        </h1>
        <p className="pm-lead">
          Erfinde eine Person und mach mit ihr so viele Bilder und Videos, wie du willst. Feste Referenzbilder halten sie von Szene zu Szene wiedererkennbar.{" "}
          <span className="pv-lead__more">
            Dazu freie Videos ganz ohne Person, ein Schnittprogramm und ein Kalender für deine Beiträge. Alles in einem Werkzeug im
            Browser.
          </span>
        </p>
        <div className="pm-cta">
          <a className="pm-btn" href="#kontakt" onClick={() => requestInterest("Creator Studio: Pilotzugang")}>
            Pilotzugang anfragen <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="pm-btn pm-btn--ghost" href="#creator">Beispiele ansehen</a>
        </div>
        <ol className="pv-quick" aria-label="So läuft es ab">
          {QUICK.map((item, index) => (
            <li key={item}><b>{index + 1}</b>{item}</li>
          ))}
        </ol>
      </motion.div>
    </section>
  );
};

const Ticker = () => (
  <div className="pm-ticker" role="group" aria-label="Über die Higgsfield-API angebundene Modelle">
    <span className="pm-ticker__label">KI-Modelle im Studio</span>
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

// Kosten, ruhig und hell erklärt: drei Voreinstellungen und vier einfache Zusagen.
// Preise: Gibt das Studio eine gültige Preisliste aus, zeigt die Seite Tarife, Guthaben und Beispielpreise von dort. Sonst bleibt der
// bisherige Abschnitt stehen, der beschreibt, wie das Studio heute abrechnet. Solange die Antwort aussteht, hält der Abschnitt nur seinen Platz.
export const CostSection = () => {
  const state = usePricing();
  if (state.status === "ready") return <PricingSection pricing={state.pricing} planned={state.planned} />;
  if (state.status === "pending") return <section id="kosten" className="pm-section pm-light pm-cost pv-pricing--pending" aria-hidden="true" />;
  return <CurrentCost />;
};

const CurrentCost = () => (
  <section id="kosten" className="pm-section pm-light pm-cost" aria-labelledby="pm-cost-title">
    <div className="pm-wrap">
      <div className="pm-cost__head">
        <Reveal>
          <p className="pm-kicker">Kosten im Blick</p>
          <h2 id="pm-cost-title" className="pm-h2">Du siehst den Preis, bevor du auf Start drückst.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="pm-body">
            KI-Bilder und -Videos kosten pro Auftrag. Damit daraus keine Überraschung wird, zeigt dir das Studio jeden Betrag
            vorher und hält sich an die Grenzen, die du festlegst.
          </p>
        </Reveal>
      </div>
      <div className="pm-cost__figures">
        {COST_BAND.map((item, index) => (
          <Depth key={item.label} delay={index * 0.08} className="pm-figure">
            <p className="pm-figure__value">{item.value}</p>
            <p className="pm-figure__label">{item.label}</p>
            <p className="pm-figure__note">{item.note}</p>
          </Depth>
        ))}
      </div>
      <ul className="pm-cost__points">
        {COST_POINTS.map((point, index) => (
          <li key={point.title}>
            <Reveal delay={(index % 2) * 0.06} className="pm-tile">
              <span className="pm-tile__check" aria-hidden="true"><Check size={15} /></span>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export const ProjectsSection = ({ more = true }: { more?: boolean }) => (
  <section id="projekte" className="pm-section pm-light" aria-labelledby="pm-projects-title">
    <div className="pm-wrap">
      <div className="pv-head">
        <Reveal>
          <p className="pm-kicker">Projekte</p>
          <h2 id="pm-projects-title" className="pm-h2">Websites, die wir gebaut haben.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="pm-body">Vier Projekte, die online sind. Jedes kannst du selbst ansehen.</p>
          {more ? <Link className="pm-textlink" to="/projekte">Alle Projekte im Detail <ArrowRight size={16} aria-hidden="true" /></Link> : null}
        </Reveal>
      </div>
      <ul className="pm-projects">
        {PROJECTS.map((project, index) => (
          <li key={project.name}>
            <Depth delay={index * 0.07}>
              <a className="pm-project" href={project.href} target="_blank" rel="noopener noreferrer">
                <span className="pm-project__chrome" aria-hidden="true"><i /><i /><i /><b>{project.host}</b></span>
                <span className="pm-project__shot">
                  <img src={project.image} alt={`Startseite von ${project.name}`} loading="lazy" decoding="async" />
                </span>
                <span className="pm-project__meta">
                  <strong>{project.name}</strong>
                  <span>{project.kind}</span>
                  <em>{project.host} <ArrowUpRight size={14} aria-hidden="true" /></em>
                </span>
              </a>
            </Depth>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export const FounderSection = () => (
  <section className="pm-section pv-founder" aria-labelledby="pm-founder-title">
    <div className="pm-wrap pm-founder">
      <Depth className="pm-founder__photo">
        <img src={FOUNDER.image} alt={`${FOUNDER.name}, Gründer von Digital-Perfect`} loading="lazy" decoding="async" />
      </Depth>
      <Reveal className="pm-founder__copy" delay={0.1}>
        <p className="pm-kicker">Wer dahintersteht</p>
        <h2 id="pm-founder-title" className="pm-h2 pm-h2--small">{FOUNDER.name}</h2>
        <p className="pm-label">{FOUNDER.role}</p>
        <p className="pm-body">{FOUNDER.text}</p>
      </Reveal>
    </div>
  </section>
);

const PremiumHome = () => (
  <PremiumShell>
    <Hero />
    <Ticker />
    <StudioSteps />
    <CreatorGallery />
    <FreeWorlds />
    <CostSection />
    <OpsServices />
    <ProjectsSection />
    <FounderSection />
    <PremiumContact />
  </PremiumShell>
);

export default PremiumHome;
