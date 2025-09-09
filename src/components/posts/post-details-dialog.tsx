
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type Post, type Influencer, type Partner, type Product } from "@/lib/data-types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Timestamp } from "firebase/firestore/lite";

interface PostDetailsDialogProps {
  post: Post;
  influencer?: Influencer;
  partner?: Partner;
  product?: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) => (
    <div className={className}>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value || "-"}</p>
    </div>
)

export function PostDetailsDialog({ post, influencer, partner, product, open, onOpenChange }: PostDetailsDialogProps) {

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "R$ 0,00";
    return `R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return "0";
    return value.toLocaleString('pt-BR');
  }

  const calculateProfit = (post: Post) => {
      const profit = (post.revenue || 0) - (post.investment || 0);
      const color = profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-foreground';
      return <span className={color}>{formatCurrency(profit)}</span>
  }
  
  const getPartnerShareDisplay = () => {
    if (!post.partnerShareType || post.partnerShareValue === undefined) return "-";
    if (post.partnerShareType === 'percentage') return `${post.partnerShareValue}%`;
    return formatCurrency(post.partnerShareValue);
  }
  
  const postDate = post.postDate instanceof Timestamp ? post.postDate.toDate() : post.postDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>{post.title}</DialogTitle>
          <DialogDescription>
            Postagem de: {format(postDate, "dd/MM/yyyy", {locale: ptBR})}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            {post.description && (
                <div>
                     <p className="text-sm font-medium text-muted-foreground mb-1">Descrição</p>
                     <p className="text-sm bg-muted/50 p-3 rounded-md">{post.description}</p>
                </div>
            )}
             {post.link && (
                <div>
                     <p className="text-sm font-medium text-muted-foreground mb-1">Link</p>
                     <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">{post.link}</a>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem label="Produto" value={product?.name} />
                <DetailItem label="Influenciador" value={influencer?.name} />
                <DetailItem label="Instagram" value={influencer?.instagram} />
            </div>

            <hr/>

            <h3 className="font-semibold text-lg -mb-2">Métricas Financeiras</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem label="Investimento" value={formatCurrency(post.investment)} />
                <DetailItem label="Receita" value={formatCurrency(post.revenue)} />
                <DetailItem label="Lucro" value={calculateProfit(post)} />
            </div>
            
             <hr/>
            
            <h3 className="font-semibold text-lg -mb-2">Métricas de Engajamento</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <DetailItem label="Views" value={formatNumber(post.views)} />
                 <DetailItem label="Cliques" value={formatNumber(post.clicks)} />
                 <DetailItem label="Visitas na Página" value={formatNumber(post.pageVisits)} />
                 <DetailItem label="Vendas" value={formatNumber(post.sales)} />
            </div>
            
            {partner && (
                <>
                    <hr/>
                    <h3 className="font-semibold text-lg -mb-2">Detalhes do Sócio</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <DetailItem label="Sócio" value={partner.name} />
                        <DetailItem label="Tipo de Comissão" value={post.partnerShareType === 'percentage' ? 'Porcentagem' : 'Valor Fixo'} />
                        <DetailItem label="Valor da Comissão" value={getPartnerShareDisplay()} />
                    </div>
                </>
            )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
