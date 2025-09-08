
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

    const topPoints = [10];
    const bottomPoints = [viewBoxHeight - 10];
    const midPoints = [];

    data.forEach((step, index) => {
        const stepHeight = viewBoxHeight * (step.percentage / 100);
        const yTop = (viewBoxHeight - stepHeight) / 2;
        const yBottom = yTop + stepHeight;

        if (index > 0) {
            topPoints.push(yTop);
            bottomPoints.push(yBottom);
        }
        midPoints.push({
            x: stepWidth * (index + 0.5),
            y: viewBoxHeight / 2,
        });
    });

    const pathData = data.reduce((acc, step, index) => {
        const stepHeight = viewBoxHeight * (step.percentage / 100);
        const yTop = Math.max(10, (viewBoxHeight - stepHeight) / 2);
        const yBottom = Math.min(viewBoxHeight - 10, yTop + stepHeight);
        
        const x1 = index * stepWidth;
        const x2 = (index + 1) * stepWidth;

        if (index === 0) {
            // Start
            acc += `M ${x1},${yTop} `;
        }

        // Top curve to next point
        const nextStepHeight = index < data.length - 1 ? viewBoxHeight * (data[index + 1].percentage / 100) : stepHeight;
        const nextYTop = index < data.length - 1 ? Math.max(10, (viewBoxHeight - nextStepHeight) / 2) : yTop;
        
        acc += `C ${x1 + stepWidth / 2},${yTop} ${x1 + stepWidth / 2},${nextYTop} ${x2},${nextYTop} `;
        
        return acc;
    }, "");

    const pathDataBottom = data.reduceRight((acc, step, index) => {
        const stepHeight = viewBoxHeight * (step.percentage / 100);
        const yTop = Math.max(10, (viewBoxHeight - stepHeight) / 2);
        const yBottom = Math.min(viewBoxHeight - 10, yTop + stepHeight);
        
        const x1 = index * stepWidth;
        const x2 = (index + 1) * stepWidth;

        if (index === data.length - 1) {
            // Start from bottom-right
            acc += `L ${x2},${yBottom} `;
        }
        
        const prevStepHeight = index > 0 ? viewBoxHeight * (data[index - 1].percentage / 100) : stepHeight;
        const prevYBottom = index > 0 ? Math.min(viewBoxHeight-10, (viewBoxHeight - prevStepHeight) / 2 + prevStepHeight) : yBottom;
       
        acc += `C ${x1 + stepWidth / 2},${yBottom} ${x1 + stepWidth / 2},${prevYBottom} ${x1},${prevYBottom} `;

        return acc;
    }, "");

    const finalPath = `${pathData} ${pathDataBottom} Z`;

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
                     <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-auto">
                        <defs>
                            <linearGradient id="funnelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                                <stop offset="100%" stopColor="hsl(210 40% 96.1%)" />
                            </linearGradient>
                             <linearGradient id="funnelGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                                <stop offset="100%" stopColor="hsl(240 3.7% 15.9%)" />
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
