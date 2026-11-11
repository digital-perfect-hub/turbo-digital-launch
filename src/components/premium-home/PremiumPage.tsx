import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { Reveal } from "./motion";
import { AuditTerminal, DiscreetNote, PillarCards } from "./OpsSection";
import { ReelPlayer } from "./Reel";
import { requestInterest } from "./AppShell";
import { PremiumContact, PremiumShell } from "./Shell";
import { CostSection, JourneySection, SheetSection } from "./PremiumHome";
import { PROJECTS } from "./content";
import type { PremiumPageData } from "./pages";

const pad = (value: number) => String(value).padStart(2, "0");

// Drei Projekt-Screenshots als schwebender Fächer (Webdesign).
const CardsVisual = () => (
  <div className="pm-fan" aria-hidden="true">
    {PROJECTS.slice(0, 3).map((project, index) => (
      <figure key={project.name} className={`pm-fan__card pm-fan__card--${index + 1}`}>
        <span className="pm-project__chrome"><i /><i /><i /><b>{project.host}</b></span>
        <img src={project.image} alt="" loading={index === 0 ? "eager" : "lazy"} decoding="async" />
      </figure>
    ))}
  </div>
);

// Nachgestellte KI-Antwort (KI-Sichtbarkeit): Frage, Antwortzeilen, hervorgehobene Nennung. Reine Illustration.
const AnswerVisual = () => (
  <div className="pm-answer" role="img" aria-label="Illustration: Eine KI-Antwort nennt ein Unternehmen als Empfehlung.">
    <div className="pm-answer__q" aria-hidden="true">
      <span>Du</span>
      <p>Wer kann mir bei meinem Vorhaben in Linz weiterhelfen?</p>
    </div>
    <div className="pm-answer__a" aria-hidden="true">
      <span><Sparkles size={13} /> KI-Assistent</span>
      <i style={{ width: "92%" }} />
      <i style={{ width: "78%" }} />
      <p>
        Eine passende Adresse ist <mark>dein Unternehmen</mark>
        <sup>1</sup>
      </p>
      <i style={{ width: "64%" }} />
      <div className="pm-answer__src">
        <b>1</b> deine-website.at
      </div>
    </div>
    <p className="pm-answer__note">Illustration. KI-Antworten lassen sich nicht garantieren.</p>
  </div>
);

