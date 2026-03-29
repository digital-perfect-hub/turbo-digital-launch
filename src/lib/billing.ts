export type BillingPlanKey = "starter" | "pro" | "agency";

export type BillingEntitlements = {
  maxTeamMembers: number;
  maxCustomDomains: number;
  maxPages: number;
  canUseForum: boolean;
  canUseShop: boolean;
  canUseSeoPro: boolean;
  canUseSupportDesk: boolean;
};

export type BillingPlan = {
  key: BillingPlanKey;
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  entitlements: BillingEntitlements;
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    key: "starter",
    name: "Starter",
    priceLabel: "39 € / Monat",
    description: "Für Freelancer und kleine Setups mit sauberem Kernsystem.",
    features: ["1 Site", "Page Builder", "Branding & Theme", "Leads Basis"],
    entitlements: {
      maxTeamMembers: 3,
      maxCustomDomains: 1,
      maxPages: 10,
      canUseForum: false,
      canUseShop: false,
      canUseSeoPro: false,
      canUseSupportDesk: false,
    },
  },
  {
    key: "pro",
    name: "Pro",
    priceLabel: "69 € / Monat",
    description: "Für wachsende Projekte mit mehr Content, Modulen und Automatisierung.",
    features: ["Mehr Seiten", "Forum/Shop optional", "White-Label Ready", "Premium Support"],
    entitlements: {
      maxTeamMembers: 8,
      maxCustomDomains: 3,
      maxPages: 50,
      canUseForum: true,
      canUseShop: true,
      canUseSeoPro: true,
      canUseSupportDesk: true,
    },
  },
  {
    key: "agency",
    name: "Agency",
    priceLabel: "99 € / Monat",
    description: "Für Agenturen mit mehreren Kunden-Sites und voller Skalierung.",
    features: ["Mandantenfähig", "Agency Billing", "Module & Entitlements", "Customer Portal"],
    entitlements: {
      maxTeamMembers: 25,
      maxCustomDomains: 10,
      maxPages: 200,
      canUseForum: true,
      canUseShop: true,
      canUseSeoPro: true,
      canUseSupportDesk: true,
    },
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

export const formatUsageLabel = (used: number, allowed: number, singular: string, plural?: string) => {
  const label = used === 1 ? singular : plural ?? `${singular}e`;
  return `${used} / ${allowed} ${label}`;
};
