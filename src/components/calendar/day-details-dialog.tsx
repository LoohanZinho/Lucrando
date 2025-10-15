
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type Post, type Influencer, type Product } from "@/lib/data-types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
import { Separator } from "../ui/separator";

interface DayDetailsDialogProps {
  date: Date | null;
  posts: Post[];
  influencers: Influencer[];
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditPost: (postId: string) => void;
}

const DetailItemMobile = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
    </div>
);

export function DayDetailsDialog({ date, posts, influencers, products, open, onOpenChange, onEditPost }: DayDetailsDialogProps) {
  if (!date) return null;

  const getInfluencerName = (id: string) => influencers.find(i => i.id === id)?.name || 'N/A';
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'N/A';

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "R$ 0,00";
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  const calculateProfit = (post: Post) => {
      const profit = (post.revenue || 0) - (post.investment || 0);
      const color = profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-foreground';
      return <span className={color}>{formatCurrency(profit)}</span>
  }

  const calculateRoas = (post: Post) => {
    const { revenue = 0, investment = 0 } = post;
    if (investment === 0) return 'N/A';
    const roas = revenue / investment;
    return `${roas.toFixed(2)}x`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Publicações de {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</DialogTitle>
          <DialogDescription>
            Resumo de todas as publicações e métricas para a data selecionada.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="pr-6 space-y-6">
            {posts.map(post => (
              <div key={post.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground mb-3">
                            <Badge variant="outline">{getInfluencerName(post.influencerId)}</Badge>
                            <span className="hidden sm:inline">&bull;</span>
                            <Badge variant="secondary">{getProductName(post.productId)}</Badge>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => onEditPost(post.id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar Post</span>
                    </Button>
                </div>
                
                {/* Tabela para Desktop */}
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">Invest.</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                      <TableHead className="text-right">Lucro</TableHead>
                      <TableHead className="text-right">ROAS</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Cliques</TableHead>
                      <TableHead className="text-right">Vendas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-right">{formatCurrency(post.investment)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(post.revenue)}</TableCell>
                      <TableCell className="text-right font-medium">{calculateProfit(post)}</TableCell>
                      <TableCell className="text-right font-medium">{calculateRoas(post)}</TableCell>
                      <TableCell className="text-right">{post.views?.toLocaleString('pt-BR') || '0'}</TableCell>
                      <TableCell className="text-right">{post.clicks?.toLocaleString('pt-BR') || '0'}</TableCell>
                      <TableCell className="text-right">{post.sales?.toLocaleString('pt-BR') || '0'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Layout de Card para Mobile */}
                <div className="md:hidden space-y-4 pt-2">
                    <div className="space-y-2">
                        <h4 className="font-semibold">Financeiro</h4>
                        <DetailItemMobile label="Investimento" value={formatCurrency(post.investment)} />
                        <DetailItemMobile label="Receita" value={formatCurrency(post.revenue)} />
                        <DetailItemMobile label="Lucro" value={calculateProfit(post)} />
                        <DetailItemMobile label="ROAS" value={calculateRoas(post)} />
                    </div>
                    <Separator />
                     <div className="space-y-2">
                        <h4 className="font-semibold">Engajamento</h4>
                        <DetailItemMobile label="Views" value={post.views?.toLocaleString('pt-BR') || '0'} />
                        <DetailItemMobile label="Cliques" value={post.clicks?.toLocaleString('pt-BR') || '0'} />
                        <DetailItemMobile label="Visitas na Página" value={post.pageVisits?.toLocaleString('pt-BR') || '0'} />
                        <DetailItemMobile label="Vendas" value={post.sales?.toLocaleString('pt-BR') || '0'} />
                    </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

