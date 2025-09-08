"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "Jan", profit: 1860 },
  { month: "Fev", profit: 3050 },
  { month: "Mar", profit: 2370 },
  { month: "Abr", profit: 730 },
  { month: "Mai", profit: 2090 },
  { month: "Jun", profit: 2140 },
  { month: "Jul", profit: 2500 },
  { month: "Ago", profit: 3200 },
  { month: "Set", profit: 2800 },
  { month: "Out", profit: 3500 },
  { month: "Nov", profit: 4100 },
  { month: "Dez", profit: 4500 },
];

const chartConfig = {
  profit: {
    label: "Lucro",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function ProfitTrendChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
          top: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `R$${Math.floor(value / 1000)}k`}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
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
  )
}
