import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const performanceData = [
    { label: 'ROAS', value: '4.2x' },
    { label: 'Taxa de Conversão', value: '3.5%' },
    { label: 'CPA (Custo por Aquisição)', value: 'R$ 25,70' },
    { label: 'Ticket Médio', value: 'R$ 150,00' },
]

export function PerformanceMetrics() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Análise de Performance</CardTitle>
                <CardDescription>Métricas chave de performance da campanha.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-6">
                {performanceData.map((metric) => (
                    <div key={metric.label} className="flex flex-col space-y-1">
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
