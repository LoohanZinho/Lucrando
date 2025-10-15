
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, TrendingUp, Activity, Filter, X, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { type Post, type Influencer, type Product } from '@/lib/data-types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { format, eachDayOfInterval, eachMonthOfInterval, startOfMonth, lastDayOfMonth, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { PerformanceAnalysis } from '@/components/dashboard/performance-analysis';
import { ProfitTrendAnalysis } from '@/components/dashboard/profit-trend-analysis';
import { FunnelChart } from '@/components/funnel-chart';

type Period = "today" | "yesterday" | "last_7_days" | "this_month" | "all_time" | "custom";

const getPeriodLabel = (period: Period, customDateRange?: DateRange) => {
    switch (period) {
        case 'today': return 'Hoje';
        case 'yesterday': return 'Ontem';
        case 'last_7_days': return 'Últimos 7 dias';
        case 'this_month': return 'Este Mês';
        case 'all_time': return 'Todo o período';
        case 'custom':
            if (customDateRange?.from && customDateRange?.to) {
                if (format(customDateRange.from, 'PPP', { locale: ptBR }) === format(customDateRange.to, 'PPP', { locale: ptBR })) {
                    return format(customDateRange.from, 'PPP', { locale: ptBR });
                }
                return `${format(customDateRange.from, 'PPP', { locale: ptBR })} - ${format(customDateRange.to, 'PPP', { locale: ptBR })}`;
            }
            return 'Período Customizado';
        default: return '';
    }
}

