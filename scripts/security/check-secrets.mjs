#!/usr/bin/env node
// Prüft die von Git verfolgten Dateien auf env-Dateien und auf Zugangsdaten.
// Gibt nur Datei, Zeile und Regel aus, niemals den gefundenen Wert.
//   node scripts/security/check-secrets.mjs            -> alle verfolgten Dateien (läuft mit `npm test` und `npm run check:secrets`)
//   node scripts/security/check-secrets.mjs --staged   -> nur der Index (Pre-Commit-Hook in .githooks/pre-commit)
// Exit-Code 1, sobald etwas gefunden wird.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const staged = process.argv.includes("--staged");

const git = (args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const files = (staged ? git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]) : git(["ls-files", "-z"]))
  .split("\0")
  .filter(Boolean);

// Dateien, die nie ins Repository gehören: .env, .env.local, .env.production …, .dev.vars. Vorlagen (*.example) sind erlaubt.
const ENV_FILE = /(^|\/)(\.env(\.(?!example$)[\w.-]+)?|\.dev\.vars)$/;
const EXAMPLE_FILE = /\.example$/;
const SKIP_FILE = /(^|\/)(package-lock\.json|bun\.lock)$|(^|\/)node_modules\/|\.(png|jpe?g|webp|gif|ico|svg|zip|woff2?|ttf|otf|mp4|webm|mp3|wav|pdf)$/i;
const PRIVILEGED_JWT_ROLES = new Set(["service_role", "supabase_admin"]);

const JWT = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

const jwtRole = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(payload, "base64").toString("utf8")).role ?? null;
  } catch {
    return null;
  }
};

const RULES = [
  { id: "supabase-secret-key", pattern: /sb_secret_[A-Za-z0-9_]{10,}/ },
  { id: "service-role-assignment", pattern: /SERVICE_ROLE_KEY[\t "']*=[\t "']*[^\s"']{8,}/ },
  { id: "private-key-block", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { id: "stripe-live-or-restricted-key", pattern: /\b(sk|rk)_live_[A-Za-z0-9]{10,}/ },
  { id: "stripe-webhook-secret", pattern: /\bwhsec_[A-Za-z0-9]{10,}/ },
  { id: "resend-api-key", pattern: /\bre_[A-Za-z0-9]{20,}/ },
  { id: "github-token", pattern: /\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/ },
];

// In Vorlagen (*.example) dürfen Geheimnisse nur als Platzhalter stehen, nie als echter Wert.
const EXAMPLE_ASSIGNMENT = /^\s*([A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|API_KEY|SERVICE_ROLE)[A-Z0-9_]*)\s*=\s*(.*)$/;
const PLACEHOLDER = /^["']?(|<.*>|replace-me.*|your[-_].*|changeme.*|x{3,}.*|\.\.\.)["']?$/i;

const findings = [];

for (const file of files) {
  if (ENV_FILE.test(file)) {
    findings.push({ file, line: 0, rule: "env-datei-im-repository" });
    continue;
  }
  if (SKIP_FILE.test(file)) continue;
  let text;
  try {
    text = staged ? git(["show", `:${file}`]) : readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const token of line.match(JWT) ?? []) {
      const role = jwtRole(token);
      if (role && PRIVILEGED_JWT_ROLES.has(role)) findings.push({ file, line: index + 1, rule: `jwt-role-${role}` });
    }
    for (const rule of RULES) {
      if (rule.pattern.test(line)) findings.push({ file, line: index + 1, rule: rule.id });
    }
    if (EXAMPLE_FILE.test(file)) {
      const assignment = line.match(EXAMPLE_ASSIGNMENT);
      if (assignment && !PLACEHOLDER.test(assignment[2].trim())) findings.push({ file, line: index + 1, rule: "echter-wert-in-vorlage" });
    }
  });
}

if (findings.length === 0) {
  console.log(`check-secrets: ${files.length} Dateien geprüft, keine env-Datei und keine Zugangsdaten gefunden.`);
  process.exit(0);
}

console.error("check-secrets: NICHT COMMITTEN (Werte werden nicht ausgegeben):");
for (const finding of findings) console.error(`  ${finding.file}${finding.line ? ":" + finding.line : ""}  Regel ${finding.rule}`);
console.error("env-Dateien bleiben lokal (.gitignore). Echte Zugangsdaten gehören in die Umgebung des Hosters, nie ins Repository.");
console.error("War ein echter Wert schon einmal eingecheckt oder gepusht, gilt er als bekannt und muss ersetzt werden.");
process.exit(1);
