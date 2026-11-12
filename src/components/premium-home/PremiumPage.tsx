import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ChevronDown, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { Depth, Reveal } from "./motion";
import { AuditTerminal, DiscreetNote, PillarCards } from "./OpsSection";
import { Clip } from "./media";
import { requestInterest } from "./AppShell";
import { PremiumContact, PremiumShell } from "./Shell";
import { CostSection } from "./PremiumHome";
import { StudioSteps } from "./StudioSteps";
import { CreatorGallery, FreeWorlds } from "./Showcase";
import { AI_NOTE, CREATORS, FOUNDER, PROJECTS } from "./content";
import type { PremiumPageData } from "./pages";

const pad = (value: number) => String(value).padStart(2, "0");
const ORG = { "@type": "Organization", name: "Digital-Perfect", url: "https://digital-perfect.com" };

// Telefonrahmen im Kopf der Creator-Studio-Seite: die Videos von Maria und Laura laufen nacheinander.
const PHONE_SCENES = [...CREATORS[0].scenes, ...CREATORS[1].scenes].filter((item) => item.kind === "video");
const ScenePhone = () => {
  const [index, setIndex] = useState(0);
  const item = PHONE_SCENES[index];
  return (
    <figure className="pv-phone">
      <div className="pv-phone__screen">
        <Clip key={item.id} src={item.src} poster={item.poster} label={item.title} eager loop={false} onEnded={() => setIndex((value) => (value + 1) % PHONE_SCENES.length)} />
      </div>
      <figcaption>
        <strong>{item.title}</strong>
        <span>{AI_NOTE}</span>
      </figcaption>
    </figure>
  );
};

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

