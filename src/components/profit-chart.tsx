
"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  profit: {
    label: "Lucro",
    color: "hsl(var(--chart-1))",
  },
};

export function ProfitChart({ data }: { data: { month: string, profit: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <AreaChart
        data={data}
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
          tickFormatter={(value) => {
            if (typeof value === 'number') {
               return `R$${value / 1000}k`;
            }
            return `${value}`;
          }}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={50}
        />
        <Tooltip
          cursor={true}
          content={<ChartTooltipContent
            indicator="dot"
            labelFormatter={(value, payload) => {
              const data = payload?.[0]?.payload;
              return data?.month;
            }}
            formatter={(value, name, item) => (
              <>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: "hsl(var(--chart-1))"}} />
                    <span className="capitalize">Lucro</span>
                    <span className="font-bold text-foreground ml-auto">
                        {typeof value === 'number' ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </span>
                </div>
              </>
            )}
            
          />}
        />
        <defs>
          <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-profit)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-profit)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="profit"
          type="natural"
          fill="url(#fillProfit)"
          stroke="var(--color-profit)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
