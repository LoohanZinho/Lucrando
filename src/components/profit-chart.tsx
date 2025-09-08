"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
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
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickFormatter={(value) => `R$${value}`}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={50}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent
            indicator="line"
            formatter={(value, name, item) => (
              <>
                <span className="font-bold text-foreground">R${item.payload.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </>
            )}
          />}
        />
        <Line dataKey="profit" type="monotone" stroke="var(--color-profit)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}
