import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const Datenschutz = () => {
  const { settings } = useGlobalTheme();

  return (
    <div className="min-h-screen bg-background py-20">
    <div className="section-container max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
        <ArrowLeft size={16} /> Zurück zur Startseite
      </Link>
      <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>
      <div className="prose prose-gray max-w-none space-y-4 text-foreground/80">
        <h2 className="text-xl font-semibold">1. Datenschutz auf einen Blick</h2>
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert,
          wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert
          werden können.
        </p>
        <h2 className="text-xl font-semibold">2. Datenerfassung auf dieser Website</h2>
        <h3 className="text-lg font-medium">Wer ist verantwortlich für die Datenerfassung?</h3>
        <p>
          Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber ({settings.company_name || "Digital-Perfect"}, Markus Schulz).
        </p>
        <h3 className="text-lg font-medium">Wie erfassen wir Ihre Daten?</h3>
        <p>
          Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z.B. über das Kontaktformular).
          Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst.
        </p>
        <h2 className="text-xl font-semibold">3. Ihre Rechte</h2>
        <p>
          Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten
          personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten
          zu verlangen.
        </p>
        <h2 className="text-xl font-semibold">4. Kontaktformular</h2>
        <p>
          Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive
          der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen
          bei uns gespeichert.
        </p>
      </div>
    </div>
    </div>
  );
};

export default Datenschutz;
