
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type FunnelStep = {
    label: string;
    value: number;
    percentage: number;
};

interface FunnelChartProps {
    data: FunnelStep[];
}

export function FunnelChart({ data }: FunnelChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Funil de Conversão</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">Dados insuficientes para exibir o funil.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Funil de Conversão</CardTitle>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Este funil mostra a taxa de conversão em cada etapa, <br/> começando com o total de visualizações como 100%.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg overflow-hidden text-white">
                    {data.map((step, index) => (
                        <div 
                            key={step.label} 
                            className={`flex-1 p-4 flex flex-col justify-between items-center text-center ${index < data.length - 1 ? 'border-r border-white/20' : ''}`}
                        >
                            <h3 className="text-sm font-semibold uppercase tracking-wider">{step.label}</h3>
                            <div className="my-4">
                                <p className="text-4xl font-bold">{step.percentage.toFixed(1)}%</p>
                            </div>
                            <p className="text-lg font-medium">{step.value.toLocaleString('pt-BR')}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
