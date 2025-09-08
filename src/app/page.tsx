import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics";
import { ProfitTrendChart } from "@/components/dashboard/profit-trend-chart";
import { TopInfluencersTable } from "@/components/dashboard/top-influencers-table";
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
            <OverviewCards />

            <div className="grid gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-2">
                <PerformanceMetrics />
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Análise de Tendência de Lucro</CardTitle>
                        <CardDescription>Lucro mensal ao longo do ano.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ProfitTrendChart />
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Top Influenciadores</CardTitle>
                  <CardDescription>Ranking dos influenciadores com melhor performance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopInfluencersTable />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Funil de Conversão</CardTitle>
                  <CardDescription>Jornada do usuário do clique à venda.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ConversionFunnel />
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
