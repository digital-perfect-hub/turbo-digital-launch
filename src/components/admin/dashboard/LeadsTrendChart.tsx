import type { TooltipProps } from 'recharts';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

type LeadsTrendChartProps = {
  data: Array<{ date: string; Leads: number; Views: number }>;
};

const chartConfig = {
  Views: {
    label: 'Views',
    color: '#94A3B8',
  },
  Leads: {
    label: 'Leads',
    color: '#FF4B2C',
  },
} as const;

const CustomLeadsTrendTooltip = ({ active, label, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="pointer-events-none z-50 max-w-[18rem] rounded-2xl border border-border/50 bg-background px-3 py-2 shadow-lg shadow-slate-900/10">
      <div className="whitespace-normal text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-start justify-between gap-3 whitespace-normal text-sm text-foreground">
            <div className="flex min-w-0 items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color || undefined }} />
              <span className="break-words font-medium">{entry.name}</span>
            </div>
            <span className="shrink-0 font-semibold">{Number(entry.value ?? 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LeadsTrendChart = ({ data }: LeadsTrendChartProps) => {
  return (
    <Card className="relative isolate overflow-visible rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Trend</div>
        <h3 className="mt-2 text-xl font-bold text-slate-900">Leads & Views der letzten 14 Tage</h3>
      </div>

      <ChartContainer config={chartConfig} className="h-72 w-full overflow-visible">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="leadsGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-Leads)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-Leads)" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="viewsGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-Views)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--color-Views)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={16}
          />
          <ChartTooltip cursor={false} wrapperStyle={{ zIndex: 50 }} content={<CustomLeadsTrendTooltip />} />
          <Area
            type="monotone"
            dataKey="Views"
            name="Views"
            stroke="var(--color-Views)"
            strokeWidth={2}
            fill="url(#viewsGradient)"
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="Leads"
            name="Leads"
            stroke="var(--color-Leads)"
            strokeWidth={2.5}
            fill="url(#leadsGradient)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
};

export default LeadsTrendChart;
