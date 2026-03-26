import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS } from '@/lib/support';
import type { TicketPriority, TicketStatus } from '@/lib/support';

type TicketAssignmentBarProps = {
  status: TicketStatus;
  priority: TicketPriority;
  assignedToUserId: string | null;
  onStatusChange: (value: TicketStatus) => void;
  onPriorityChange: (value: TicketPriority) => void;
  onAssignedToUserIdChange: (value: string | null) => void;
};

const TicketAssignmentBar = ({
  status,
  priority,
  assignedToUserId,
  onStatusChange,
  onPriorityChange,
  onAssignedToUserIdChange,
}: TicketAssignmentBarProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(value) => onStatusChange(value as TicketStatus)}>
          <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TICKET_STATUS_OPTIONS.map((entry) => <SelectItem key={entry.value} value={entry.value}>{entry.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Priorität</Label>
        <Select value={priority} onValueChange={(value) => onPriorityChange(value as TicketPriority)}>
          <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TICKET_PRIORITY_OPTIONS.map((entry) => <SelectItem key={entry.value} value={entry.value}>{entry.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Zuständig (User-ID optional)</Label>
        <Input value={assignedToUserId || ''} onChange={(event) => onAssignedToUserIdChange(event.target.value.trim() || null)} className="rounded-xl border-slate-200" placeholder="UUID des zuständigen Users" />
      </div>
    </div>
  );
};

export default TicketAssignmentBar;
