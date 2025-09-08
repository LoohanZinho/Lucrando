"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const profitData = [
  { month: "Jan", profit: 186 },
  { month: "Fev", profit: 305 },
  { month: "Mar", profit: 237 },
  { month: "Abr", profit: 173 },
  { month: "Mai", profit: 209 },
  { month: "Jun", profit: 214 },
  { month: "Jul", profit: 250 },
  { month: "Ago", profit: 278 },
  { month: "Set", profit: 310 },
  { month: "Out", profit: 340 },
  { month: "Nov", profit: 380 },
  { month: "Dez", profit: 400 },
];

const chartConfig = {
  profit: {
    label: "Lucro",
    color: "hsl(var(--chart-1))",
  },
} satisfies import("@/components/ui/chart").ChartConfig;

export function ProfitChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart data={profitData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
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
            formatter={(value) => (
              <>
                <span className="font-bold text-foreground">R${value}</span>
              </>
            )}
          />}
        />
        <Line
          dataKey="profit"
          type="monotone"
          stroke="var(--color-profit)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
