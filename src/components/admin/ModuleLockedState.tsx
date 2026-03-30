import { Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type ModuleLockedStateProps = {
  moduleName: string;
  title: string;
  description: string;
  canSelfActivate?: boolean;
};

const ModuleLockedState = ({
  moduleName,
  title,
  description,
  canSelfActivate = false,
}: ModuleLockedStateProps) => {
  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-600">
                <Lock className="h-3.5 w-3.5 text-[#FF4B2C]" />
                Modul gesperrt
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h1>
              <p className="mt-4 text-base leading-8 text-slate-600">{description}</p>
            </div>

            <div className="w-full max-w-sm rounded-[1.75rem] border border-[#FF4B2C]/20 bg-[#FFF7F4] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF4B2C] text-white shadow-lg shadow-[#FF4B2C]/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF4B2C]">Upsell</p>
                  <p className="mt-2 text-lg font-black text-slate-950">Dieses Modul ist in deinem aktuellen Plan nicht aktiv.</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Jetzt für 9,99€ / Monat freischalten.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-600">
                  <strong className="text-slate-950">{moduleName}</strong>
                  <div className="mt-2">Aktivierung erfolgt zentral über dein SaaS-Entitlement pro Site.</div>
                </div>

                {canSelfActivate ? (
                  <Button asChild className="w-full rounded-2xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]">
                    <Link to="/admin/sites">Jetzt im Super-Admin freischalten</Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full rounded-2xl bg-slate-200 text-slate-600 opacity-100">
                    Upgrade anfragen
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-white/45 backdrop-blur-[3px]" />
          <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="h-4 w-24 rounded-full bg-slate-200" />
                <div className="mt-4 h-8 w-3/4 rounded-full bg-slate-200" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 rounded-full bg-slate-200" />
                  <div className="h-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-2/3 rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ModuleLockedState };
export default ModuleLockedState;
