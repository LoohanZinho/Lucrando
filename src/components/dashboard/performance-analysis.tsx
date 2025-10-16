
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Target, Percent, ShoppingCart } from "lucide-react";

interface PerformanceAnalysisProps {
    roi: number;
    conversionRate: number;
    averageTicket: number;
    periodLabel: string;
}

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatPercentage = (value: number) => `${value.toFixed(1)}%`;


export function PerformanceAnalysis({ roi, conversionRate, averageTicket, periodLabel }: PerformanceAnalysisProps) {
    type KpiInfo = {
        title: string;
        description: string;
        formula: string;
    } | null;

    const [hoveredKpi, setHoveredKpi] = useState<KpiInfo>(null);

    const kpiDetails = {
        roi: {
            title: "Retorno sobre Investimento (ROI)",
            description: "Mede o lucro ou prejuízo em relação ao custo do investimento.",
            formula: "Fórmula: ((Receita - Investimento) / Investimento) * 100",
        },
        conversion: {
            title: "Taxa de Conversão",
            description: "Percentual de cliques que resultaram em uma venda.",
            formula: "Fórmula: (Vendas / Cliques) * 100"
        },
        ticket: {
            title: "Ticket Médio",
            description: "O valor médio gasto por cliente em cada compra.",
            formula: "Fórmula: (Receita / Vendas)"
        }
    };

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Análise de Performance</CardTitle>
                <p className="text-sm text-muted-foreground">Métricas chave para: {periodLabel}.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                    <div
                        className="flex flex-col gap-1 rounded-md bg-muted/50 p-4 transition-all duration-300 hover:shadow-md"
                        onMouseEnter={() => setHoveredKpi(kpiDetails.roi)}
                        onMouseLeave={() => setHoveredKpi(null)}
                    >
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>ROI</span>
                        </div>
                        <div className="text-3xl font-bold">{formatPercentage(roi)}</div>
                    </div>

                    <div
                        className="flex flex-col gap-1 rounded-md bg-muted/50 p-4 transition-all duration-300 hover:shadow-md"
                        onMouseEnter={() => setHoveredKpi(kpiDetails.conversion)}
                        onMouseLeave={() => setHoveredKpi(null)}
                    >
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Percent className="h-4 w-4 text-muted-foreground" />
                            <span>Taxa de Conversão</span>
                        </div>
                        <div className="text-3xl font-bold">{formatPercentage(conversionRate)}</div>
                    </div>

                    <div
                        className="flex flex-col gap-1 rounded-md bg-muted/50 p-4 transition-all duration-300 hover:shadow-md"
                        onMouseEnter={() => setHoveredKpi(kpiDetails.ticket)}
                        onMouseLeave={() => setHoveredKpi(null)}
                    >
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            <span>Ticket Médio</span>
                        </div>
                        <div className="text-3xl font-bold">{formatCurrency(averageTicket)}</div>
                    </div>
                </div>

                <div className="col-span-1 sm:col-span-3 lg:col-span-1 min-h-[100px] p-4 rounded-lg bg-muted/20 flex flex-col justify-center">
                    {hoveredKpi ? (
                        <>
                            <h3 className="font-bold mb-1">{hoveredKpi.title}</h3>
                            <p className="text-sm text-muted-foreground">{hoveredKpi.description}</p>
                            <p className="text-sm text-muted-foreground mt-2 font-mono text-xs">{hoveredKpi.formula}</p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">
                            Passe o mouse sobre um KPI para ver a descrição.
                        </p>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
