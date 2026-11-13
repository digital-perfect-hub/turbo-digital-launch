import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const NotFound = () => (
  <>
    <SEO title="Seite nicht gefunden | Digital-Perfect" description="Diese Seite gibt es nicht." noIndex />
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Diese Seite gibt es nicht.</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Zur Startseite
        </Link>
      </div>
    </div>
  </>
);

export default NotFound;
