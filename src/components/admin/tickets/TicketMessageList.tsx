import type { TicketMessageRecord } from '@/lib/support';
import { cn } from '@/lib/utils';

type TicketMessageListProps = {
  messages: TicketMessageRecord[];
};

const TicketMessageList = ({ messages }: TicketMessageListProps) => {
  if (!messages.length) {
    return <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Noch keine Nachrichten.</div>;
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <article
          key={message.id}
          className={cn(
            'min-w-0 overflow-hidden rounded-[1.25rem] border px-4 py-4',
            message.is_internal_note ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white',
          )}
        >
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            <span className="max-w-full break-words">{message.author_type}</span>
            {message.is_internal_note ? <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] text-amber-700">Intern</span> : null}
            <span className="max-w-full break-words">{new Date(message.created_at || Date.now()).toLocaleString('de-AT')}</span>
          </div>
          <div className="mt-3 min-w-0 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 [overflow-wrap:anywhere]">
            {message.message}
          </div>
        </article>
      ))}
    </div>
  );
};

export default TicketMessageList;
