type SiteModuleCardProps = {
  activeModules: string[];
};

const SiteModuleCard = ({ activeModules }: SiteModuleCardProps) => {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Entitlements</div>
      <h3 className="mt-2 text-xl font-bold text-slate-900">Aktive Module</h3>
      <div className="mt-5 flex flex-wrap gap-2">
        {activeModules.length ? activeModules.map((module) => (
          <span key={module} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
            {module}
          </span>
        )) : <span className="text-sm text-slate-500">Keine Module aktiv.</span>}
      </div>
    </div>
  );
};

export default SiteModuleCard;
