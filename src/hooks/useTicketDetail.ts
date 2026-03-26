import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createSupportAttachmentSignedUrl } from '@/lib/storage';
import { mapTicket, mapTicketAttachment, mapTicketEvent, mapTicketMessage } from '@/lib/support';

export const useTicketDetail = (ticketId?: string | null) => {
  return useQuery({
    queryKey: ['ticket-detail', ticketId],
    enabled: Boolean(ticketId),
    queryFn: async () => {
      const [ticketRes, messagesRes, attachmentsRes, eventsRes] = await Promise.all([
        supabase.from('tickets' as never).select('*').eq('id', ticketId as string).single(),
        supabase.from('ticket_messages' as never).select('*').eq('ticket_id', ticketId as string).order('created_at', { ascending: true }),
        supabase.from('ticket_attachments' as never).select('*').eq('ticket_id', ticketId as string).order('created_at', { ascending: true }),
        supabase.from('ticket_events' as never).select('*').eq('ticket_id', ticketId as string).order('created_at', { ascending: false }),
      ]);

      if (ticketRes.error) throw ticketRes.error;
      if (messagesRes.error) throw messagesRes.error;
      if (attachmentsRes.error) throw attachmentsRes.error;
      if (eventsRes.error) throw eventsRes.error;

      const attachments = await Promise.all(
        (((attachmentsRes.data as Record<string, unknown>[] | null) ?? []).map(async (row) => {
          const attachment = mapTicketAttachment(row);
          try {
            attachment.signed_url = await createSupportAttachmentSignedUrl(attachment.storage_path);
          } catch {
            attachment.signed_url = null;
          }
          return attachment;
        })),
      );

      return {
        ticket: mapTicket(ticketRes.data as Record<string, unknown>),
        messages: (((messagesRes.data as Record<string, unknown>[] | null) ?? []).map(mapTicketMessage)),
        attachments,
        events: (((eventsRes.data as Record<string, unknown>[] | null) ?? []).map(mapTicketEvent)),
      };
    },
  });
};
