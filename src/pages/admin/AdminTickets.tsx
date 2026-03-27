import { useEffect, useMemo, useState } from 'react';
import { LifeBuoy, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModuleLockedState } from '@/components/admin/ModuleLockedState';
import KpiCard from '@/components/admin/dashboard/KpiCard';
import TicketDetailPanel from '@/components/admin/tickets/TicketDetailPanel';
import TicketFilters from '@/components/admin/tickets/TicketFilters';
import TicketListTable from '@/components/admin/tickets/TicketListTable';
import { useSiteModules } from '@/hooks/useSiteModules';
import { useTicketDetail } from '@/hooks/useTicketDetail';
import { useTickets } from '@/hooks/useTickets';
import { useSupportSettings } from '@/hooks/useSupportSettings';
import { TICKET_CATEGORY_OPTIONS, TICKET_PRIORITY_OPTIONS } from '@/lib/support';

const AdminTickets = () => {
  const { hasSupportDesk } = useSiteModules();
  const { settings } = useSupportSettings();
  const {
    tickets,
    isLoading,
    kpis,
    createTicketMutation,
    addMessageMutation,
    updateTicketMutation,
    uploadAttachmentMutation,
    escalateTicketMutation,
  } = useTickets();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    subject: '',
    category: 'technical',
    priority: 'normal',
    message: '',
  });

  const detailQuery = useTicketDetail(selectedTicketId);
  const isMutating = createTicketMutation.isPending || addMessageMutation.isPending || updateTicketMutation.isPending || uploadAttachmentMutation.isPending || escalateTicketMutation.isPending;

  const filteredTickets = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false;
      if (!needle) return true;
      return [ticket.subject, ticket.requester_name, ticket.requester_email, ticket.requester_phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter]);


  useEffect(() => {
    if (!filteredTickets.length) {
      if (selectedTicketId !== null) setSelectedTicketId(null);
      return;
    }

    if (!selectedTicketId || !filteredTickets.some((ticket) => ticket.id === selectedTicketId)) {
      setSelectedTicketId(filteredTickets[0].id);
    }
  }, [filteredTickets, selectedTicketId]);

  if (!hasSupportDesk) {
    return (
      <ModuleLockedState
        moduleName="Support Desk"
        title="Das Ticket-System ist für diese Site noch nicht freigeschaltet"
        description="Aktiviere zuerst das Modul im Bereich Sites & White-Label. Danach greifen Routing, Hybrid-Eskalation und die öffentliche Support-Box automatisch in die bestehende SaaS-Logik."
        canSelfActivate
      />
    );
  }

  return (
    <div className="max-w-7xl p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF4B2C] shadow-sm">
            <Sparkles size={14} /> Support Desk
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-900">Tickets & Eskalation</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">Mandantenfähiger Support auf Basis eurer Site- und Rollenlogik. Aktueller Modus: <strong>{settings.support_mode}</strong>.</p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]"><Plus size={16} className="mr-2" /> Ticket anlegen</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-[2rem] border-slate-200">
            <DialogHeader>
              <DialogTitle>Neues Ticket erstellen</DialogTitle>
              <DialogDescription>Wird direkt der aktiven Site und dem aktuellen Support-Flow zugeordnet.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Name</Label><Input value={createForm.requesterName} onChange={(event) => setCreateForm((prev) => ({ ...prev, requesterName: event.target.value }))} className="rounded-xl border-slate-200" /></div>
              <div className="space-y-2"><Label>E-Mail</Label><Input value={createForm.requesterEmail} onChange={(event) => setCreateForm((prev) => ({ ...prev, requesterEmail: event.target.value }))} className="rounded-xl border-slate-200" /></div>
              <div className="space-y-2"><Label>Telefon</Label><Input value={createForm.requesterPhone} onChange={(event) => setCreateForm((prev) => ({ ...prev, requesterPhone: event.target.value }))} className="rounded-xl border-slate-200" /></div>
              <div className="space-y-2"><Label>Kategorie</Label>
                <Select value={createForm.category} onValueChange={(value) => setCreateForm((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent>{TICKET_CATEGORY_OPTIONS.map((entry) => <SelectItem key={entry.value} value={entry.value}>{entry.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2"><Label>Betreff</Label><Input value={createForm.subject} onChange={(event) => setCreateForm((prev) => ({ ...prev, subject: event.target.value }))} className="rounded-xl border-slate-200" /></div>
              <div className="space-y-2"><Label>Priorität</Label>
                <Select value={createForm.priority} onValueChange={(value) => setCreateForm((prev) => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent>{TICKET_PRIORITY_OPTIONS.map((entry) => <SelectItem key={entry.value} value={entry.value}>{entry.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2"><Label>Erstnachricht</Label><Textarea rows={6} value={createForm.message} onChange={(event) => setCreateForm((prev) => ({ ...prev, message: event.target.value }))} className="rounded-2xl border-slate-200" /></div>
            </div>
            <div className="flex justify-end">
              <Button
                className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]"
                disabled={createTicketMutation.isPending || !createForm.requesterName.trim() || !createForm.requesterEmail.trim() || !createForm.subject.trim() || !createForm.message.trim()}
                onClick={() => createTicketMutation.mutate({
                  requesterName: createForm.requesterName,
                  requesterEmail: createForm.requesterEmail,
                  requesterPhone: createForm.requesterPhone,
                  subject: createForm.subject,
                  category: createForm.category as any,
                  priority: createForm.priority as any,
                  message: createForm.message,
                }, {
                  onSuccess: (ticket) => {
                    setSelectedTicketId(ticket.id);
                    setCreateOpen(false);
                    setCreateForm({ requesterName: '', requesterEmail: '', requesterPhone: '', subject: '', category: 'technical', priority: 'normal', message: '' });
                    toast.success('Ticket erstellt.');
                  },
                  onError: (error: any) => toast.error(error?.message || 'Ticket konnte nicht erstellt werden.'),
                })}
              >
                <LifeBuoy size={16} className="mr-2" /> Ticket erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Offen" value={kpis.open} description="Neue und noch nicht bearbeitete Tickets." icon={LifeBuoy} />
        <KpiCard title="High / Urgent" value={kpis.urgent} description="Tickets mit erhöhter Dringlichkeit." icon={Sparkles} />
        <KpiCard title="Zugewiesen" value={kpis.assigned} description="Tickets mit hinterlegtem Owner/User." icon={LifeBuoy} />
        <KpiCard title="Heute neu" value={kpis.today} description="Heute eingegangene Tickets." icon={LifeBuoy} />
      </div>

      <Card className="mt-6 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <TicketFilters
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            priority={priorityFilter}
            onPriorityChange={setPriorityFilter}
            category={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="min-w-0 space-y-4">
          {isLoading ? <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Tickets werden geladen…</div> : <TicketListTable tickets={filteredTickets} selectedTicketId={selectedTicketId} onSelect={setSelectedTicketId} />}
        </section>

        <section className="min-w-0">
          <TicketDetailPanel
            detail={detailQuery.data ?? null}
            isLoading={detailQuery.isLoading}
            isMutating={isMutating}
            canEscalate={settings.allow_platform_escalation || settings.support_mode === 'hybrid'}
            onReply={async (message) => {
              if (!selectedTicketId) return;
              await addMessageMutation.mutateAsync({ ticketId: selectedTicketId, message, isInternalNote: false });
              toast.success('Antwort gespeichert.');
            }}
            onInternalNote={async (message) => {
              if (!selectedTicketId) return;
              await addMessageMutation.mutateAsync({ ticketId: selectedTicketId, message, isInternalNote: true });
              toast.success('Interne Notiz gespeichert.');
            }}
            onUpdateStatus={async (patch) => {
              if (!selectedTicketId) return;
              await updateTicketMutation.mutateAsync({
                ticketId: selectedTicketId,
                patch,
                eventType: 'ticket_updated',
                eventPayload: patch,
              });
              toast.success('Ticket aktualisiert.');
            }}
            onEscalate={async () => {
              if (!selectedTicketId) return;
              await escalateTicketMutation.mutateAsync(selectedTicketId);
              toast.success('Ticket an die Plattform eskaliert.');
            }}
            onAttachmentUpload={async (file) => {
              if (!selectedTicketId) return;
              await uploadAttachmentMutation.mutateAsync({ ticketId: selectedTicketId, file });
              toast.success('Attachment hochgeladen.');
            }}
          />
        </section>
      </div>
    </div>
  );
};

export default AdminTickets;
