export const SUPPORT_MODE_OPTIONS = [
  { value: 'platform_managed', label: 'Plattform-Managed' },
  { value: 'agency_managed', label: 'Agency-Managed' },
  { value: 'self_managed', label: 'Self-Managed' },
  { value: 'hybrid', label: 'Hybrid / Eskalation' },
] as const;

export const TICKET_STATUS_OPTIONS = [
  { value: 'open', label: 'Offen' },
  { value: 'in_progress', label: 'In Bearbeitung' },
  { value: 'waiting_customer', label: 'Wartet auf Kunde' },
  { value: 'resolved', label: 'Gelöst' },
  { value: 'closed', label: 'Geschlossen' },
] as const;

export const TICKET_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Niedrig' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Hoch' },
  { value: 'urgent', label: 'Urgent' },
] as const;

export const TICKET_CATEGORY_OPTIONS = [
  { value: 'technical', label: 'Technik' },
  { value: 'billing', label: 'Billing' },
  { value: 'domain', label: 'Domain' },
  { value: 'content', label: 'Content' },
  { value: 'bug', label: 'Bug' },
  { value: 'other', label: 'Sonstiges' },
] as const;

export const SUPPORT_ORG_TYPE_OPTIONS = [
  { value: 'platform', label: 'Plattform' },
  { value: 'agency', label: 'Agency' },
  { value: 'internal', label: 'Intern' },
] as const;

export type SupportMode = (typeof SUPPORT_MODE_OPTIONS)[number]['value'];
export type TicketStatus = (typeof TICKET_STATUS_OPTIONS)[number]['value'];
export type TicketPriority = (typeof TICKET_PRIORITY_OPTIONS)[number]['value'];
export type TicketCategory = (typeof TICKET_CATEGORY_OPTIONS)[number]['value'];
export type SupportOrgType = (typeof SUPPORT_ORG_TYPE_OPTIONS)[number]['value'];
export type TicketAuthorType = 'customer' | 'site_user' | 'agent' | 'platform' | 'system';

