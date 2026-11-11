import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Menu, Search, X } from "lucide-react";
import Footer from "@/components/Footer";
import SupportWidget from "@/components/support/SupportWidget";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { useToast } from "@/hooks/use-toast";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { Reveal } from "./motion";
import { CommandPalette, INTEREST_EVENT, MobileDock, requestInterest, scrollToId, takePendingInterest, usePaletteHotkey } from "./AppShell";
import { INTEREST_OPTIONS, NAV_LINKS, STUDIO_URL } from "./content";
import "@/styles/premium-home.css";
import "@/styles/premium-v5.css";

const pad = (value: number) => String(value).padStart(2, "0");

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

const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => {
  const { pathname } = useLocation();
  const current = pathname === href;
  return (
    <Link to={href} className={current ? "is-active" : undefined} aria-current={current ? "page" : undefined} onClick={onClick}>
      {label}
    </Link>
  );
};

const PremiumNav = ({ brand, onPalette }: { brand: string; onPalette: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

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
        <Link to="/" className="pm-logo" aria-label={`${brand}, zur Startseite`} onClick={() => setOpen(false)}>
          {brand}
          <span className="pm-logo__dot">.</span>
        </Link>
        <nav className="pm-nav__links" aria-label="Hauptnavigation">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>
        <div className="pm-nav__actions">
          <button type="button" className="pm-nav__cmd" onClick={onPalette} aria-label="Befehlspalette öffnen (Strg + K)">
            <Search size={14} aria-hidden="true" />
            <kbd>Ctrl K</kbd>
          </button>
          <a className="pm-nav__app" href={STUDIO_URL} rel="noopener noreferrer">
            Zur App <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a className="pm-btn pm-btn--sm" href="#kontakt" onClick={() => requestInterest("Creator Studio: Pilotzugang")}>Pilotzugang</a>
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
            <NavLink key={link.href} href={link.href} label={link.label} onClick={() => setOpen(false)} />
          ))}
          <a href={STUDIO_URL} rel="noopener noreferrer">Zur App</a>
        </nav>
        <a className="pm-btn" href="#kontakt" onClick={() => setOpen(false)}>Anfrage senden</a>
      </div>
    </header>
  );
};

// Anfrageformular der Premium-Seiten. Es schreibt dieselben Felder in dieselbe Tabelle (`leads`) wie das
// bestehende Kontaktformular, damit Admin-Bereich und Benachrichtigungen unverändert weiterlaufen.
export const PremiumContact = ({ title = "Pilotzugang oder Projekt?", interest }: { title?: string; interest?: string }) => {
  const { activeSiteId } = useSiteContext();
  const { toast } = useToast();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const [form, setForm] = useState(() => ({ name: "", email: "", company: "", service: takePendingInterest() || interest || "", description: "", privacy: false }));
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field: string, value: string | boolean) => setForm((previous) => ({ ...previous, [field]: value }));

  // Vorauswahl aus Buttons und Befehlspalette ("Pilot anfragen", "Projekt anfragen").
  useEffect(() => {
    const onInterest = (event: Event) => {
      const option = (event as CustomEvent<string>).detail;
      if ((INTEREST_OPTIONS as readonly string[]).includes(option)) setForm((previous) => ({ ...previous, service: option }));
    };
    window.addEventListener(INTEREST_EVENT, onInterest);
    return () => window.removeEventListener(INTEREST_EVENT, onInterest);
  }, []);

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
          <h2 id="pm-contact-title" className="pm-h2">{title}</h2>
          <p className="pm-body">Schreib kurz, worum es geht. Du bekommst eine persönliche Antwort mit einem klaren nächsten Schritt.</p>
          <ul className="pm-contact__facts">
            <li>Creator Studio ist in der Pilotphase, der Zugang läuft auf Anfrage.</li>
            <li>Projekte beginnen mit einem kostenlosen Erstgespräch.</li>
            <li>Du sprichst direkt mit dem Gründer, nicht mit einem Vertriebsteam.</li>
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
              <fieldset className="pm-form__topics">
                <legend>Worum geht es?</legend>
                <div className="pm-form__chips">
                  {INTEREST_OPTIONS.map((option) => (
                    <label key={option} className={`pm-topic${form.service === option ? " is-on" : ""}`}>
                      <input type="radio" name="pm-topic" value={option} checked={form.service === option} onChange={() => update("service", option)} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label>
                <span>Unternehmen (optional)</span>
                <input autoComplete="organization" value={form.company} onChange={(e) => update("company", e.target.value)} />
              </label>
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

// Gemeinsamer Rahmen aller Premium-Seiten: Kopf, Befehlspalette, Tab-Leiste, Fuß.
export const PremiumShell = ({ children }: { children: ReactNode }) => {
  const { settings } = useGlobalTheme();
  const brand = settings.company_name || "Digital-Perfect";
  const [palette, setPalette] = useState(false);
  const { pathname, hash } = useLocation();
  usePaletteHotkey(setPalette);

  // Seitenwechsel: nach oben, oder zum Anker (z. B. /#projekte).
  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => scrollToId(hash.slice(1)), 80);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return (
    <div className="pm">
      <a className="pm-skip" href="#inhalt">Zum Inhalt springen</a>
      <PremiumNav brand={brand} onPalette={() => setPalette(true)} />
      <PlayheadRail />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <MobileDock />
      <main id="inhalt">{children}</main>
      <Footer />
      <SupportWidget />
    </div>
  );
};
