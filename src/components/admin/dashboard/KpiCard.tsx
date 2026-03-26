import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
};

const KpiCard = ({ title, value, description, icon: Icon }: KpiCardProps) => {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</div>
          <div className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-900">{value}</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF4B2C]/10 text-[#FF4B2C]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
