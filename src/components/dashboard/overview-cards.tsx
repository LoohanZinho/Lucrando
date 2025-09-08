import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, TrendingUp, Activity } from "lucide-react";

const metrics = [
  {
    title: "Receita Total",
    value: "R$ 45.231,89",
    change: "+20.1% do último mês",
    icon: DollarSign,
  },
  {
    title: "Despesas Totais",
    value: "R$ 12.124,50",
    change: "+15% do último mês",
    icon: DollarSign,
  },
  {
    title: "Lucro",
    value: "R$ 33.107,39",
    change: "+22.5% do último mês",
    icon: TrendingUp,
  },
  {
    title: "ROI",
    value: "273%",
    change: "+45% do último mês",
    icon: Activity,
  },
];

export function OverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
