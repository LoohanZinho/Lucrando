"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Activity,
  ArrowUpRight,
  Target,
  ShoppingCart,
  Percent,
} from "lucide-react";
import { ProfitChart } from "@/components/profit-chart";


export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$45.231,89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% do último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$12.873,45</div>
            <p className="text-xs text-muted-foreground">
              +12.5% do último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$32.358,44</div>
            <p className="text-xs text-muted-foreground">
              +23.8% do último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">251%</div>
            <p className="text-xs text-muted-foreground">
              +15.2% do último mês
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Análise de Performance</CardTitle>
            <CardDescription>Métricas chave de performance da campanha.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>ROAS</span>
              </div>
              <div className="text-3xl font-bold">5.2x</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span>8% vs. mês passado</span>
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span>Taxa de Conversão</span>
              </div>
              <div className="text-3xl font-bold">3.2%</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span>12% vs. mês passado</span>
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>CPA (Custo por Aquisição)</span>
              </div>
              <div className="text-3xl font-bold">R$45,50</div>
               <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 text-red-500 mr-1 rotate-180" />
                <span>5% vs. mês passado</span>
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span>Ticket Médio</span>
              </div>
              <div className="text-3xl font-bold">R$189,90</div>
               <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span>3% vs. mês passado</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Análise de Tendência de Lucro</CardTitle>
            <CardDescription>Lucro mensal ao longo do ano.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfitChart />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
