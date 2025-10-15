
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { collection, getDocs, query, Timestamp } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { type Post, type Influencer, type Product } from '@/lib/data-types';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { DayDetailsDialog } from './day-details-dialog';

export function PostsCalendar() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const postsCol = collection(db, `users/${user.uid}/posts`);
      const influencersCol = collection(db, `users/${user.uid}/influencers`);
      const productsCol = collection(db, `users/${user.uid}/products`);

      const [postsSnapshot, influencersSnapshot, productsSnapshot] = await Promise.all([
        getDocs(query(postsCol)),
        getDocs(query(influencersCol)),
        getDocs(query(productsCol)),
      ]);

      const fetchedPosts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        postDate: (doc.data().postDate as Timestamp).toDate(),
      } as Post));
      
      const fetchedInfluencers = influencersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Influencer));
      const fetchedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      setPosts(fetchedPosts);
      setInfluencers(fetchedInfluencers);
      setProducts(fetchedProducts);

    } catch (error) {
      console.error("Error fetching calendar data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar as postagens para o calendário."
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const postsByDate = useMemo(() => {
    const grouped: { [key: string]: Post[] } = {};
    posts.forEach(post => {
      const dateKey = format(post.postDate, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(post);
    });
    return grouped;
  }, [posts]);

  const postsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    const dateKey = format(selectedDay, 'yyyy-MM-dd');
    return postsByDate[dateKey] || [];
  }, [selectedDay, postsByDate]);


  const getInfluencerName = (id: string) => {
    return influencers.find(i => i.id === id)?.name || 'Desconhecido';
  }

  const handleAddPost = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    router.push(`/posts?new=true&date=${dateString}`);
  }

  const handleEditPost = (postId: string) => {
    setIsDetailsModalOpen(false);
    router.push(`/posts?edit=${postId}`);
  }
  
  const handleDayClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const postsForDay = postsByDate[dateKey] || [];
    if(postsForDay.length > 0) {
      setSelectedDay(date);
      setIsDetailsModalOpen(true);
    }
  }

  const DayWithPosts = ({ date, displayMonth }: { date: Date, displayMonth: Date }) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const postsForDay = postsByDate[dateKey] || [];
    const isToday = isSameDay(date, new Date());

    return (
      <div 
        className="relative flex flex-col h-full p-1 group/day cursor-pointer"
        onClick={() => handleDayClick(date)}
      >
        <time dateTime={dateKey} className={`text-xs text-right pr-1 ${isToday ? 'font-bold text-primary' : ''}`}>
          {format(date, 'd')}
        </time>
        <div className="flex-grow space-y-1 mt-1 overflow-hidden">
          {postsForDay.slice(0, 2).map(post => (
            <Badge key={post.id} variant="secondary" className="w-full truncate block text-left font-normal text-xs p-1">
              {post.title}
              <span className="text-muted-foreground ml-1">({getInfluencerName(post.influencerId).split(' ')[0]})</span>
            </Badge>
          ))}
          {postsForDay.length > 2 && (
            <Badge variant="outline" className="w-full text-xs p-1">
              + {postsForDay.length - 2} mais
            </Badge>
          )}
        </div>
        <div className="absolute bottom-1 right-1 opacity-0 group-hover/day:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={(e) => { e.stopPropagation(); handleAddPost(date); }}>
                <PlusCircle className="h-4 w-4" />
            </Button>
        </div>
      </div>
    );
  };


  if (loading) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-20" />
                </div>
                <div className="grid grid-cols-7 grid-rows-5 gap-1">
                    {[...Array(35)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0 sm:p-4">
          <Calendar
            locale={ptBR}
            mode="single"
            className="w-full"
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-y-0',
              month: 'space-y-4 w-full',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex border-b',
              head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem] py-2',
              row: 'flex w-full mt-2 gap-1',
              cell: 'text-center text-sm p-0 relative w-full h-28 border rounded-md bg-card hover:bg-accent/50 transition-colors [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
              day: 'h-full w-full focus:relative focus:z-20 p-0',
              day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
              day_outside: 'text-muted-foreground opacity-50',
              day_disabled: 'text-muted-foreground opacity-50',
            }}
            components={{
              Day: DayWithPosts,
            }}
          />
        </CardContent>
      </Card>
      <DayDetailsDialog
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        date={selectedDay}
        posts={postsForSelectedDay}
        influencers={influencers}
        products={products}
        onEditPost={handleEditPost}
      />
    </>
  );
}
