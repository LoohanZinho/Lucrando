"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfitChart } from "@/components/profit-chart";

interface ProfitTrendAnalysisProps {
    data: { month: string; profit: number }[];
    periodLabel: string;
}

export function ProfitTrendAnalysis({ data, periodLabel }: ProfitTrendAnalysisProps) {
    return (
        <Card className="w-full max-w-full overflow-hidden lg:col-span-5">
            <CardHeader>
                <CardTitle>Análise de Tendência de Lucro</CardTitle>
                <p className="text-sm text-muted-foreground">Exibindo lucro para: {periodLabel}.</p>
            </CardHeader>
            <CardContent className="px-2"> {/* px-2 ao invés de apenas pl-2 evita empurrar só um lado */}
                <div className="w-full max-w-full overflow-hidden">
                    <ProfitChart data={data} />
                </div>
            </CardContent>
        </Card>
    );
}
