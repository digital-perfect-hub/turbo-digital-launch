import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import StudioMonitor from "./StudioMonitor";
import { HeroFilm, LazyClip, ReelPlayer, useMinWidth } from "./Reel";
import { Reveal, useInViewOnce } from "./motion";
import { OpsServices } from "./OpsSection";
import { requestInterest } from "./AppShell";
import { PremiumContact, PremiumShell } from "./Shell";
import {
  CONTACT_SHEET,
  COST_BAND,
  COST_POINTS,
  FOUNDER,
  JOURNEY,
  MODEL_FAMILIES,
  PROJECTS,
  SHEET_CAPTION,
  STUDIO_POINTS,
} from "./content";

const pad = (value: number) => String(value).padStart(2, "0");

// Hero: auf dem Telefon füllt das Showreel (vier Hochformat-Szenen im Wechsel) den ganzen Bildschirm, am Rechner
// füllen 16:9-Filme den Hero und der Text liegt links darüber. Die Videos laufen endlos.
const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const desktop = useMinWidth(1024);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);
  const move = desktop && !reduce;

  return (
    <section ref={ref} className={`pm-hero${desktop ? " pm-hero--film" : ""}`} aria-labelledby="pm-h1">
      <div className="pm-hero__bg" aria-hidden="true">
        <span className="pm-hero__glow" />
        <span className="pm-hero__grid" />
      </div>
      {desktop ? <HeroFilm /> : null}
      <div className="pm-wrap pm-hero__grid-layout">
        <motion.div className="pm-hero__copy" style={move ? { y: copyY, opacity: fade } : undefined}>
          <p className="pm-eyebrow">Creator Studio von Digital-Perfect</p>
          <h1 id="pm-h1" className="pm-h1">
            <span className="pm-line"><span>Ein Gesicht.</span></span>
            <span className="pm-line"><span>Jede Szene.</span></span>
            <span className="pm-line pm-line--accent"><span>Fertig zum Posten.</span></span>
          </h1>
          <p className="pm-lead">
            Erschaffe eine KI-Persönlichkeit, die auf jedem Bild und in jedem Video dieselbe bleibt.{" "}
            <span className="pm-lead__more">Bilder, Szenen, Videos, Schnitt und Planung in einem Werkzeug, ohne Vorkenntnisse.</span>
          </p>
          <div className="pm-cta">
            <a className="pm-btn" href="#kontakt" onClick={() => requestInterest("Creator Studio: Pilotzugang")}>
              Pilotzugang anfragen <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="pm-btn pm-btn--ghost" href="#studio">So funktioniert es</a>
          </div>
          <p className="pm-note">Pilotphase: Zugang auf Anfrage, mit persönlicher Einführung.</p>
        </motion.div>
        {desktop ? null : (
          <div className="pm-hero__stage">
            <ReelPlayer />
          </div>
        )}
      </div>
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

// Der Weg in sieben Schritten: links die Schritte (laufen von selbst weiter, anklickbar), rechts das Bild dazu.
export const JourneySection = ({ id = "studio" }: { id?: string }) => {
  const reduce = useReducedMotion();
  const [ref, seen] = useInViewOnce<HTMLDivElement>("0px 0px -30% 0px");
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!seen || !auto || reduce) return;
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % JOURNEY.length), 4200);
    return () => window.clearTimeout(timer);
  }, [seen, auto, active, reduce]);

  const pick = (index: number) => {
    setAuto(false);
    setActive(index);
  };

  return (
    <section id={id} className="pm-section pm-light" aria-labelledby="pm-journey-title">
      <div className="pm-wrap">
        <Reveal>
          <p className="pm-kicker">So funktioniert Creator Studio</p>
          <h2 id="pm-journey-title" className="pm-h2">Von der Idee zum fertigen Post. In sieben Schritten.</h2>
          <p className="pm-body pm-body--wide">
            Du brauchst kein Technikwissen. Du legst einmal fest, wer deine Creatorin ist, und das Studio führt dich Schritt für
            Schritt bis zum fertigen Video.
          </p>
        </Reveal>
        <div className="pm-journey" ref={ref}>
          <ol className="pm-journey__steps">
            {JOURNEY.map((step, index) => (
              <li key={step.title}>
                <button
                  type="button"
                  className={`pm-step${index === active ? " is-active" : ""}${index < active ? " is-done" : ""}`}
                  aria-current={index === active ? "step" : undefined}
                  onClick={() => pick(index)}
                >
                  <span className="pm-step__no">{index < active ? <Check size={14} aria-hidden="true" /> : pad(index + 1)}</span>
                  <span className="pm-step__body">
                    <strong>{step.title}</strong>
                    <span>{step.text}</span>
                  </span>
                  {index === active && auto && !reduce ? <i className="pm-step__timer" key={`t-${active}`} aria-hidden="true" /> : null}
                </button>
              </li>
            ))}
          </ol>
          <div className="pm-journey__stage" aria-hidden="true">
            {JOURNEY.map((step, index) => (
              <figure key={step.title} className={`pm-journey__shot${index === active ? " is-active" : ""}`}>
                <img src={step.image} alt="" width={720} height={1280} loading="lazy" decoding="async" />
                <figcaption>
                  <b>{`${pad(index + 1)} / ${pad(JOURNEY.length)}`}</b>
                  <span>{step.tag}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <p className="pm-caption">Bilder: echte Szenen der fiktiven KI-Figur Maria Noelle, erzeugt in Creator Studio.</p>
      </div>
    </section>
  );
};

export const SheetSection = () => (
  <section className="pm-section" aria-labelledby="pm-sheet-title">
    <div className="pm-wrap">
      <Reveal>
        <p className="pm-kicker">Wiedererkennbar</p>
        <h2 id="pm-sheet-title" className="pm-h2">Eine Person. Egal, wo die Szene spielt.</h2>
        <p className="pm-body pm-body--wide">
          Masterbild und Referenzpaket bestimmen, wie deine Creatorin aussieht. Jede neue Szene startet von dieser Identität und
          nicht bei null.
        </p>
      </Reveal>
      <Reveal className="pm-sheet-wrap">
        <ul className="pm-sheet">
          {CONTACT_SHEET.map((item) => (
            <li key={item.title} className="pm-sheet__item">
              <div className="pm-sheet__frame">
                {item.kind === "video" ? (
                  <LazyClip src={item.src} poster={item.poster} label={`Maria Noelle, Szene ${item.title}`} />
                ) : (
                  <img src={item.poster} alt={`Maria Noelle, ${item.title}`} width={720} height={1280} loading="lazy" decoding="async" />
                )}
              </div>
              <span className="pm-sheet__label">{item.title}</span>
              <span className="pm-sheet__meta">{item.meta}</span>
            </li>
          ))}
        </ul>
        <p className="pm-caption">{SHEET_CAPTION}</p>
      </Reveal>
      <Reveal className="pm-ui">
        <div className="pm-ui__lead">
          <p className="pm-kicker">Die Oberfläche</p>
          <h3 className="pm-h3">Alles an einem Ort.</h3>
          <p className="pm-body">
            Creator, Szenen, Kosten und Planung liegen in einer Oberfläche. Sie zeigt dir immer den nächsten Schritt, damit du
            auch ohne Erfahrung sofort loslegen kannst.
          </p>
          <Link className="pm-textlink" to="/creator-studio">Alle Funktionen ansehen <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <StudioMonitor />
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

// Kosten, ruhig und hell erklärt: drei Voreinstellungen und vier einfache Zusagen.
export const CostSection = () => (
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
          <Reveal key={item.label} delay={index * 0.08} className="pm-figure">
            <p className="pm-figure__value">{item.value}</p>
            <p className="pm-figure__label">{item.label}</p>
            <p className="pm-figure__note">{item.note}</p>
          </Reveal>
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

export const ProjectsSection = () => (
  <section id="projekte" className="pm-section pm-light" aria-labelledby="pm-projects-title">
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
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export const FounderSection = () => (
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

const PremiumHome = () => (
  <PremiumShell>
    <Hero />
    <Ticker />
    <JourneySection />
    <SheetSection />
    <CostSection />
    <OpsServices />
    <ProjectsSection />
    <FounderSection />
    <PremiumContact />
  </PremiumShell>
);

export default PremiumHome;
