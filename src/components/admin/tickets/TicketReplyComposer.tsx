import { useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type TicketReplyComposerProps = {
  onSubmit: (message: string) => Promise<void> | void;
  disabled?: boolean;
};

const TicketReplyComposer = ({ onSubmit, disabled }: TicketReplyComposerProps) => {
  const [message, setMessage] = useState('');

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-sm font-bold text-slate-900">Öffentliche Antwort</div>
      <Textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} className="rounded-2xl border-slate-200 bg-white" placeholder="Antwort an den Kunden oder die Agentur…" />
      <div className="mt-3 flex justify-end">
        <Button
          className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]"
          disabled={disabled || !message.trim()}
          onClick={async () => {
            await onSubmit(message.trim());
            setMessage('');
          }}
        >
          <SendHorizonal size={16} className="mr-2" /> Antwort senden
        </Button>
      </div>
    </div>
  );
};

export default TicketReplyComposer;
