import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const influencers = [
    { name: 'Maria Souza', avatar: 'MS', revenue: 'R$ 12.500', cpa: 'R$ 22,50', roi: '350%' },
    { name: 'João Silva', avatar: 'JS', revenue: 'R$ 9.800', cpa: 'R$ 28,00', roi: '280%' },
    { name: 'Ana Oliveira', avatar: 'AO', revenue: 'R$ 7.200', cpa: 'R$ 31,20', roi: '210%' },
    { name: 'Pedro Costa', avatar: 'PC', revenue: 'R$ 5.100', cpa: 'R$ 35,50', roi: '180%' },
    { name: 'Carla Dias', avatar: 'CD', revenue: 'R$ 3.400', cpa: 'R$ 40,10', roi: '150%' },
];

export function TopInfluencersTable() {
    return (
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Influenciador</TableHead>
            <TableHead className="text-right">Receita</TableHead>
            <TableHead className="hidden sm:table-cell text-right">CPA</TableHead>
            <TableHead className="text-right">ROI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {influencers.map((influencer) => (
            <TableRow key={influencer.name}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://picsum.photos/40/40?random=${influencer.name}`} alt={influencer.name} data-ai-hint="person" />
                    <AvatarFallback>{influencer.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{influencer.name}</div>
                </div>
              </TableCell>
              <TableCell className="text-right">{influencer.revenue}</TableCell>
              <TableCell className="hidden sm:table-cell text-right">{influencer.cpa}</TableCell>
              <TableCell className="text-right font-medium text-primary">{influencer.roi}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
}
