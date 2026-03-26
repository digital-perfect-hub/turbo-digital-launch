import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Blocks,
  Bot,
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Gem,
  Globe,
  GraduationCap,
  Handshake,
  HeartHandshake,
  ImageIcon,
  Laptop2,
  Layers3,
  LayoutDashboard,
  LineChart,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Monitor,
  Phone,
  Rocket,
  Search,
  Settings2,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
  Wand2,
  Wrench,
} from "lucide-react";

export type LucideIconOption = {
  key: string;
  label: string;
  keywords: string[];
  icon: LucideIcon;
};

export const LUCIDE_ICON_OPTIONS: LucideIconOption[] = [
  { key: "Monitor", label: "Monitor", keywords: ["web", "website", "ui", "screen"], icon: Monitor },
  { key: "Search", label: "Search", keywords: ["seo", "suche", "google"], icon: Search },
  { key: "ShoppingCart", label: "Shopping Cart", keywords: ["shop", "ecommerce", "cart"], icon: ShoppingCart },
  { key: "Globe", label: "Globe", keywords: ["international", "world", "web"], icon: Globe },
  { key: "MapPin", label: "Map Pin", keywords: ["local", "city", "maps"], icon: MapPin },
  { key: "Bot", label: "Bot", keywords: ["ai", "automation", "assistant"], icon: Bot },
  { key: "Wrench", label: "Wrench", keywords: ["service", "repair", "tech"], icon: Wrench },
  { key: "BarChart3", label: "Bar Chart", keywords: ["analytics", "reporting", "data"], icon: BarChart3 },
  { key: "LineChart", label: "Line Chart", keywords: ["growth", "trend", "kpi"], icon: LineChart },
  { key: "TrendingUp", label: "Trending Up", keywords: ["performance", "growth", "sales"], icon: TrendingUp },
  { key: "Megaphone", label: "Megaphone", keywords: ["ads", "marketing", "campaign"], icon: Megaphone },
  { key: "Star", label: "Star", keywords: ["premium", "highlight", "favorite"], icon: Star },
  { key: "Shield", label: "Shield", keywords: ["security", "trust", "safe"], icon: Shield },
  { key: "Users", label: "Users", keywords: ["team", "people", "community"], icon: Users },
  { key: "Building2", label: "Building", keywords: ["agency", "company", "business"], icon: Building2 },
  { key: "Briefcase", label: "Briefcase", keywords: ["business", "consulting", "service"], icon: Briefcase },
  { key: "Handshake", label: "Handshake", keywords: ["partner", "client", "trust"], icon: Handshake },
  { key: "HeartHandshake", label: "Heart Handshake", keywords: ["care", "coaching", "support"], icon: HeartHandshake },
  { key: "CreditCard", label: "Credit Card", keywords: ["billing", "stripe", "payment"], icon: CreditCard },
  { key: "Sparkles", label: "Sparkles", keywords: ["premium", "highlight", "wow"], icon: Sparkles },
  { key: "Rocket", label: "Rocket", keywords: ["launch", "growth", "speed"], icon: Rocket },
  { key: "Wand2", label: "Magic Wand", keywords: ["creative", "branding", "design"], icon: Wand2 },
  { key: "ImageIcon", label: "Image", keywords: ["media", "gallery", "visual"], icon: ImageIcon },
  { key: "Mail", label: "Mail", keywords: ["email", "contact", "lead"], icon: Mail },
  { key: "Phone", label: "Phone", keywords: ["call", "contact", "sales"], icon: Phone },
  { key: "LayoutDashboard", label: "Dashboard", keywords: ["admin", "overview", "panel"], icon: LayoutDashboard },
  { key: "Layers3", label: "Layers", keywords: ["stack", "modules", "builder"], icon: Layers3 },
  { key: "Blocks", label: "Blocks", keywords: ["page builder", "sections", "components"], icon: Blocks },
  { key: "Laptop2", label: "Laptop", keywords: ["saas", "software", "product"], icon: Laptop2 },
  { key: "Store", label: "Store", keywords: ["shop", "store", "commerce"], icon: Store },
  { key: "Gem", label: "Gem", keywords: ["luxury", "premium", "agency"], icon: Gem },
  { key: "Brain", label: "Brain", keywords: ["strategy", "thinking", "automation"], icon: Brain },
  { key: "GraduationCap", label: "Graduation Cap", keywords: ["education", "course", "knowledge"], icon: GraduationCap },
  { key: "FileText", label: "File Text", keywords: ["content", "copy", "seo text"], icon: FileText },
  { key: "Lock", label: "Lock", keywords: ["secure", "privacy", "protected"], icon: Lock },
  { key: "CheckCircle2", label: "Check Circle", keywords: ["done", "benefit", "success"], icon: CheckCircle2 },
  { key: "Settings2", label: "Settings", keywords: ["config", "system", "admin"], icon: Settings2 },
];

export const LUCIDE_ICON_MAP = Object.fromEntries(
  LUCIDE_ICON_OPTIONS.map((entry) => [entry.key, entry.icon]),
) as Record<string, LucideIcon>;

export const getLucideIcon = (iconKey?: string | null, fallback: LucideIcon = Monitor) => {
  if (!iconKey) return fallback;
  return LUCIDE_ICON_MAP[iconKey] || fallback;
};

export const filterLucideIconOptions = (query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return LUCIDE_ICON_OPTIONS;

  return LUCIDE_ICON_OPTIONS.filter((entry) =>
    entry.key.toLowerCase().includes(normalized) ||
    entry.label.toLowerCase().includes(normalized) ||
    entry.keywords.some((keyword) => keyword.toLowerCase().includes(normalized)),
  );
};
