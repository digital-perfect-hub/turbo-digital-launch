import { AreaChart, Card } from "@tremor/react";

type LeadsTrendChartProps = {
  data: Array<{ date: string; Leads: number; Views: number }>;
};

const LeadsTrendChart = ({ data }: LeadsTrendChartProps) => {
  return (
    <Card className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Trend</div>
        <h3 className="mt-2 text-xl font-bold text-slate-900">Leads & Views der letzten 14 Tage</h3>
      </div>
      <AreaChart data={data} index="date" categories={["Views", "Leads"]} yAxisWidth={42} showLegend className="h-72" />
    </Card>
  );
};

export default LeadsTrendChart;
