import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CookieConsentState } from "@/lib/cookie-consent";

type CookieSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: Pick<CookieConsentState, "analytics" | "marketing">;
  onDraftChange: (next: Pick<CookieConsentState, "analytics" | "marketing">) => void;
  onSave: () => void;
};

const CookieSettingsDialog = ({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onSave,
}: CookieSettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-2xl rounded-[1.75rem] border border-white/10 bg-[#0B1020] p-0 text-white shadow-[0_40px_120px_-42px_rgba(0,0,0,0.72)]">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,75,44,0.16),rgba(14,31,83,0.24))] px-6 py-5 md:px-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF4B2C]/20 text-[#FF4B2C]">
                <ShieldCheck size={18} />
              </span>
              Cookie-Einstellungen
            </DialogTitle>
            <DialogDescription className="text-sm leading-7 text-white/70">
              Essenzielle Cookies bleiben immer aktiv. Analyse- und Marketing-Cookies werden erst nach deiner Zustimmung geladen.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-6 md:px-8 md:py-7">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label className="text-sm font-semibold text-white">Essenzielle Cookies</Label>
                <p className="mt-2 text-sm leading-7 text-white/65">
                  Notwendig für Sicherheit, Session-Stabilität, Routing und grundlegende Funktionen.
                </p>
              </div>
              <Switch checked disabled aria-label="Essenzielle Cookies immer aktiv" />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label htmlFor="cookie-analytics" className="text-sm font-semibold text-white">
                  Analyse & Tracking
                </Label>
                <p className="mt-2 text-sm leading-7 text-white/65">
                  Aktiviert Tracking-Skripte aus den globalen Settings erst nach aktiver Zustimmung.
                </p>
              </div>
              <Switch
                id="cookie-analytics"
                checked={draft.analytics}
                onCheckedChange={(checked) => onDraftChange({ ...draft, analytics: checked })}
                aria-label="Analyse Cookies"
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label htmlFor="cookie-marketing" className="text-sm font-semibold text-white">
                  Marketing
                </Label>
                <p className="mt-2 text-sm leading-7 text-white/65">
                  Reserviert für zusätzliche Retargeting- und Kampagnen-Skripte. Aktuell werden Tracking-Codes gemeinsam über die Consent-Schicht freigeschaltet.
                </p>
              </div>
              <Switch
                id="cookie-marketing"
                checked={draft.marketing}
                onCheckedChange={(checked) => onDraftChange({ ...draft, marketing: checked })}
                aria-label="Marketing Cookies"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]" onClick={onSave}>
              Auswahl speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookieSettingsDialog;
