import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AGB = () => (
  <div className="min-h-screen bg-background py-20">
    <div className="section-container max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
        <ArrowLeft size={16} /> Zurück zur Startseite
      </Link>
      <h1 className="text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
      <div className="prose prose-gray max-w-none space-y-4 text-foreground/80">
        <h2 className="text-xl font-semibold">§ 1 Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen gelten für alle Geschäftsbeziehungen zwischen Digital-Perfect
          (nachfolgend „Anbieter") und dem Kunden. Maßgeblich ist die jeweils zum Zeitpunkt des Vertragsschlusses
          gültige Fassung.
        </p>
        <h2 className="text-xl font-semibold">§ 2 Vertragsschluss</h2>
        <p>
          Die Darstellung der Produkte und Dienstleistungen auf der Website stellt kein rechtlich bindendes Angebot dar,
          sondern eine unverbindliche Einladung zur Bestellung. Durch die Bestellung erklärt der Kunde verbindlich sein
          Vertragsangebot.
        </p>
        <h2 className="text-xl font-semibold">§ 3 Preise und Zahlung</h2>
        <p>
          Alle Preise verstehen sich in Euro inklusive der gesetzlichen Mehrwertsteuer. Rechnungen sind innerhalb von
          14 Tagen nach Rechnungsdatum ohne Abzug zur Zahlung fällig, sofern nicht anders vereinbart.
        </p>
        <h2 className="text-xl font-semibold">§ 4 Lieferung und Leistungserbringung</h2>
        <p>
          Die Lieferung digitaler Produkte erfolgt per E-Mail oder über einen geschützten Download-Bereich.
          Dienstleistungen werden gemäß dem individuell vereinbarten Projektplan erbracht.
        </p>
        <h2 className="text-xl font-semibold">§ 5 Schlussbestimmungen</h2>
        <p>
          Es gilt das Recht der Republik Österreich. Gerichtsstand ist Wien. Sollten einzelne Bestimmungen dieser AGB
          unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.
        </p>
      </div>
    </div>
  </div>
);

export default AGB;
