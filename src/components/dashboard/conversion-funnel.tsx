import { ArrowDown } from 'lucide-react';

const funnelData = [
  { stage: 'Visitantes', value: '12,345', conversion: '15.2%', width: 'w-full' },
  { stage: 'Leads', value: '1,876', conversion: '25.8%', width: 'w-10/12' },
  { stage: 'Vendas', value: '484', conversion: null, width: 'w-8/12' },
];

export function ConversionFunnel() {
  return (
    <div className="space-y-2 pt-4">
      {funnelData.map((item, index) => (
        <div key={item.stage} className="flex flex-col items-center justify-center">
          <div className={`${item.width} rounded bg-primary/10 p-3 text-center shadow-inner transition-all duration-300 ease-in-out`}>
            <p className="text-sm font-semibold text-primary/80">{item.stage}</p>
            <p className="text-2xl font-bold text-primary">{item.value}</p>
          </div>
          {item.conversion && (
            <div className="my-2 flex flex-col items-center text-muted-foreground">
              <ArrowDown className="h-5 w-5" />
              <p className="text-xs font-bold">{item.conversion}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
