
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfitChart } from "@/components/profit-chart";

interface ProfitTrendAnalysisProps {
    data: { month: string; profit: number }[];
    periodLabel: string;
}

export function ProfitTrendAnalysis({ data, periodLabel }: ProfitTrendAnalysisProps) {
    return (
        <Card className="lg:col-span-5">
            <CardHeader>
                <CardTitle>Análise de Tendência de Lucro</CardTitle>
                <p className="text-sm text-muted-foreground">Exibindo lucro para: {periodLabel}.</p>
            </CardHeader>
            <CardContent className="pl-2">
                <ProfitChart data={data} />
            </CardContent>
        </Card>
    );
}
