import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Bot, Gauge, LayoutTemplate, Lock, ShieldCheck } from "lucide-react";
import { Decrypt, Depth, Reveal, useInViewOnce } from "./motion";
import { requestInterest } from "./AppShell";
import { AUDIT_LINES, DISCREET_NOTE, MORE_SERVICES, PILLARS } from "./content";

// Dienstleistungsteil (Webdesign, technische SEO, KI-Sichtbarkeit) als dunkle Konsole mit Terminal und drei Säulen.
// Ehrlich bleiben: keine Garantien, keine Rechtsberatung, kein Zahlungsdienstleister.

const PILLAR_ICONS = { WEB: LayoutTemplate, SEO: Gauge, GEO: Bot } as const;

// Terminal, das beim ersten Sichtbarwerden Zeile für Zeile tippt.
export const AuditTerminal = () => {
  const reduce = useReducedMotion();
  const [ref, seen] = useInViewOnce<HTMLDivElement>();
  const [count, setCount] = useState(reduce ? AUDIT_LINES.length : 0);

  useEffect(() => {
    if (reduce || !seen) return;
    if (count >= AUDIT_LINES.length) return;
    const timer = window.setTimeout(() => setCount((value) => value + 1), count === 0 ? 250 : 420);
    return () => window.clearTimeout(timer);
  }, [seen, count, reduce]);

  return (
    <div ref={ref} className="pm-term" role="img" aria-label="Beispielablauf eines technischen Audits: Crawling, Indexierung, Ladezeit, strukturierte Daten und KI-Antworten prüfen, danach ein Bericht mit konkreten Schritten.">
      <div className="pm-term__bar" aria-hidden="true">
        <i /><i /><i />
        <span>dp@audit: ~</span>
        <b><Lock size={11} /> TLS</b>
      </div>
      <pre className="pm-term__body" aria-hidden="true">
        {AUDIT_LINES.slice(0, count).map((line) => (
          <span key={line.text} className={`pm-term__line pm-term__line--${line.kind}`}>{line.text}</span>
        ))}
        <span className="pm-term__cursor" />
      </pre>
      <p className="pm-term__note">Beispielablauf eines technischen Audits. Ergebnis: konkrete Schritte, keine Garantien.</p>
    </div>
  );
};

export const PillarCards = () => (
  <ul className="pm-mods">
    {PILLARS.map((pillar, index) => {
      const Icon = PILLAR_ICONS[pillar.code];
      return (
        <li key={pillar.title}>
          <Depth delay={index * 0.07}>
            <Link to={pillar.href} className="pm-mod">
              <div className="pm-mod__top">
                <span className="pm-mod__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.7} /></span>
                <span className="pm-mod__code" aria-hidden="true">{`0${index + 1} · ${pillar.code}`}</span>
              </div>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
              <span className="pm-mod__link">{pillar.cta} <ArrowRight size={15} aria-hidden="true" /></span>
            </Link>
          </Depth>
        </li>
      );
    })}
  </ul>
);

export const DiscreetNote = () => (
  <Reveal className="pm-discreet">
    <ShieldCheck size={20} aria-hidden="true" />
    <p>{DISCREET_NOTE}</p>
  </Reveal>
);

export const OpsServices = () => (
  <section id="leistungen" className="pm-section pm-ops" aria-labelledby="pm-services-title">
    <div className="pm-ops__bg" aria-hidden="true" />
    <div className="pm-wrap">
      <div className="pm-ops__head">
        <Reveal className="pm-ops__lead">
          <p className="pm-kicker">Unsere Leistungen für Unternehmen</p>
          <Decrypt as="h2" className="pm-h2" text="Gefunden werden. Von Menschen, Google und KI." />
          <p className="pm-body">
            Digital-Perfect ist auch Agentur. Wir gestalten und bauen Websites, die schnell laden, bei Google gefunden werden und
            in den Antworten von ChatGPT, Perplexity und Googles KI auftauchen. Du bekommst klare Schritte und ehrliche Zahlen
            statt großer Versprechen.
          </p>
          <ul className="pm-ops__more">
            {MORE_SERVICES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="pm-cta">
            <a className="pm-btn" href="#kontakt" onClick={() => requestInterest("Webdesign oder Webentwicklung")}>
              Projekt anfragen <ArrowRight size={18} aria-hidden="true" />
            </a>
            <Link className="pm-btn pm-btn--ghost" to="/leistungen">Alle Leistungen</Link>
          </div>
        </Reveal>
        <Depth delay={0.1}>
          <AuditTerminal />
        </Depth>
      </div>
      <PillarCards />
      <DiscreetNote />
    </div>
  </section>
);