const getPeriodDates = (period: Period, customDateRange?: DateRange, allPosts: Post[] = []): { current: DateRange, previous: DateRange } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    let currentStart, currentEnd, previousStart, previousEnd;

    switch (period) {
        case 'today':
            currentStart = today;
            currentEnd = endOfToday;
            previousStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            previousEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59, 999);
            break;
        case 'yesterday':
            currentStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            currentEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59, 999);
            previousStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);
            previousEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 23, 59, 59, 999);
            break;
        case 'last_7_days':
            currentStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
            currentEnd = endOfToday;
            const diff7 = (currentEnd.getTime() - currentStart.getTime());
            previousStart = new Date(currentStart.getTime() - diff7 - 1);
            previousEnd = new Date(currentStart.getTime() - 1);
            break;
        case 'this_month':
            currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
            currentEnd = endOfToday;
            previousStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            previousEnd = new Date(previousStart.getFullYear(), previousStart.getMonth(), Math.min(today.getDate(), lastDayOfPreviousMonth.getDate()), 23, 59, 59, 999);
            break;
        case 'custom':
            if (customDateRange?.from && customDateRange?.to) {
                currentStart = customDateRange.from;
                currentEnd = new Date(customDateRange.to.getFullYear(), customDateRange.to.getMonth(), customDateRange.to.getDate(), 23, 59, 59, 999);
                const diff = currentEnd.getTime() - currentStart.getTime();
                previousStart = new Date(currentStart.getTime() - diff - 1);
                previousEnd = new Date(currentStart.getTime() - 1);
            } else {
                 currentStart = today;
                 currentEnd = today;
                 previousStart = today;
                 previousEnd = today;
            }
            break;
        case 'all_time':
        default:
             if (allPosts.length > 0) {
                const firstPostDate = allPosts.reduce((earliest, post) => {
                    const postDate = post.postDate instanceof Timestamp ? post.postDate.toDate() : new Date(post.postDate);
                    return postDate < earliest ? postDate : earliest;
                }, new Date());
                currentStart = startOfDay(firstPostDate);
            } else {
                currentStart = today;
            }
            currentEnd = endOfToday;
            previousStart = new Date(0); // No previous period for all time
            previousEnd = new Date(0);
            break;
    }

    return {
        current: { from: currentStart, to: currentEnd },
        previous: { from: previousStart, to: previousEnd }
    };
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [allInfluencers, setAllInfluencers] = useState<Influencer[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [greeting, setGreeting] = useState("Olá");
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('this_month');
    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);

    // Advanced Filters State
    const [selectedInfluencer, setSelectedInfluencer] = useState<string>("all");
    const [selectedProduct, setSelectedProduct] = useState<string>("all");
    const [selectedPost, setSelectedPost] = useState<string>("all");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Bom dia");
        else if (hour < 18) setGreeting("Boa tarde");
        else setGreeting("Boa noite");
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
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
                    id: doc.id, ...doc.data(),
                    postDate: doc.data().postDate instanceof Timestamp ? doc.data().postDate.toDate() : new Date(),
                } as Post));
                
                const fetchedInfluencers = influencersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Influencer));
                const fetchedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

                setAllPosts(fetchedPosts);
                setAllInfluencers(fetchedInfluencers);
                setAllProducts(fetchedProducts);

            } catch (error) {
                console.error("Error fetching dashboard data: ", error);
            }
        };

        fetchData();
    }, [user]);
    
    const { periodPosts, previousPeriodPosts, chartPosts, chartPeriodLabel } = useMemo(() => {
        // Apply advanced filters first
        const filteredByAdvanced = allPosts.filter(p => {
            const influencerMatch = selectedInfluencer === 'all' || p.influencerId === selectedInfluencer;
            const productMatch = selectedProduct === 'all' || p.productId === selectedProduct;
            const postMatch = selectedPost === 'all' || p.id === selectedPost;
            return influencerMatch && productMatch && postMatch;
        });

        // Then, apply date filters
        const { current, previous } = getPeriodDates(selectedPeriod, customDateRange, allPosts);

        const isShortPeriod = ['today', 'yesterday'].includes(selectedPeriod);
        const chartPeriod = isShortPeriod ? 'last_7_days' : selectedPeriod;
        const chartCustomRange = isShortPeriod ? undefined : customDateRange;
        const { current: chartDateRange } = getPeriodDates(chartPeriod, chartCustomRange, allPosts);
        
        const filterPostsByDate = (posts: Post[], range: DateRange) => {
             if (!range.from || !range.to) return [];
             return posts.filter(p => {
                const postDate = new Date(p.postDate instanceof Timestamp ? p.postDate.toDate() : p.postDate);
                return postDate >= range.from! && postDate <= range.to!;
            });
        }
        
        const periodData = selectedPeriod === 'all_time' ? filteredByAdvanced.filter(p => p.postDate >= current.from! && p.postDate <= current.to!) : filterPostsByDate(filteredByAdvanced, current);
        const previousPeriodData = selectedPeriod === 'all_time' ? [] : filterPostsByDate(filteredByAdvanced, previous);
        const chartData = filterPostsByDate(filteredByAdvanced, chartDateRange);

        return {
            periodPosts: periodData,
            previousPeriodPosts: previousPeriodData,
            chartPosts: chartData,
            chartPeriodLabel: getPeriodLabel(chartPeriod, chartCustomRange)
        }

    }, [allPosts, selectedPeriod, customDateRange, selectedInfluencer, selectedProduct, selectedPost]);

    const calculateMetrics = (postList: Post[]) => {
        return postList.reduce((acc, post) => {
            acc.revenue += post.revenue || 0;
            acc.investment += post.investment || 0;
            acc.sales += post.sales || 0;
            acc.clicks += post.clicks || 0;
            acc.views += post.views || 0;
            acc.pageVisits += post.pageVisits || 0;
            return acc;
        }, { revenue: 0, investment: 0, profit: 0, sales: 0, clicks: 0, views: 0, pageVisits: 0 });
    };

    const currentMetrics = calculateMetrics(periodPosts);
    const previousMetrics = calculateMetrics(previousPeriodPosts);
    
    currentMetrics.profit = currentMetrics.revenue - currentMetrics.investment;
    previousMetrics.profit = previousMetrics.revenue - previousMetrics.investment;

    const getPercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? Infinity : 0;
        return ((current - previous) / previous) * 100;
    };
    
    const revenueChange = getPercentageChange(currentMetrics.revenue, previousMetrics.revenue);
    const expensesChange = getPercentageChange(currentMetrics.investment, previousMetrics.investment);
    const profitChange = getPercentageChange(currentMetrics.profit, previousMetrics.profit);
    
    const roi = currentMetrics.investment > 0 ? (currentMetrics.profit / currentMetrics.investment) * 100 : 0;
    const prevRoi = previousMetrics.investment > 0 ? (previousMetrics.profit / previousMetrics.investment) * 100 : 0;
    const roiChange = getPercentageChange(roi, prevRoi);
    
    const roas = currentMetrics.investment > 0 ? currentMetrics.revenue / currentMetrics.investment : 0;
    const conversionRate = currentMetrics.clicks > 0 ? (currentMetrics.sales / currentMetrics.clicks) * 100 : 0;
    const cpa = currentMetrics.sales > 0 ? currentMetrics.investment / currentMetrics.sales : 0;
    const averageTicket = currentMetrics.sales > 0 ? currentMetrics.revenue / currentMetrics.sales : 0;

    const profitTrendData = useMemo(() => {
        const { current: chartDateRange } = getPeriodDates(
            ['today', 'yesterday'].includes(selectedPeriod) ? 'last_7_days' : selectedPeriod,
            ['today', 'yesterday'].includes(selectedPeriod) ? undefined : customDateRange,
            allPosts
        );

        if (!chartDateRange.from || !chartDateRange.to) return [];

        const isLongPeriod = (chartDateRange.to.getTime() - chartDateRange.from.getTime()) > 31 * 24 * 60 * 60 * 1000;

        const dataMap: { [key: string]: number } = {};
        chartPosts.forEach(post => {
            const date = new Date(post.postDate instanceof Timestamp ? post.postDate.toDate() : post.postDate);
            const key = isLongPeriod ? format(date, 'yyyy-MM') : format(date, 'yyyy-MM-dd');
            const profit = (post.revenue || 0) - (post.investment || 0);
            dataMap[key] = (dataMap[key] || 0) + profit;
        });

        if (isLongPeriod) {
            const intervalMonths = eachMonthOfInterval({
                start: startOfMonth(chartDateRange.from),
                end: lastDayOfMonth(chartDateRange.to)
            });
            return intervalMonths.map(month => {
                const monthKey = format(month, 'yyyy-MM');
                return {
                    month: format(month, 'MMM/yy', { locale: ptBR }),
                    profit: dataMap[monthKey] || 0
                };
            });
        } else {
            const intervalDays = eachDayOfInterval({
                start: chartDateRange.from,
                end: chartDateRange.to
            });
            return intervalDays.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd');
                return {
                    month: format(day, 'dd/MM'),
                    profit: dataMap[dayKey] || 0
                };
            });
        }
    }, [chartPosts, selectedPeriod, customDateRange, allPosts]);
    
    const funnelData = useMemo(() => {
        const totalMetrics = chartPosts.reduce((acc, post) => {
            acc.views += post.views || 0;
            acc.clicks += post.clicks || 0;
            acc.pageVisits += post.pageVisits || 0;
            acc.sales += post.sales || 0;
            return acc;
        }, { views: 0, clicks: 0, pageVisits: 0, sales: 0 });

        const baseValue = totalMetrics.views;
        
        if (baseValue === 0) {
            return [
                { label: "Views nos Stories", value: 0, percentage: 0 },
                { label: "Cliques no Link", value: 0, percentage: 0 },
                { label: "Visitas na Página", value: 0, percentage: 0 },
                { label: "Conversões", value: 0, percentage: 0 },
            ];
        }
        return [
            { label: "Views nos Stories", value: totalMetrics.views, percentage: 100 },
            { label: "Cliques no Link", value: totalMetrics.clicks, percentage: (totalMetrics.clicks / baseValue) * 100 },
            { label: "Visitas na Página", value: totalMetrics.pageVisits, percentage: (totalMetrics.pageVisits / baseValue) * 100 },
            { label: "Conversões", value: totalMetrics.sales, percentage: (totalMetrics.sales / baseValue) * 100 },
        ];
    }, [chartPosts]);

    const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
    const formatPercentageChange = (value: number) => {
        if (selectedPeriod === 'all_time') return null;
        if (!isFinite(value)) return <span className="text-green-500">Novo</span>;
        const sign = value >= 0 ? '+' : '';
        const color = value >= 0 ? 'text-green-500' : 'text-red-500';
        return <span className={color}>{`${sign}${value.toFixed(1)}%`}</span>;
    }
    const comparisonText = selectedPeriod !== 'all_time' ? "do período anterior" : "desde o início";

    const userName = useMemo(() => user?.displayName || user?.email?.split('@')[0] || "Usuário", [user]);

    const handlePeriodChange = (value: Period) => {
        if (value !== 'custom') setCustomDateRange(undefined);
        setSelectedPeriod(value);
    }

    const clearAllFilters = () => {
        setSelectedInfluencer("all");
        setSelectedProduct("all");
        setSelectedPost("all");
    }

    const activeFiltersCount = [selectedInfluencer, selectedProduct, selectedPost].filter(f => f !== 'all').length;

    const getFilterBadgeLabel = (type: 'influencer' | 'product' | 'post', id: string) => {
        if (id === 'all') return '';
        if (type === 'influencer') return allInfluencers.find(i => i.id === id)?.name;
        if (type === 'product') return allProducts.find(p => p.id === id)?.name;
        if (type === 'post') return allPosts.find(p => p.id === id)?.title;
        return '';
    }

    const FiltersComponent = ({ inSheet = false }: { inSheet?: boolean }) => (
        <div className="grid gap-4">
             <div>
                <Label htmlFor="influencer-filter">Influenciador</Label>
                <Select value={selectedInfluencer} onValueChange={setSelectedInfluencer}>
                    <SelectTrigger id="influencer-filter">
                        <SelectValue placeholder="Selecione um influenciador" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Influenciadores</SelectItem>
                        {allInfluencers.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
             <div>
                <Label htmlFor="product-filter">Produto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger id="product-filter">
                        <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Produtos</SelectItem>
                        {allProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
             <div>
                <Label htmlFor="post-filter">Postagem</Label>
                <Select value={selectedPost} onValueChange={setSelectedPost}>
                    <SelectTrigger id="post-filter">
                        <SelectValue placeholder="Selecione uma postagem" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Postagens</SelectItem>
                        {allPosts.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
             {inSheet && (
                 <Button variant="ghost" onClick={clearAllFilters} disabled={activeFiltersCount === 0}>
                     <X className="mr-2 h-4 w-4" />
                     Limpar Filtros
                </Button>
             )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-2 self-start w-full">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {greeting}, <span className="text-primary">{userName}!</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Visão geral do desempenho de suas campanhas.
                    </p>
                </div>
                <div className="flex w-full flex-col md:w-auto md:flex-row md:items-center gap-2">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn("w-full md:w-[260px] justify-start text-left font-normal", !customDateRange && selectedPeriod !== 'custom' && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    <span className="truncate">{getPeriodLabel(selectedPeriod, customDateRange)}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="flex flex-col space-y-1 p-2 border-b sm:border-b-0 sm:border-r">
                                        <Button variant={selectedPeriod === 'today' ? 'default' : 'ghost'} className="justify-start" onClick={() => handlePeriodChange('today')}>Hoje</Button>
                                        <Button variant={selectedPeriod === 'yesterday' ? 'default' : 'ghost'} className="justify-start" onClick={() => handlePeriodChange('yesterday')}>Ontem</Button>
                                        <Button variant={selectedPeriod === 'last_7_days' ? 'default' : 'ghost'} className="justify-start" onClick={() => handlePeriodChange('last_7_days')}>Últimos 7 dias</Button>
                                        <Button variant={selectedPeriod === 'this_month' ? 'default' : 'ghost'} className="justify-start" onClick={() => handlePeriodChange('this_month')}>Este mês</Button>
                                        <Button variant={selectedPeriod === 'all_time' ? 'default' : 'ghost'} className="justify-start" onClick={() => handlePeriodChange('all_time')}>Máximo</Button>
                                    </div>
                                    <Calendar
                                        initialFocus mode="range" defaultMonth={customDateRange?.from}
                                        selected={customDateRange} onSelect={(range) => { setCustomDateRange(range); if (range) setSelectedPeriod('custom'); }}
                                        numberOfMonths={2} locale={ptBR} className="hidden sm:block"
                                    />
                                    <Calendar
                                        initialFocus mode="range" defaultMonth={customDateRange?.from}
                                        selected={customDateRange} onSelect={(range) => { setCustomDateRange(range); if (range) setSelectedPeriod('custom'); }}
                                        numberOfMonths={1} locale={ptBR} className="block sm:hidden"
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                        
                        {/* Filters for Mobile */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="relative shrink-0 w-full">
                                        <Filter className="mr-2 h-4 w-4" />
                                        <span>Filtros</span>
                                        {activeFiltersCount > 0 &&
                                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                                {activeFiltersCount}
                                            </span>
                                        }
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Filtros Avançados</SheetTitle>
                                        <SheetDescription>
                                            Filtre os dados do dashboard para uma análise mais detalhada.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="py-4">
                                        <FiltersComponent inSheet={true} />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                         {/* Filters for Desktop */}
                        <div className="hidden md:block">
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="relative shrink-0">
                                        <Filter className="mr-2 h-4 w-4" />
                                        <span>Filtros</span>
                                        {activeFiltersCount > 0 &&
                                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                                {activeFiltersCount}
                                            </span>
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4" align="end">
                                    <FiltersComponent />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <Link href="/posts?new=true" className="w-full md:w-auto">
                        <Button className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nova Postagem
                        </Button>
                    </Link>
                </div>
            </div>

            {activeFiltersCount > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">Filtros Ativos:</span>
                            {selectedInfluencer !== 'all' && <Badge variant="secondary">{getFilterBadgeLabel('influencer', selectedInfluencer)}</Badge>}
                            {selectedProduct !== 'all' && <Badge variant="secondary">{getFilterBadgeLabel('product', selectedProduct)}</Badge>}
                            {selectedPost !== 'all' && <Badge variant="secondary" className="max-w-[150px] truncate">{getFilterBadgeLabel('post', selectedPost)}</Badge>}
                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={clearAllFilters}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Limpar Filtros</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(currentMetrics.revenue)}</div>
                        <p className="text-xs text-muted-foreground h-4">
                        {formatPercentageChange(revenueChange)} {selectedPeriod !== 'all_time' && comparisonText}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(currentMetrics.investment)}</div>
                        <p className="text-xs text-muted-foreground h-4">
                            {formatPercentageChange(expensesChange)} {selectedPeriod !== 'all_time' && comparisonText}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lucro</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(currentMetrics.profit)}</div>
                        <p className="text-xs text-muted-foreground h-4">
                            {formatPercentageChange(profitChange)} {selectedPeriod !== 'all_time' && comparisonText}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ROI</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPercentage(roi)}</div>
                        <p className="text-xs text-muted-foreground h-4">
                            {formatPercentageChange(roiChange)} {selectedPeriod !== 'all_time' && comparisonText}
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-7">
                <ProfitTrendAnalysis
                    data={profitTrendData}
                    periodLabel={chartPeriodLabel}
                />
                <PerformanceAnalysis 
                    roas={roas}
                    cpa={cpa}
                    conversionRate={conversionRate}
                    averageTicket={averageTicket}
                    periodLabel={getPeriodLabel(selectedPeriod, customDateRange)}
                />
            </div>
            <div className="grid gap-4">
                <FunnelChart data={funnelData} title={`Funil de Conversão (${chartPeriodLabel})`} />
            </div>
        </div>
    )
}

    