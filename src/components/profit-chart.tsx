
"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  profit: {
    label: "Lucro",
    color: "hsl(var(--chart-1))",
  },
  positive: {
    label: "Lucro",
    color: "hsl(var(--chart-1))",
  },
  negative: {
    label: "Prejuízo",
    color: "hsl(var(--destructive))",
  },
};

export function ProfitChart({ data }: { data: { month: string, profit: number }[] }) {

  // Split data into positive and negative ranges for correct area fill
  const splitData = data.map(item => ({
    ...item,
    positive: item.profit >= 0 ? item.profit : 0,
    negative: item.profit < 0 ? item.profit : 0,
  }));

  const formatYAxisTick = (value: number | string) => {
    if (typeof value !== 'number') return value;

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    
    if (absValue >= 1000) {
      return `${sign}R$${(absValue / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`;
    }
    return `${sign}R$${absValue.toLocaleString('pt-BR')}`;
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <AreaChart
        data={splitData}
        margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
        accessibilityLayer
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          domain={['dataMin', 'dataMax']}
          allowDataOverflow
          tickFormatter={formatYAxisTick}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={80} // Increased width to accommodate labels like R$-1.1k
        />
        <Tooltip
          cursor={true}
          content={<ChartTooltipContent
            indicator="dot"
            labelFormatter={(value, payload) => {
              return payload?.[0]?.payload?.month;
            }}
            formatter={(value, name, item, index, payload) => {
              const originalProfit = item?.payload?.profit;
              
              if (name === 'positive' && originalProfit > 0) {
                const color = "hsl(var(--chart-1))";
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: color}} />
                        <span className="capitalize">Lucro</span>
                        <span className="font-bold text-foreground ml-auto">
                            {typeof originalProfit === 'number' ? `R$ ${originalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </span>
                    </div>
                )
              }
               if (name === 'negative' && originalProfit < 0) {
                const color = "hsl(var(--destructive))";
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: color}} />
                        <span className="capitalize">Lucro</span>
                        <span className="font-bold text-foreground ml-auto">
                            {typeof originalProfit === 'number' ? `R$ ${originalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </span>
                    </div>
                )
              }

              return null;
            }}
          />}
        />
        
        <defs>
          <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-positive)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-positive)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillNegative" x1="0" y1="0" x2="0" y2="1">
             <stop
              offset="5%"
              stopColor="var(--color-negative)"
              stopOpacity={0.1}
            />
            <stop
              offset="95%"
              stopColor="var(--color-negative)"
              stopOpacity={0.8}
            />
          </linearGradient>
        </defs>

        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
        
        <Area
          dataKey="positive"
          type="monotone"
          fill="url(#fillPositive)"
          stroke="var(--color-positive)"
          stackId="a"
        />
         <Area
          dataKey="negative"
          type="monotone"
          fill="url(#fillNegative)"
          stroke="var(--color-negative)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
