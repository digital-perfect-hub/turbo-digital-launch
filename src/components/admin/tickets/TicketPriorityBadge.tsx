import { cn } from '@/lib/utils';
import { getTicketPriorityLabel, getTicketPriorityTone } from '@/lib/support';

type TicketPriorityBadgeProps = {
  value?: string | null;
  className?: string;
};

const TicketPriorityBadge = ({ value, className }: TicketPriorityBadgeProps) => {
  return (
    <span className={cn('inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]', getTicketPriorityTone(value), className)}>
      {getTicketPriorityLabel(value)}
    </span>
  );
};

export default TicketPriorityBadge;
