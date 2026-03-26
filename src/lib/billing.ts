export type BillingPlanKey = "starter" | "pro" | "agency";

export type BillingPlan = {
  key: BillingPlanKey;
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    key: "starter",
    name: "Starter",
    priceLabel: "39 € / Monat",
    description: "Für Freelancer und kleine Setups mit sauberem Kernsystem.",
    features: ["1 Site", "Page Builder", "Branding & Theme", "Leads Basis"],
  },
  {
    key: "pro",
    name: "Pro",
    priceLabel: "69 € / Monat",
    description: "Für wachsende Projekte mit mehr Content, Modulen und Automatisierung.",
    features: ["Mehr Seiten", "Forum/Shop optional", "White-Label Ready", "Premium Support"],
  },
  {
    key: "agency",
    name: "Agency",
    priceLabel: "99 € / Monat",
    description: "Für Agenturen mit mehreren Kunden-Sites und voller Skalierung.",
    features: ["Mandantenfähig", "Agency Billing", "Module & Entitlements", "Customer Portal"],
  },
];

export const BILLING_STATUS_LABELS: Record<string, string> = {
  active: "Aktiv",
  trialing: "Trial",
  past_due: "Überfällig",
  canceled: "Beendet",
  unpaid: "Unbezahlt",
  incomplete: "Unvollständig",
  incomplete_expired: "Abgelaufen",
};

export const getBillingPlan = (planKey?: string | null) =>
  BILLING_PLANS.find((plan) => plan.key === planKey) || BILLING_PLANS[0];
