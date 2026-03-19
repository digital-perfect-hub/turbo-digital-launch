import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const Impressum = () => {
  const { settings } = useGlobalTheme();

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="section-container max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm"
        >
          <ArrowLeft size={16} /> Zurück zur Startseite
        </Link>
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>
        <div className="prose prose-gray max-w-none space-y-4 text-foreground/80">
          <h2 className="text-xl font-semibold">Angaben gemäß § 5 TMG / § 25 MedienG</h2>
          <p>
            {settings.imprint_company || "Digital-Perfect"}
            <br />
            {(settings.imprint_address || "Adresse laut global_settings").split("\n").map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
          <h2 className="text-xl font-semibold">Kontakt</h2>
          <p>
            {(settings.imprint_contact || "").split("\n").map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
          {settings.imprint_legal && (
            <>
              <h2 className="text-xl font-semibold">Rechtliche Hinweise</h2>
              <p>{settings.imprint_legal}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Impressum;
