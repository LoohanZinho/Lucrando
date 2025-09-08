
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

function WavySeparator() {
    return (
        <div className="absolute top-0 bottom-0 -right-0.5 w-4 text-background" style={{ right: '-1px' }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 20 100"
                preserveAspectRatio="none"
                className="fill-current"
            >
                <path d="M 20 0 C 0 25, 0 75, 20 100 L 20 0 Z" />
            </svg>
        </div>
    );
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
                 <div className="w-full bg-gradient-to-r from-primary via-orange-400 to-amber-300 rounded-lg text-primary-foreground p-4">
                    <div className="relative flex flex-col md:flex-row items-stretch justify-between text-center">
                        {data.map((step, index) => (
                            <div 
                                key={step.label} 
                                className="relative flex-1 py-4 px-2 flex flex-col justify-center items-center"
                            >
                                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">{step.label}</h3>
                                <p className="text-4xl font-bold my-2">{step.percentage.toFixed(1)}%</p>
                                <p className="text-lg font-medium">{step.value.toLocaleString('pt-BR')}</p>
                                
                                {index < data.length - 1 && (
                                   <div className="hidden md:block absolute top-0 bottom-0 w-px bg-white/20" style={{ right: '0' }} />
                                )}
                                 {index < data.length - 1 && (
                                   <hr className="md:hidden my-4 w-1/2 border-white/20"/>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
