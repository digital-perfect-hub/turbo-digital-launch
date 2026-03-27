import type { TicketRecord } from '@/lib/support';
import TicketPriorityBadge from '@/components/admin/tickets/TicketPriorityBadge';
import TicketStatusBadge from '@/components/admin/tickets/TicketStatusBadge';
import { getTicketCategoryLabel } from '@/lib/support';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TicketListTableProps = {
  tickets: TicketRecord[];
  selectedTicketId?: string | null;
  onSelect: (ticketId: string) => void;
};

const TicketListTable = ({ tickets, selectedTicketId, onSelect }: TicketListTableProps) => {
  if (!tickets.length) {
    return <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">Noch keine Tickets für diese Site.</div>;
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm w-full min-w-0">
      {/* Tabellen-Header mit striktem minmax() */}
      <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto] gap-4 border-b border-slate-100 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 lg:grid">
        <span>Ticket</span>
        <span>Status</span>
        <span>Priorität</span>
        <span>Kategorie</span>
        <span className="shrink-0 text-right">Aktion</span>
      </div>

      <div className="divide-y divide-slate-100">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={cn(
              'grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto] lg:items-center w-full min-w-0',
              selectedTicketId === ticket.id && 'bg-[#FFF9F7]',
            )}
          >
            {/* Spalte 1: Betreff & Meta */}
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="w-full min-w-0 truncate text-base font-bold text-slate-900">
                {ticket.subject}
              </div>
              <div className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                <span className="max-w-[120px] truncate sm:max-w-[180px]">{ticket.requester_name}</span>
                <span className="max-w-[140px] truncate sm:max-w-[200px]">{ticket.requester_email}</span>
                <span className="shrink-0">{new Date(ticket.created_at || Date.now()).toLocaleDateString('de-AT')}</span>
              </div>
            </div>
            
            {/* Spalten 2-4: Badges */}
            <div className="min-w-0 truncate"><TicketStatusBadge value={ticket.status} /></div>
            <div className="min-w-0 truncate"><TicketPriorityBadge value={ticket.priority} /></div>
            <div className="min-w-0 truncate text-sm font-medium text-slate-600">{getTicketCategoryLabel(ticket.category)}</div>
            
            {/* Spalte 5: Aktion */}
            <div className="shrink-0 lg:text-right">
              <Button
                variant={selectedTicketId === ticket.id ? 'default' : 'outline'}
                className={cn('rounded-xl w-full lg:w-auto', selectedTicketId === ticket.id ? 'bg-[#FF4B2C] text-white hover:bg-[#E03A1E]' : 'border-slate-200')}
                onClick={() => onSelect(ticket.id)}
              >
                Öffnen
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketListTable;