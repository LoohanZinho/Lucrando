
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
    const formatPercentage = (percentage: number) => {
        if (percentage === 0) return "0%";
        return `${percentage.toFixed(1)}%`;
    }
    const formatNumber = (value: number) => {
        return value.toLocaleString('pt-BR');
    }

    const viewBoxWidth = 1000;
    const viewBoxHeight = 250;
    const stepWidth = viewBoxWidth / data.length;

    const generatePath = () => {
        if (data.length === 0) return "";

        const yPoints = data.map(step => {
            const stepHeight = viewBoxHeight * (step.percentage / 100);
            const yTop = Math.max(10, (viewBoxHeight - stepHeight) / 2);
            const yBottom = Math.min(viewBoxHeight - 10, yTop + stepHeight);
            return { yTop, yBottom };
        });

        // Top path from left to right
        let topPath = `M 0,${yPoints[0].yTop} `;
        for (let i = 0; i < data.length - 1; i++) {
            const x1 = i * stepWidth;
            const x2 = (i + 1) * stepWidth;
            
            const cp1x = x1 + stepWidth / 2;
            const cp1y = yPoints[i].yTop;
            const cp2x = x2 - stepWidth / 2;
            const cp2y = yPoints[i+1].yTop;

            topPath += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${yPoints[i+1].yTop} `;
        }
        topPath += `L ${viewBoxWidth},${yPoints[data.length - 1].yTop} `;
        
        // Bottom path from right to left
        let bottomPath = `L ${viewBoxWidth},${yPoints[data.length - 1].yBottom} `;
        for (let i = data.length - 1; i > 0; i--) {
            const x1 = i * stepWidth;
            const x2 = (i - 1) * stepWidth;

            const cp1x = x1 - stepWidth / 2;
            const cp1y = yPoints[i].yBottom;
            const cp2x = x2 + stepWidth / 2;
            const cp2y = yPoints[i-1].yBottom;
            
            bottomPath += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${yPoints[i-1].yBottom} `;
        }
        bottomPath += `L 0,${yPoints[0].yBottom} Z`;
        
        return `${topPath} ${bottomPath}`;
    }

    const finalPath = generatePath();


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
                 <div className="relative w-full">
                     <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-auto" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="funnelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.9} />
                                <stop offset="75%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                            </linearGradient>
                             <linearGradient id="funnelGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.9} />
                                <stop offset="75%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <path d={finalPath} fill="url(#funnelGradient)" className="dark:fill-[url(#funnelGradientDark)]"/>
                         {data.map((step, index) => {
                             if(index < data.length - 1) {
                                 const x = (index + 1) * stepWidth;
                                 return <line key={`line-${index}`} x1={x} y1="0" x2={x} y2={viewBoxHeight} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4" />
                             }
                             return null;
                         })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col md:flex-row items-stretch justify-between text-center">
                        {data.map((step, index) => (
                            <div 
                                key={step.label} 
                                className="relative flex-1 py-4 px-2 flex flex-col justify-center items-center"
                            >
                                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-foreground">{step.label}</h3>
                                <p className="text-4xl font-bold my-2 text-primary">{formatPercentage(step.percentage)}</p>
                                <p className="text-lg font-medium text-muted-foreground">{formatNumber(step.value)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
