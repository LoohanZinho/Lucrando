
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { type Influencer, type Post } from "@/lib/data-types";
import { useAuth } from "@/contexts/auth-context";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";

interface InfluencerHistoryDialogProps {
  influencer: Influencer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfluencerHistoryDialog({ influencer, open, onOpenChange }: InfluencerHistoryDialogProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const postsCol = collection(db, `users/${user.uid}/posts`);
        const q = query(
          postsCol,
          where("influencerId", "==", influencer.id),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            } as Post;
        });
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching influencer posts: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [open, user, influencer.id]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Histórico de Posts: {influencer.name}</DialogTitle>
          <DialogDescription>
            Veja todas as métricas das postagens realizadas com este influenciador.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="text-right">Invest.</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Cliques</TableHead>
                <TableHead className="text-right">Visitas</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!loading && posts.map(post => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="text-right">{formatCurrency(post.investment)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(post.revenue)}</TableCell>
                  <TableCell className="text-right font-medium">{calculateProfit(post)}</TableCell>
                  <TableCell className="text-right">{formatNumber(post.views)}</TableCell>
                  <TableCell className="text-right">{formatNumber(post.clicks)}</TableCell>
                  <TableCell className="text-right">{formatNumber(post.pageVisits)}</TableCell>
                  <TableCell className="text-right">{formatNumber(post.sales)}</TableCell>
                </TableRow>
              ))}
              {!loading && posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Nenhum post encontrado para este influenciador.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
