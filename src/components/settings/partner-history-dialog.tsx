
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { type Partner, type Post, type Product } from "@/lib/data-types";
import { useAuth } from "@/contexts/auth-context";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";

interface PartnerHistoryDialogProps {
  partner: Partner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PartnerHistoryDialog({ partner, open, onOpenChange }: PartnerHistoryDialogProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const postsCol = collection(db, `users/${user.uid}/posts`);
        const productsCol = collection(db, `users/${user.uid}/products`);
        
        const postsQuery = query(
          postsCol,
          where("partnerId", "==", partner.id),
          orderBy("createdAt", "desc")
        );

        const [postsSnapshot, productsSnapshot] = await Promise.all([
          getDocs(postsQuery),
          getDocs(productsCol)
        ]);
        
        const fetchedPosts = postsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            } as Post;
        });

        const fetchedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        setPosts(fetchedPosts);
        setProducts(fetchedProducts);

      } catch (error) {
        console.error("Error fetching partner history: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, user, partner.id]);

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "R$ 0,00";
    return `R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  const getProductName = (productId: string) => {
      return products.find(p => p.id === productId)?.name || 'N/A';
  }

  const calculatePartnerShare = (post: Post) => {
      if (!post.partnerShareType || post.partnerShareValue === undefined) return 0;
      if (post.partnerShareType === 'fixed') {
          return post.partnerShareValue;
      }
      if (post.partnerShareType === 'percentage') {
          const profit = (post.revenue || 0) - (post.investment || 0);
          return profit * (post.partnerShareValue / 100);
      }
      return 0;
  }

  const totalEarnings = posts.reduce((acc, post) => acc + calculatePartnerShare(post), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Histórico de Ganhos: {partner.name}</DialogTitle>
          <DialogDescription>
            Veja todos os ganhos das postagens com participação deste sócio.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título do Post</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
                <TableHead className="text-right">Ganho do Sócio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!loading && posts.map(post => {
                  const share = calculatePartnerShare(post);
                  return (
                     <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{getProductName(post.productId)}</TableCell>
                        <TableCell className="text-right">
                            {post.partnerShareType === 'percentage' 
                                ? `${post.partnerShareValue}% do Lucro`
                                : formatCurrency(post.partnerShareValue)}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(share)}</TableCell>
                    </TableRow>
                  )
                })}
              {!loading && posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Nenhuma postagem encontrada para este sócio.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
             {!loading && posts.length > 0 && (
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold text-lg">Total de Ganhos</TableCell>
                        <TableCell className="text-right font-bold text-lg">{formatCurrency(totalEarnings)}</TableCell>
                    </TableRow>
                </TableFooter>
            )}
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
