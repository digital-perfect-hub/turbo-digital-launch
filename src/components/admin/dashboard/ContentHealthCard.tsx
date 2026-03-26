type ContentHealthCardProps = {
  pagesLive: number;
  pagesDraft: number;
  products: number;
};

const ContentHealthCard = ({ pagesLive, pagesDraft, products }: ContentHealthCardProps) => {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Content Health</div>
      <h3 className="mt-2 text-xl font-bold text-slate-900">Publishing-Status</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Live</div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-900">{pagesLive}</div>
        </div>
        <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Entwürfe</div>
          <div className="mt-2 text-2xl font-extrabold text-amber-900">{pagesDraft}</div>
        </div>
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Produkte</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{products}</div>
        </div>
      </div>
    </div>
  );
};

export default ContentHealthCard;
