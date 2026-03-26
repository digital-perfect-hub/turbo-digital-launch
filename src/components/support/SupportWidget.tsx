import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LifeBuoy, Loader2, SendHorizonal } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContext } from '@/context/SiteContext';
import { DEFAULT_SITE_ID } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TICKET_CATEGORY_OPTIONS } from '@/lib/support';

const SupportWidget = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    requester_name: '',
    requester_email: '',
    requester_phone: '',
    subject: '',
    category: 'technical',
    message: '',
  });

  const publicSettingsQuery = useQuery({
    queryKey: ['public-support-settings', siteId],
    enabled: Boolean(siteId),
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_public_support_settings', { p_site_id: siteId });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row as Record<string, unknown> | null;
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).rpc('create_support_ticket', {
        p_site_id: siteId,
        p_requester_name: form.requester_name,
        p_requester_email: form.requester_email,
        p_requester_phone: form.requester_phone || null,
        p_subject: form.subject,
        p_category: form.category,
        p_message: form.message,
        p_source: 'widget',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Support-Anfrage gesendet.');
      setForm({ requester_name: '', requester_email: '', requester_phone: '', subject: '', category: 'technical', message: '' });
      setOpen(false);
    },
    onError: (error: any) => toast.error(error?.message || 'Ticket konnte nicht erstellt werden.'),
  });

  const publicSettings = publicSettingsQuery.data;
  const hasSupportDesk = Boolean(publicSettings?.has_support_desk);
  const widgetEnabled = publicSettings?.support_widget_enabled !== false;

  if (!hasSupportDesk || !widgetEnabled) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 z-40 rounded-full bg-[#FF4B2C] px-5 py-6 text-white shadow-[0_30px_70px_-25px_rgba(255,75,44,0.45)] hover:bg-[#E03A1E]">
          <LifeBuoy size={18} className="mr-2" /> Support
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[2rem] border-slate-200 p-0 overflow-hidden">
        <div className="bg-[#0E1F53] px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-[-0.03em]">Support anfragen</DialogTitle>
            <DialogDescription className="text-white/70">Direkt aus der Seite ein Ticket erstellen. Es landet automatisch im richtigen Support-Flow.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Name</Label><Input value={form.requester_name} onChange={(event) => setForm((prev) => ({ ...prev, requester_name: event.target.value }))} className="rounded-xl border-slate-200" /></div>
            <div className="space-y-2"><Label>E-Mail</Label><Input type="email" value={form.requester_email} onChange={(event) => setForm((prev) => ({ ...prev, requester_email: event.target.value }))} className="rounded-xl border-slate-200" /></div>
            <div className="space-y-2"><Label>Telefon</Label><Input value={form.requester_phone} onChange={(event) => setForm((prev) => ({ ...prev, requester_phone: event.target.value }))} className="rounded-xl border-slate-200" /></div>
            <div className="space-y-2"><Label>Kategorie</Label>
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORY_OPTIONS.map((entry) => <SelectItem key={entry.value} value={entry.value}>{entry.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2"><Label>Betreff</Label><Input value={form.subject} onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))} className="rounded-xl border-slate-200" /></div>
            <div className="space-y-2 md:col-span-2"><Label>Nachricht</Label><Textarea rows={6} value={form.message} onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))} className="rounded-2xl border-slate-200" /></div>
          </div>

          <div className="flex justify-end">
            <Button
              className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]"
              disabled={createTicketMutation.isPending || !form.requester_name.trim() || !form.requester_email.trim() || !form.message.trim()}
              onClick={() => createTicketMutation.mutate()}
            >
              {createTicketMutation.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <SendHorizonal size={16} className="mr-2" />} Ticket senden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportWidget;