// Wer antwortet: der Gründer mit Bild (Kontakt).
const PersonVisual = () => (
  <figure className="pv-person">
    <img src={FOUNDER.image} alt={`${FOUNDER.name}, Gründer von Digital-Perfect`} loading="eager" decoding="async" />
    <figcaption>
      <strong>{FOUNDER.name}</strong>
      <span>{FOUNDER.role}</span>
      <em>Antwortet auf jede Anfrage selbst.</em>
    </figcaption>
  </figure>
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

// Kopf aller Unterseiten: Brotkrumen, Überschrift, Einleitung, Knöpfe und rechts ein Bild zum Thema.
const SubHero = ({
  crumb,
  kicker,
  lines,
  lead,
  visual,
  children,
  modifier,
}: {
  crumb: string;
  kicker: string;
  lines: string[];
  lead: string;
  visual?: ReactNode;
  children?: ReactNode;
  modifier?: string;
}) => (
  <section className={`pm-sub${modifier ? ` pm-sub--${modifier}` : ""}${visual ? "" : " pv-sub--plain"}`} aria-labelledby="pm-h1">
    <div className="pm-sub__bg" aria-hidden="true" />
    <div className="pm-wrap pm-sub__grid">
      <div className="pm-sub__copy">
        <nav className="pm-crumb" aria-label="Brotkrumen">
          <Link to="/">Start</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{crumb}</span>
        </nav>
        <p className="pm-eyebrow">{kicker}</p>
        <h1 id="pm-h1" className="pm-h1 pm-h1--sub">
          {lines.map((line, index) => (
            <span key={line} className={`pm-line${index === lines.length - 1 && lines.length > 1 ? " pm-line--accent" : ""}`}><span>{line}</span></span>
          ))}
        </h1>
        <p className="pm-lead">{lead}</p>
        {children}
      </div>
      {visual ? <Depth className="pm-sub__visual">{visual}</Depth> : null}
    </div>
  </section>
);

const PremiumPage = ({ page }: { page: PremiumPageData }) => {
  const isStudio = page.slug === "creator-studio";
  const name = page.kicker.split(" · ")[0];
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
      name: isStudio ? "Creator Studio" : name,
      description: page.seoDescription,
      provider: ORG,
      ...(isStudio ? { applicationCategory: "MultimediaApplication", operatingSystem: "Web" } : { areaServed: "AT" }),
    },
  ];

  const visual =
    page.visual === "reel" ? <ScenePhone /> : page.visual === "terminal" ? <AuditTerminal /> : page.visual === "cards" ? <CardsVisual /> : <AnswerVisual />;

  return (
    <PremiumShell>
      <SEO title={page.seoTitle} description={page.seoDescription} structuredData={structuredData} />
      <SubHero crumb={name} kicker={page.kicker} lines={page.h1} lead={page.lead} visual={visual} modifier={page.visual}>
        <div className="pm-cta">
          <a className="pm-btn" href="#kontakt" onClick={() => requestInterest(page.interest)}>
            {page.cta} <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="pm-btn pm-btn--ghost" href="#mehr">Mehr erfahren</a>
        </div>
      </SubHero>

      {isStudio ? <StudioSteps id="mehr" /> : null}
      {isStudio ? <CreatorGallery /> : null}
      {isStudio ? <FreeWorlds /> : null}

      {isStudio ? <CostSection /> : null}

      <section id={isStudio ? "funktionen" : "mehr"} className={isStudio ? "pm-section pm-ops pv-dark-tiles" : "pm-section pm-light"} aria-labelledby="pm-intro-title">
        {isStudio ? <div className="pm-ops__bg" aria-hidden="true" /> : null}
        <div className="pm-wrap">
          <div className="pv-head">
            <Reveal>
              <p className="pm-kicker">{isStudio ? "Funktionen" : "Leistung"}</p>
              <h2 id="pm-intro-title" className="pm-h2">{page.introTitle}</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="pm-body">{page.introText}</p>
            </Reveal>
          </div>
          <ul className={`pm-tiles${page.tiles.length > 6 ? " pm-tiles--four" : ""}`}>
            {page.tiles.map((tile, index) => (
              <li key={tile.title}>
                <Depth delay={(index % 3) * 0.06} className="pm-tile">
                  <span className="pm-tile__no" aria-hidden="true">{pad(index + 1)}</span>
                  <h3>{tile.title}</h3>
                  <p>{tile.text}</p>
                </Depth>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {page.steps.length ? (
        <section className="pm-section pv-flow" aria-labelledby="pm-steps-title">
          <div className="pm-wrap">
            <Reveal>
              <p className="pm-kicker">Ablauf</p>
              <h2 id="pm-steps-title" className="pm-h2">{page.stepsTitle}</h2>
            </Reveal>
            <ol className="pm-flow">
              {page.steps.map((step, index) => (
                <li key={step.title}>
                  <Depth delay={index * 0.07} className="pm-flow__item">
                    <span className="pm-flow__no" aria-hidden="true">{pad(index + 1)}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </Depth>
                </li>
              ))}
            </ol>
            {page.discreet ? <DiscreetNote /> : null}
          </div>
        </section>
      ) : null}

      <Faq title={page.faqTitle} items={page.faq} />

      {isStudio ? null : (
        <section className="pm-section pm-ops" aria-label="Weitere Leistungen">
          <div className="pm-ops__bg" aria-hidden="true" />
          <div className="pm-wrap">
            <Reveal>
              <p className="pm-kicker">{page.slug === "leistungen" ? "Im Detail" : "Gehört zusammen"}</p>
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

// „Projekte“: die vier Websites, die online sind, jede groß mit Bild, kurzer Beschreibung und Link.
export const ProjectsPage = () => (
  <PremiumShell>
    <SEO
      title="Projekte: Websites und Portale von Digital-Perfect"
      description="Ausgewählte Projekte von Digital-Perfect: Vergleichsportale, ein Magazin und ein SEO-Projekt. Alle online und zum Ansehen verlinkt."
    />
    <SubHero
      crumb="Projekte"
      kicker="Vier Projekte · alle online"
      lines={["Websites, die", "online sind"]}
      lead="Keine Entwürfe, keine Mockups. Diese vier Projekte haben wir gebaut oder betreuen sie, und du kannst jedes selbst ansehen."
      visual={<CardsVisual />}
      modifier="cards"
    />
    <section id="mehr" className="pm-section pm-light" aria-label="Projekte">
      <div className="pm-wrap">
        <ol className="pv-cases">
          {PROJECTS.map((project, index) => (
            <li key={project.name} className="pv-case">
              <Depth className="pv-case__shot">
                <a className="pm-project" href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} öffnen`}>
                  <span className="pm-project__chrome" aria-hidden="true"><i /><i /><i /><b>{project.host}</b></span>
                  <span className="pm-project__shot">
                    <img src={project.image} alt={`Startseite von ${project.name}`} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
                  </span>
                </a>
              </Depth>
              <Reveal className="pv-case__copy" delay={0.08}>
                <p className="pm-kicker">{`${pad(index + 1)} · ${project.kind}`}</p>
                <h2 className="pm-h3">{project.name}</h2>
                <p className="pm-body">{project.text}</p>
                <a className="pm-textlink" href={project.href} target="_blank" rel="noopener noreferrer">
                  {project.host} ansehen <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
    <section className="pm-section pm-ops" aria-label="Leistungen">
      <div className="pm-ops__bg" aria-hidden="true" />
      <div className="pm-wrap">
        <Reveal>
          <p className="pm-kicker">Was wir dafür tun</p>
          <h2 className="pm-h2">Web, SEO und KI-Sichtbarkeit aus einer Hand.</h2>
        </Reveal>
        <PillarCards />
      </div>
    </section>
    <PremiumContact title="Dein Projekt als Nächstes?" interest="Webdesign oder Webentwicklung" />
  </PremiumShell>
);

// „Kontakt“: das Anfrageformular steht ganz oben, darunter, wer antwortet.
export const ContactPage = () => (
  <PremiumShell>
    <SEO
      title="Kontakt: Anfrage an Digital-Perfect"
      description="Schreib Digital-Perfect: Pilotzugang zu Creator Studio, Website, SEO oder KI-Sichtbarkeit. Du bekommst eine persönliche Antwort vom Gründer."
    />
    <SubHero
      crumb="Kontakt"
      kicker="Direkt zum Gründer"
      lines={["Schreib uns.", "Wir antworten", "noch selbst"]}
      lead="Ob Pilotzugang zu Creator Studio oder ein Projekt für dein Unternehmen: Ein paar Sätze reichen. Markus Schulz liest jede Anfrage selbst."
      visual={<PersonVisual />}
      modifier="contact"
    />
    <PremiumContact title="Worum geht es?" />
  </PremiumShell>
);

export default PremiumPage;
