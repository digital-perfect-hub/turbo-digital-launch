import { Paperclip, Sparkles, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TicketStatusBadge from '@/components/admin/tickets/TicketStatusBadge';
import TicketPriorityBadge from '@/components/admin/tickets/TicketPriorityBadge';
import TicketMessageList from '@/components/admin/tickets/TicketMessageList';
import TicketReplyComposer from '@/components/admin/tickets/TicketReplyComposer';
import InternalNoteComposer from '@/components/admin/tickets/InternalNoteComposer';
import TicketAssignmentBar from '@/components/admin/tickets/TicketAssignmentBar';
import type { TicketDetailResult } from '@/types/support';

type TicketDetailPanelProps = {
  detail: TicketDetailResult | null;
  isLoading?: boolean;
  isMutating?: boolean;
  onReply: (message: string) => Promise<void> | void;
  onInternalNote: (message: string) => Promise<void> | void;
  onUpdateStatus: (patch: { status?: string; priority?: string; assigned_to_user_id?: string | null }) => Promise<void> | void;
  onEscalate: () => Promise<void> | void;
  onAttachmentUpload: (file: File) => Promise<void> | void;
  canEscalate?: boolean;
};

const TicketDetailPanel = ({ detail, isLoading, isMutating, onReply, onInternalNote, onUpdateStatus, onEscalate, onAttachmentUpload, canEscalate }: TicketDetailPanelProps) => {
  if (isLoading) {
    return <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Ticket wird geladen…</div>;
  }

  if (!detail) {
    return <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Wähle links ein Ticket aus, um Verlauf und Actions zu sehen.</div>;
  }

  const { ticket, messages, attachments, events } = detail;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF4B2C] shadow-sm">
              <Sparkles size={14} /> Ticket Detail
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.03em] text-slate-900">{ticket.subject}</h2>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              <span>{ticket.requester_name}</span>
              <span>{ticket.requester_email}</span>
              {ticket.requester_phone ? <span>{ticket.requester_phone}</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TicketStatusBadge value={ticket.status} />
            <TicketPriorityBadge value={ticket.priority} />
            {canEscalate ? (
              <Button variant="outline" className="rounded-xl border-slate-200" disabled={isMutating || ticket.escalated_to_platform} onClick={onEscalate}>
                Plattform eskalieren
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <TicketAssignmentBar
            status={ticket.status}
            priority={ticket.priority}
            assignedToUserId={ticket.assigned_to_user_id}
            onStatusChange={(value) => onUpdateStatus({ status: value })}
            onPriorityChange={(value) => onUpdateStatus({ priority: value })}
            onAssignedToUserIdChange={(value) => onUpdateStatus({ assigned_to_user_id: value })}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-lg font-bold text-slate-900">Verlauf</div>
        <TicketMessageList messages={messages} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <TicketReplyComposer disabled={isMutating} onSubmit={onReply} />
        <InternalNoteComposer disabled={isMutating} onSubmit={onInternalNote} />
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-lg font-bold text-slate-900">Attachments</div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <UploadCloud size={16} /> Datei anhängen
            <input type="file" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onAttachmentUpload(file);
              event.currentTarget.value = '';
            }} />
          </label>
        </div>
        {attachments.length ? (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <a key={attachment.id} href={attachment.signed_url || '#'} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-white">
                <span className="flex items-center gap-3"><Paperclip size={16} className="text-[#FF4B2C]" /> {attachment.filename}</span>
                <span>{attachment.size_bytes ? `${Math.round(attachment.size_bytes / 1024)} KB` : 'Datei'}</span>
              </a>
            ))}
          </div>
        ) : <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Noch keine Attachments.</div>}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-lg font-bold text-slate-900">Event Log</div>
        {events.length ? (
          <div className="space-y-3">
            {events.map((entry) => (
              <div key={entry.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{entry.event_type}</div>
                <div className="mt-2">{new Date(entry.created_at || Date.now()).toLocaleString('de-AT')}</div>
              </div>
            ))}
          </div>
        ) : <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Noch keine Events protokolliert.</div>}
      </section>
    </div>
  );
};

export default TicketDetailPanel;