export type SupportOrganizationRecord = {
  id: string;
  site_id: string | null;
  name: string;
  slug: string;
  type: SupportOrgType;
  owner_user_id: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type SiteSupportSettingsRecord = {
  site_id: string;
  support_mode: SupportMode;
  support_organization_id: string | null;
  allow_platform_escalation: boolean;
  support_widget_enabled: boolean;
  support_email_enabled: boolean;
  default_sla_hours: number;
  created_at: string | null;
  updated_at: string | null;
};

export type TicketRecord = {
  id: string;
  site_id: string;
  support_organization_id: string;
  created_by_user_id: string | null;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  source: 'admin' | 'widget' | 'email' | 'system';
  assigned_to_user_id: string | null;
  escalated_to_platform: boolean;
  last_reply_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TicketMessageRecord = {
  id: string;
  ticket_id: string;
  author_user_id: string | null;
  author_type: TicketAuthorType;
  message: string;
  is_internal_note: boolean;
  created_at: string | null;
};

export type TicketAttachmentRecord = {
  id: string;
  ticket_id: string;
  storage_path: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string | null;
  signed_url?: string | null;
};

export type TicketEventRecord = {
  id: string;
  ticket_id: string;
  event_type: string;
  performed_by_user_id: string | null;
  payload: Record<string, unknown>;
  created_at: string | null;
};

export const createDefaultSupportSettings = (siteId: string): SiteSupportSettingsRecord => ({
  site_id: siteId,
  support_mode: 'platform_managed',
  support_organization_id: null,
  allow_platform_escalation: false,
  support_widget_enabled: true,
  support_email_enabled: true,
  default_sla_hours: 24,
  created_at: null,
  updated_at: null,
});

export const getTicketStatusLabel = (value?: string | null) =>
  TICKET_STATUS_OPTIONS.find((entry) => entry.value === value)?.label ?? 'Unbekannt';

export const getTicketPriorityLabel = (value?: string | null) =>
  TICKET_PRIORITY_OPTIONS.find((entry) => entry.value === value)?.label ?? 'Unbekannt';

export const getTicketCategoryLabel = (value?: string | null) =>
  TICKET_CATEGORY_OPTIONS.find((entry) => entry.value === value)?.label ?? 'Sonstiges';

export const getSupportModeLabel = (value?: string | null) =>
  SUPPORT_MODE_OPTIONS.find((entry) => entry.value === value)?.label ?? 'Plattform-Managed';

export const getTicketStatusTone = (value?: string | null) => {
  switch (value) {
    case 'open':
      return 'bg-[#FFF4F1] text-[#FF4B2C] border-[#FF4B2C]/15';
    case 'in_progress':
      return 'bg-[#EEF4FF] text-[#0E1F53] border-[#0E1F53]/10';
    case 'waiting_customer':
      return 'bg-[#FFF8E8] text-[#9A6700] border-[#E7B54A]/20';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'closed':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export const getTicketPriorityTone = (value?: string | null) => {
  switch (value) {
    case 'urgent':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'normal':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'low':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export const mapSupportOrganization = (row: Record<string, unknown>): SupportOrganizationRecord => ({
  id: String(row.id || ''),
  site_id: typeof row.site_id === 'string' ? row.site_id : null,
  name: String(row.name || ''),
  slug: String(row.slug || ''),
  type: (typeof row.type === 'string' ? row.type : 'internal') as SupportOrgType,
  owner_user_id: typeof row.owner_user_id === 'string' ? row.owner_user_id : null,
  is_active: Boolean(row.is_active),
  created_at: typeof row.created_at === 'string' ? row.created_at : null,
  updated_at: typeof row.updated_at === 'string' ? row.updated_at : null,
});

export const mapSiteSupportSettings = (siteId: string, row?: Record<string, unknown> | null): SiteSupportSettingsRecord => ({
  site_id: typeof row?.site_id === 'string' ? row.site_id : siteId,
  support_mode: (typeof row?.support_mode === 'string' ? row.support_mode : 'platform_managed') as SupportMode,
  support_organization_id: typeof row?.support_organization_id === 'string' ? row.support_organization_id : null,
  allow_platform_escalation: Boolean(row?.allow_platform_escalation),
  support_widget_enabled: row?.support_widget_enabled === undefined ? true : Boolean(row.support_widget_enabled),
  support_email_enabled: row?.support_email_enabled === undefined ? true : Boolean(row.support_email_enabled),
  default_sla_hours: typeof row?.default_sla_hours === 'number' ? row.default_sla_hours : 24,
  created_at: typeof row?.created_at === 'string' ? row.created_at : null,
  updated_at: typeof row?.updated_at === 'string' ? row.updated_at : null,
});

export const mapTicket = (row: Record<string, unknown>): TicketRecord => ({
  id: String(row.id || ''),
  site_id: String(row.site_id || ''),
  support_organization_id: String(row.support_organization_id || ''),
  created_by_user_id: typeof row.created_by_user_id === 'string' ? row.created_by_user_id : null,
  requester_name: String(row.requester_name || ''),
  requester_email: String(row.requester_email || ''),
  requester_phone: typeof row.requester_phone === 'string' ? row.requester_phone : null,
  subject: String(row.subject || ''),
  status: (typeof row.status === 'string' ? row.status : 'open') as TicketStatus,
  priority: (typeof row.priority === 'string' ? row.priority : 'normal') as TicketPriority,
  category: (typeof row.category === 'string' ? row.category : 'other') as TicketCategory,
  source: (typeof row.source === 'string' ? row.source : 'admin') as TicketRecord['source'],
  assigned_to_user_id: typeof row.assigned_to_user_id === 'string' ? row.assigned_to_user_id : null,
  escalated_to_platform: Boolean(row.escalated_to_platform),
  last_reply_at: typeof row.last_reply_at === 'string' ? row.last_reply_at : null,
  created_at: typeof row.created_at === 'string' ? row.created_at : null,
  updated_at: typeof row.updated_at === 'string' ? row.updated_at : null,
});

export const mapTicketMessage = (row: Record<string, unknown>): TicketMessageRecord => ({
  id: String(row.id || ''),
  ticket_id: String(row.ticket_id || ''),
  author_user_id: typeof row.author_user_id === 'string' ? row.author_user_id : null,
  author_type: (typeof row.author_type === 'string' ? row.author_type : 'system') as TicketAuthorType,
  message: String(row.message || ''),
  is_internal_note: Boolean(row.is_internal_note),
  created_at: typeof row.created_at === 'string' ? row.created_at : null,
});

export const mapTicketAttachment = (row: Record<string, unknown>): TicketAttachmentRecord => ({
  id: String(row.id || ''),
  ticket_id: String(row.ticket_id || ''),
  storage_path: String(row.storage_path || ''),
  filename: String(row.filename || ''),
  mime_type: typeof row.mime_type === 'string' ? row.mime_type : null,
  size_bytes: typeof row.size_bytes === 'number' ? row.size_bytes : null,
  created_at: typeof row.created_at === 'string' ? row.created_at : null,
  signed_url: typeof row.signed_url === 'string' ? row.signed_url : null,
});

export const mapTicketEvent = (row: Record<string, unknown>): TicketEventRecord => ({
  id: String(row.id || ''),
  ticket_id: String(row.ticket_id || ''),
  event_type: String(row.event_type || ''),
  performed_by_user_id: typeof row.performed_by_user_id === 'string' ? row.performed_by_user_id : null,
  payload: typeof row.payload === 'object' && row.payload !== null ? (row.payload as Record<string, unknown>) : {},
  created_at: typeof row.created_at === 'string' ? row.created_at : null,
});

export const createSupportOrganizationSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
