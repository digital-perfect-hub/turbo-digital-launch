import { cn } from '@/lib/utils';
import { getTicketStatusLabel, getTicketStatusTone } from '@/lib/support';

type TicketStatusBadgeProps = {
  value?: string | null;
  className?: string;
};

const TicketStatusBadge = ({ value, className }: TicketStatusBadgeProps) => {
  return (
    <span className={cn('inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]', getTicketStatusTone(value), className)}>
      {getTicketStatusLabel(value)}
    </span>
  );
};

export default TicketStatusBadge;