const Faq = ({ title, items }: { title: string; items: PremiumPageData["faq"] }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="pm-section pm-light" aria-labelledby="pm-faq-title">
      <div className="pm-wrap pm-faq">
        <Reveal>
          <p className="pm-kicker">Fragen & Antworten</p>
          <h2 id="pm-faq-title" className="pm-h2">{title}</h2>
        </Reveal>
        <div className="pm-faq__list">
          {items.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q} className={`pm-faq__item${isOpen ? " is-open" : ""}`}>
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`pm-faq-${index}`} onClick={() => setOpen(isOpen ? null : index)}>
                    <span>{item.q}</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </button>
                </h3>
                {/* Antwort bleibt im DOM (für Suchmaschinen und KI lesbar), wird nur ein- und ausgeklappt. */}
                <div id={`pm-faq-${index}`} className="pm-faq__answer" role="region" aria-hidden={!isOpen}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const PremiumPage = ({ page }: { page: PremiumPageData }) => {
  const isStudio = page.slug === "creator-studio";
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": isStudio ? "SoftwareApplication" : "Service",
      name: isStudio ? "Creator Studio" : page.kicker.split(" · ")[0],
      description: page.seoDescription,
      provider: { "@type": "Organization", name: "Digital-Perfect", url: "https://digital-perfect.com" },
      ...(isStudio ? { applicationCategory: "MultimediaApplication", operatingSystem: "Web" } : { areaServed: "AT" }),
    },
  ];

  return (
    <PremiumShell>
      <SEO title={page.seoTitle} description={page.seoDescription} structuredData={structuredData} />
      <section className={`pm-sub pm-sub--${page.visual}`} aria-labelledby="pm-h1">
        <div className="pm-sub__bg" aria-hidden="true" />
        <div className="pm-wrap pm-sub__grid">
          <div className="pm-sub__copy">
            <nav className="pm-crumb" aria-label="Brotkrumen">
              <Link to="/">Start</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{page.kicker.split(" · ")[0]}</span>
            </nav>
            <p className="pm-eyebrow">{page.kicker}</p>
            <h1 id="pm-h1" className="pm-h1 pm-h1--sub">
              {page.h1.map((line, index) => (
                <span key={line} className={`pm-line${index === page.h1.length - 1 ? " pm-line--accent" : ""}`}><span>{line}</span></span>
              ))}
            </h1>
            <p className="pm-lead">{page.lead}</p>
            <div className="pm-cta">
              <a className="pm-btn" href="#kontakt" onClick={() => requestInterest(page.interest)}>
                {page.cta} <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="pm-btn pm-btn--ghost" href="#mehr">Mehr erfahren</a>
            </div>
          </div>
          <div className="pm-sub__visual">
            {page.visual === "reel" ? <div className="pm-sub__reel"><ReelPlayer /></div> : null}
            {page.visual === "terminal" ? <AuditTerminal /> : null}
            {page.visual === "cards" ? <CardsVisual /> : null}
            {page.visual === "answer" ? <AnswerVisual /> : null}
          </div>
        </div>
      </section>

      {isStudio ? <JourneySection id="mehr" /> : null}
      {isStudio ? <SheetSection /> : null}

      <section id={isStudio ? "funktionen" : "mehr"} className={`pm-section${isStudio ? " pm-light" : " pm-light"}`} aria-labelledby="pm-intro-title">
        <div className="pm-wrap">
          <Reveal>
            <p className="pm-kicker">{isStudio ? "Funktionen" : "Leistung"}</p>
            <h2 id="pm-intro-title" className="pm-h2">{page.introTitle}</h2>
            <p className="pm-body pm-body--wide">{page.introText}</p>
          </Reveal>
          <ul className={`pm-tiles${page.tiles.length > 6 ? " pm-tiles--four" : ""}`}>
            {page.tiles.map((tile, index) => (
              <li key={tile.title}>
                <Reveal delay={(index % 3) * 0.06} className="pm-tile">
                  <span className="pm-tile__no" aria-hidden="true">{pad(index + 1)}</span>
                  <h3>{tile.title}</h3>
                  <p>{tile.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {isStudio ? <CostSection /> : null}

      {page.steps.length ? (
        <section className="pm-section" aria-labelledby="pm-steps-title">
          <div className="pm-wrap">
            <Reveal>
              <p className="pm-kicker">Ablauf</p>
              <h2 id="pm-steps-title" className="pm-h2">{page.stepsTitle}</h2>
            </Reveal>
            <ol className="pm-flow">
              {page.steps.map((step, index) => (
                <li key={step.title}>
                  <Reveal delay={index * 0.07} className="pm-flow__item">
                    <span className="pm-flow__no" aria-hidden="true">{pad(index + 1)}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
            {page.slug === "webdesign" ? <DiscreetNote /> : null}
          </div>
        </section>
      ) : null}

      <Faq title={page.faqTitle} items={page.faq} />

      {isStudio ? null : (
        <section className="pm-section pm-ops" aria-label="Weitere Leistungen">
          <div className="pm-ops__bg" aria-hidden="true" />
          <div className="pm-wrap">
            <Reveal>
              <p className="pm-kicker">Gehört zusammen</p>
              <h2 className="pm-h2">Web, SEO und KI-Sichtbarkeit aus einer Hand.</h2>
            </Reveal>
            <PillarCards />
          </div>
        </section>
      )}

      <PremiumContact title={page.contactTitle} interest={page.interest} />
    </PremiumShell>
  );
};

export default PremiumPage;
