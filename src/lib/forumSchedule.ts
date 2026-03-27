const SCHEDULE_PATTERN = /\[\[scheduled_at=([^\]]+)\]\]/i;

export const extractForumScheduledAt = (notes?: string | null): string | null => {
  if (!notes) return null;
  const match = notes.match(SCHEDULE_PATTERN);
  const iso = match?.[1]?.trim();
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

export const stripForumScheduleMeta = (notes?: string | null): string => {
  if (!notes) return "";
  return notes.replace(SCHEDULE_PATTERN, "").replace(/\n{3,}/g, "\n\n").trim();
};

export const upsertForumScheduleMeta = (notes: string | null | undefined, iso: string | null | undefined): string => {
  const cleanNotes = stripForumScheduleMeta(notes);
  const normalizedIso = iso ? new Date(iso).toISOString() : "";

  if (!normalizedIso || Number.isNaN(new Date(normalizedIso).getTime())) {
    return cleanNotes;
  }

  return cleanNotes ? `[[scheduled_at=${normalizedIso}]]\n\n${cleanNotes}` : `[[scheduled_at=${normalizedIso}]]`;
};

export const isForumThreadPubliclyVisible = (
  status: string | null | undefined,
  notes?: string | null,
  now = new Date(),
) => {
  if (status === "published") return true;
  if (status !== "scheduled") return false;

  const scheduledAt = extractForumScheduledAt(notes);
  if (!scheduledAt) return false;

  return new Date(scheduledAt).getTime() <= now.getTime();
};
