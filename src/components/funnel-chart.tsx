
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
    title: string;
}

export function FunnelChart({ data, title }: FunnelChartProps) {
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
        if (data.length < 2) {
             const stepHeight = viewBoxHeight * (data[0]?.percentage / 100 || 0);
             const yTop = Math.max(10, (viewBoxHeight - stepHeight) / 2);
             const yBottom = Math.min(viewBoxHeight - 10, yTop + stepHeight);
             return `M 0,${yTop} L ${viewBoxWidth},${yTop} L ${viewBoxWidth},${yBottom} L 0,${yBottom} Z`;
        };

        const yPoints = data.map(step => {
            const stepHeight = viewBoxHeight * (step.percentage / 100);
            const yTop = Math.max(10, (viewBoxHeight - stepHeight) / 2);
            const yBottom = Math.min(viewBoxHeight - 10, yTop + stepHeight);
            return { yTop, yBottom };
        });

        let path = `M 0,${yPoints[0].yTop} `;
        const arcRadiusX = stepWidth * 0.75;

        // Draw top curve
        for (let i = 0; i < data.length - 1; i++) {
            const x2 = (i + 1) * stepWidth;
            const y2 = yPoints[i+1].yTop;
            const arcRadiusY = Math.abs(y2 - yPoints[i].yTop) || 10;
            path += `A ${arcRadiusX},${arcRadiusY} 0 0 1 ${x2},${y2} `;
        }
        
        path += `L ${viewBoxWidth},${yPoints[data.length - 1].yBottom} `;

        // Draw bottom curve
        for (let i = data.length - 1; i > 0; i--) {
            const x2 = (i - 1) * stepWidth;
            const y2 = yPoints[i-1].yBottom;
            const arcRadiusY = Math.abs(y2 - yPoints[i].yBottom) || 10;
            path += `A ${arcRadiusX},${arcRadiusY} 0 0 1 ${x2},${y2} `;
        }

        path += `Z`;
        
        return path;
    }

    const finalPath = generatePath();


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
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
                     <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-auto hidden md:block" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="funnelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.7} />
                            </linearGradient>
                             <linearGradient id="funnelGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.7} />
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
                    <div className="md:absolute md:inset-0 flex flex-col md:flex-row items-stretch justify-between text-center">
                        {data.map((step, index) => (
                             <div 
                                key={step.label} 
                                className="relative flex-1 py-4 px-2 flex flex-col justify-center items-center md:bg-transparent bg-muted/30 dark:md:bg-transparent dark:bg-muted/30 border-b md:border-none"
                            >
                                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground dark:text-slate-50">{step.label}</h3>
                                <p className="text-4xl font-bold my-2 text-muted-foreground dark:text-slate-50">{formatPercentage(step.percentage)}</p>
                                <p className="text-lg font-medium text-muted-foreground dark:text-slate-50">{formatNumber(step.value)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

    
