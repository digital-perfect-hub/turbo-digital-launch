import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Impressum = () => (
  <div className="min-h-screen bg-background py-20">
    <div className="section-container max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
        <ArrowLeft size={16} /> Zurück zur Startseite
      </Link>
      <h1 className="text-3xl font-bold mb-8">Impressum</h1>
      <div className="prose prose-gray max-w-none space-y-4 text-foreground/80">
        <h2 className="text-xl font-semibold">Angaben gemäß § 5 TMG / § 25 MedienG</h2>
        <p>
          Digital-Perfect<br />
          Markus Schulz<br />
          Musterstraße 1<br />
          1010 Wien, Österreich
        </p>
        <h2 className="text-xl font-semibold">Kontakt</h2>
        <p>
          Telefon: +43 XXX XXXXXXX<br />
          E-Mail: office@digital-perfect.com
        </p>
        <h2 className="text-xl font-semibold">Umsatzsteuer-ID</h2>
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: ATU XXXXXXXXX</p>
        <h2 className="text-xl font-semibold">Verantwortlich für den Inhalt</h2>
        <p>Markus Schulz, Anschrift wie oben</p>
        <h2 className="text-xl font-semibold">Haftungsausschluss</h2>
        <p>
          Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
          und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
        </p>
      </div>
    </div>
  </div>
);

export default Impressum;
