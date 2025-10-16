
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { type Influencer, type Post, type Product } from "@/lib/data-types";
import { useAuth } from "@/contexts/auth-context";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent } from "../ui/card";
import { format } from "date-fns";

interface InfluencerHistoryDialogProps {
  influencer: Influencer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfluencerHistoryDialog({ influencer, open, onOpenChange }: InfluencerHistoryDialogProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const postsCol = collection(db, `users/${user.id}/posts`);
        const productsCol = collection(db, `users/${user.id}/products`);

        const q = query(
          postsCol,
          where("influencerId", "==", influencer.id),
          orderBy("postDate", "desc")
        );
        
        const [postsSnapshot, productsSnapshot] = await Promise.all([
          getDocs(q),
          getDocs(productsCol)
        ]);

        const fetchedPosts = postsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                postDate: data.postDate instanceof Timestamp ? data.postDate.toDate() : new Date(),
            } as Post;
        });

        const fetchedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        setPosts(fetchedPosts);
        setProducts(fetchedProducts);

      } catch (error) {
        console.error("Erro ao buscar histórico do influenciador: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [open, user, influencer.id]);

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'N/A';
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
      const color = profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-muted-foreground';
      return <span className={color}>{formatCurrency(profit)}</span>
  }
  
  const getDateToFormat = (date: Date | Timestamp): Date => {
      return date instanceof Timestamp ? date.toDate() : date;
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Histórico de Posts: {influencer.name}</DialogTitle>
          <DialogDescription>
            Veja todas as métricas das postagens realizadas com este influenciador.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="pr-6">
            {/* Desktop View */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  </TableRow>
                ))}
                {!loading && posts.map(post => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{format(getDateToFormat(post.postDate), "dd/MM/yy")}</TableCell>
                    <TableCell>{getProductName(post.productId)}</TableCell>
                    <TableCell className="text-right font-medium">{calculateProfit(post)}</TableCell>
                    <TableCell className="text-right">{formatNumber(post.sales)}</TableCell>
                  </TableRow>
                ))}
                {!loading && posts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhum post encontrado para este influenciador.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {loading && [...Array(3)].map((_, i) => (
                    <Card key={i} className="p-4"><Skeleton className="h-20 w-full" /></Card>
                ))}
                {!loading && posts.map(post => (
                    <Card key={post.id} className="p-4">
                        <CardContent className="p-0 space-y-2">
                           <div className="flex justify-between items-center">
                               <h3 className="font-semibold">{post.title}</h3>
                               <p className="text-sm text-muted-foreground">{format(getDateToFormat(post.postDate), "dd/MM/yy")}</p>
                           </div>
                           <p className="text-sm text-muted-foreground">Produto: {getProductName(post.productId)}</p>
                           <div className="flex justify-between pt-2">
                               <div>
                                   <p className="text-sm text-muted-foreground">Lucro</p>
                                   <p className="font-semibold">{calculateProfit(post)}</p>
                               </div>
                               <div className="text-right">
                                   <p className="text-sm text-muted-foreground">Vendas</p>
                                   <p className="font-semibold">{formatNumber(post.sales)}</p>
                               </div>
                           </div>
                        </CardContent>
                    </Card>
                ))}
                 {!loading && posts.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">
                      Nenhum post encontrado.
                    </p>
                )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
