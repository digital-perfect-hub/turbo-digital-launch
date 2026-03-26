import type { TicketAttachmentRecord, TicketEventRecord, TicketMessageRecord, TicketRecord } from '@/lib/support';

export type TicketDetailResult = {
  ticket: TicketRecord;
  messages: TicketMessageRecord[];
  attachments: TicketAttachmentRecord[];
  events: TicketEventRecord[];
};
