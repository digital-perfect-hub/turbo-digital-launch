import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Öffentliche Adresse des Supabase-Projekts dieser Website. Sie steht ohnehin in jedem ausgelieferten Bundle und ist kein
// Geheimnis. Seit die Datei .env nicht mehr im Repository liegt, gilt sie als Vorgabe, wenn weder eine lokale env-Datei noch
// die Umgebung des Hosters VITE_SUPABASE_URL setzt. Der öffentliche Schlüssel (VITE_SUPABASE_PUBLISHABLE_KEY) hat bewusst
// keine Vorgabe: Er kommt aus der Umgebung des Hosters oder aus der lokalen .env.
const DEFAULT_SUPABASE_URL = "https://wevlxnlaxyzsobkaeoyi.supabase.co";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Reihenfolge wie bei Vite üblich: Umgebung des Hosters vor env-Dateien, die Vorgabe zuletzt. Der Wert wird in die Umgebung
  // gelegt, bevor Vite die Variablen einsammelt, damit er im Code (import.meta.env) und in index.html (%VITE_SUPABASE_URL%) ankommt.
  process.env.VITE_SUPABASE_URL = loadEnv(mode, __dirname, "VITE_").VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;

  return {
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});