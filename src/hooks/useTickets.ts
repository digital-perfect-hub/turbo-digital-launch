import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContext } from '@/context/SiteContext';
import { useSupportOrganizations } from '@/hooks/useSupportOrganizations';
import { uploadSupportAttachment } from '@/lib/storage';
import {
  mapTicket,
  type TicketCategory,
  type TicketPriority,
  type TicketRecord,
} from '@/lib/support';
import { DEFAULT_SITE_ID } from '@/lib/site';

export const useTickets = () => {
  const queryClient = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const { platformOrganization } = useSupportOrganizations();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const ticketsQuery = useQuery({
    queryKey: ['tickets', siteId],
    enabled: Boolean(siteId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets' as never)
        .select('*')
        .eq('site_id', siteId)
        .order('updated_at', { ascending: false });

      if (error) {
        const code = typeof (error as any)?.code === 'string' ? (error as any).code : '';
        if (code === '42P01' || code === 'PGRST205') return [] as TicketRecord[];
        throw error;
      }

      return ((data as Record<string, unknown>[] | null) ?? []).map(mapTicket);
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async ({
      requesterName,
      requesterEmail,
      requesterPhone,
      subject,
      category,
      message,
      priority,
    }: {
      requesterName: string;
      requesterEmail: string;
      requesterPhone?: string | null;
      subject: string;
      category: TicketCategory;
      message: string;
      priority: TicketPriority;
    }) => {
      const { data: newTicketId, error: rpcError } = await (supabase as any).rpc('create_support_ticket', {
        p_site_id: siteId,
        p_requester_name: requesterName,
        p_requester_email: requesterEmail,
        p_requester_phone: requesterPhone || null,
        p_subject: subject,
        p_category: category,
        p_message: message,
        p_source: 'admin',
        p_priority: priority,
      });

      if (rpcError) throw rpcError;
      if (!newTicketId) throw new Error('Ticket konnte nicht erstellt werden (keine ID zurückgegeben).');

      const { data: ticketData, error: fetchError } = await supabase
        .from('tickets' as never)
        .select('*')
        .eq('id', newTicketId as string)
        .single();

      if (fetchError) throw fetchError;

      return mapTicket(ticketData as Record<string, unknown>);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tickets', siteId] });
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({
      ticketId,
      message,
      isInternalNote,
    }: {
      ticketId: string;
      message: string;
      isInternalNote: boolean;
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      const { error } = await supabase.from('ticket_messages' as never).insert({
        ticket_id: ticketId,
        author_user_id: user?.id ?? null,
        author_type: isInternalNote ? 'agent' : 'site_user',
        message,
        is_internal_note: isInternalNote,
      } as never);
      if (error) throw error;

      await supabase.from('ticket_events' as never).insert({
        ticket_id: ticketId,
        event_type: isInternalNote ? 'internal_note_added' : 'reply_added',
        performed_by_user_id: user?.id ?? null,
        payload: { internal: isInternalNote },
      } as never);
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets', siteId] }),
        queryClient.invalidateQueries({ queryKey: ['ticket-detail', variables.ticketId] }),
      ]);
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({
      ticketId,
      patch,
      eventType,
      eventPayload,
    }: {
      ticketId: string;
      patch: Partial<Pick<TicketRecord, 'status' | 'priority' | 'assigned_to_user_id' | 'support_organization_id' | 'escalated_to_platform'>>;
      eventType?: string;
      eventPayload?: Record<string, unknown>;
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      const { error } = await supabase.from('tickets' as never).update(patch as never).eq('id', ticketId);
      if (error) throw error;

      if (eventType) {
        await supabase.from('ticket_events' as never).insert({
          ticket_id: ticketId,
          event_type: eventType,
          performed_by_user_id: user?.id ?? null,
          payload: eventPayload ?? {},
        } as never);
      }
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets', siteId] }),
        queryClient.invalidateQueries({ queryKey: ['ticket-detail', variables.ticketId] }),
      ]);
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ ticketId, file }: { ticketId: string; file: File }) => {
      const user = (await supabase.auth.getUser()).data.user;
      const storagePath = await uploadSupportAttachment(ticketId, file);
      const { error } = await supabase.from('ticket_attachments' as never).insert({
        ticket_id: ticketId,
        storage_path: storagePath,
        filename: file.name,
        mime_type: file.type || null,
        size_bytes: file.size,
      } as never);
      if (error) throw error;

      await supabase.from('ticket_events' as never).insert({
        ticket_id: ticketId,
        event_type: 'attachment_added',
        performed_by_user_id: user?.id ?? null,
        payload: { filename: file.name, size: file.size },
      } as never);
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets', siteId] }),
        queryClient.invalidateQueries({ queryKey: ['ticket-detail', variables.ticketId] }),
      ]);
    },
  });

  const escalateTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      let platformOrgId = platformOrganization?.id ?? null;
      if (!platformOrgId) {
        const { data, error } = await (supabase as any).rpc('platform_support_organization_id');
        if (error) throw error;
        platformOrgId = typeof data === 'string' ? data : null;
      }
      if (!platformOrgId) throw new Error('Keine Plattform-Support-Organisation gefunden.');
      return updateTicketMutation.mutateAsync({
        ticketId,
        patch: {
          support_organization_id: platformOrgId,
          escalated_to_platform: true,
          status: 'in_progress',
        },
        eventType: 'escalated_to_platform',
        eventPayload: { support_organization_id: platformOrgId },
      });
    },
  });

  const kpis = useMemo(() => {
    const tickets = ticketsQuery.data ?? [];
    return {
      open: tickets.filter((entry) => entry.status === 'open').length,
      urgent: tickets.filter((entry) => entry.priority === 'urgent' || entry.priority === 'high').length,
      assigned: tickets.filter((entry) => Boolean(entry.assigned_to_user_id)).length,
      today: tickets.filter((entry) => entry.created_at?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
    };
  }, [ticketsQuery.data]);

  return {
    ...ticketsQuery,
    siteId,
    tickets: ticketsQuery.data ?? [],
    kpis,
    createTicketMutation,
    addMessageMutation,
    updateTicketMutation,
    uploadAttachmentMutation,
    escalateTicketMutation,
  };
};