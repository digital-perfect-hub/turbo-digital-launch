type PlanStatusCardProps = {
  planName: string;
  status: string;
  renewalLabel: string;
};

const PlanStatusCard = ({ planName, status, renewalLabel }: PlanStatusCardProps) => {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Billing</div>
      <h3 className="mt-2 text-xl font-bold text-slate-900">Aktiver Plan</h3>
      <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{planName}</div>
            <p className="mt-1 text-sm text-slate-500">{renewalLabel}</p>
          </div>
          <span className="rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#FF4B2C]">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanStatusCard;
