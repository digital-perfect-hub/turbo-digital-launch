import { useState } from 'react';
import { FilePenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type InternalNoteComposerProps = {
  onSubmit: (message: string) => Promise<void> | void;
  disabled?: boolean;
};

const InternalNoteComposer = ({ onSubmit, disabled }: InternalNoteComposerProps) => {
  const [message, setMessage] = useState('');

  return (
    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 text-sm font-bold text-slate-900">Interne Notiz</div>
      <Textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} className="rounded-2xl border-amber-200 bg-white" placeholder="Nur intern sichtbar – nicht für Kunden." />
      <div className="mt-3 flex justify-end">
        <Button
          variant="outline"
          className="rounded-xl border-amber-200 bg-white text-amber-700 hover:bg-amber-100"
          disabled={disabled || !message.trim()}
          onClick={async () => {
            await onSubmit(message.trim());
            setMessage('');
          }}
        >
          <FilePenLine size={16} className="mr-2" /> Notiz speichern
        </Button>
      </div>
    </div>
  );
};

export default InternalNoteComposer;
