import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Code2, CreditCard, LifeBuoy, Lock, Search, TrendingUp, Workflow } from "lucide-react";
import { Decrypt, Reveal, useInViewOnce } from "./motion";
import { requestInterest } from "./AppShell";
import { AUDIT_LINES, INDUSTRIES, INDUSTRY_NOTE, SERVICES } from "./content";

// Dienstleistungsteil (Webentwicklung, SEO, High-Risk) als dunkle "Ops-Konsole": Terminal, Module, Dossiers.
// Inhaltlich unverändert ehrlich: keine Garantien, keine Rechtsberatung, kein Zahlungsdienstleister.

const SERVICE_ICONS = {
  search: Search,
  growth: TrendingUp,
  care: LifeBuoy,
  code: Code2,
  flow: Workflow,
  pay: CreditCard,
} as const;

const pad = (value: number) => String(value).padStart(2, "0");

// Terminal, das beim ersten Sichtbarwerden Zeile für Zeile tippt.
const AuditTerminal = () => {
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
    <div ref={ref} className="pm-term" role="img" aria-label="Beispielablauf eines technischen Audits: Crawling, Indexierung, Ladezeit, Zahlungswege und Plattformregeln prüfen, danach ein Bericht mit konkreten Schritten.">
      <div className="pm-term__bar" aria-hidden="true">
        <i /><i /><i />
        <span>dp@ops: ~/audit</span>
        <b><Lock size={11} /> TLS</b>
      </div>
      <pre className="pm-term__body" aria-hidden="true">
        {AUDIT_LINES.slice(0, count).map((line, index) => (
          <span key={line.text} className={`pm-term__line pm-term__line--${line.kind}`} style={{ animationDelay: `${index * 0.02}s` }}>
            {line.text}
          </span>
        ))}
        <span className="pm-term__cursor" />
      </pre>
      <p className="pm-term__note">Beispielablauf eines technischen Audits. Ergebnis: konkrete Schritte, keine Garantien.</p>
    </div>
  );
};

export const OpsServices = () => (
  <section id="leistungen" className="pm-section pm-ops" aria-labelledby="pm-services-title">
    <div className="pm-ops__bg" aria-hidden="true" />
    <div className="pm-wrap">
      <div className="pm-ops__head">
        <Reveal className="pm-ops__lead">
          <p className="pm-kicker">Unter der Oberfläche · Services</p>
          <Decrypt as="h2" className="pm-h2" text="Technik für Märkte, die andere meiden." />
          <p className="pm-body">
            Neben dem eigenen Produkt bauen und betreuen wir Websites, Shops und Plattformen. Schwerpunkt: technische SEO und
            Sichtbarkeit, auch dort, wo Werbeverbote, Plattformregeln und abgelehnte Zahlungsanbieter den Alltag bestimmen.
          </p>
          <div className="pm-cta">
            <a className="pm-btn" href="#kontakt" onClick={() => requestInterest("Webentwicklung, Shop oder Plattform")}>
              Projekt anfragen <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="pm-btn pm-btn--ghost" href="#branchen">Branchen ansehen</a>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <AuditTerminal />
        </Reveal>
      </div>
      <ul className="pm-mods">
        {SERVICES.map((service, index) => {
          const Icon = SERVICE_ICONS[service.icon];
          return (
            <li key={service.title}>
              <Reveal delay={(index % 3) * 0.06} className="pm-mod">
                <div className="pm-mod__top">
                  <span className="pm-mod__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.7} /></span>
                  <span className="pm-mod__code" aria-hidden="true">{`SVC/${pad(index + 1)} · ${service.code}`}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                {"href" in service && service.href ? (
                  <Link to={service.href} className="pm-mod__link">{service.hrefLabel} <ArrowRight size={15} aria-hidden="true" /></Link>
                ) : null}
              </Reveal>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

const Dossier = ({ industry, index }: { industry: (typeof INDUSTRIES)[number]; index: number }) => {
  const [ref, seen] = useInViewOnce<HTMLElement>("0px 0px -20% 0px");
  return (
    <article ref={ref} className={`pm-dossier${seen ? " is-open" : ""}`}>
      <div className="pm-dossier__head">
        <p className="pm-dossier__tag">{industry.tag}</p>
        <span className="pm-dossier__no" aria-hidden="true">{`AKTE ${pad(index + 1)}/${pad(INDUSTRIES.length)}`}</span>
      </div>
      <h3>{industry.title}</h3>
      <p>{industry.text}</p>
      <ul className="pm-chips" aria-label="Schwerpunkte">
        {industry.scope.map((item, position) => (
          <li key={item} style={{ transitionDelay: `${0.35 + position * 0.18}s` }}>{item}</li>
        ))}
      </ul>
      <span className="pm-dossier__stamp" aria-hidden="true">Restricted</span>
    </article>
  );
};

export const OpsIndustries = () => (
  <section id="branchen" className="pm-section pm-industries" aria-labelledby="pm-industries-title">
    <div className="pm-wrap">
      <Reveal>
        <p className="pm-kicker">Branchen mit Regeln · High-Risk</p>
        <Decrypt as="h2" className="pm-h2" text="Wo andere an Sperren scheitern, fangen wir an zu planen." />
        <p className="pm-body pm-body--wide">
          CBD, legales Cannabis und Dating-Plattformen kämpfen mit Werbeverboten, Plattformregeln und abgelehnten Zahlungsanbietern.
          Dort liegt unser Schwerpunkt bei technischer Betreuung, SEO und Reichweite. Diskret und ohne Schaufenster-Versprechen.
        </p>
      </Reveal>
      <div className="pm-dossiers">
        {INDUSTRIES.map((industry, index) => (
          <Reveal key={industry.title} delay={index * 0.08}>
            <Dossier industry={industry} index={index} />
          </Reveal>
        ))}
      </div>
      <p className="pm-industries__note">{INDUSTRY_NOTE}</p>
    </div>
  </section>
);
