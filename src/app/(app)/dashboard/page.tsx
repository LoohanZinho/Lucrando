
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, TrendingUp, Activity, Target, Percent, ShoppingCart, PlusCircle } from "lucide-react";
import { ProfitChart } from "@/components/profit-chart";
import { useAuth } from '@/contexts/auth-context';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { type Post } from '@/lib/data-types';
import { FunnelChart } from '@/components/funnel-chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState("Olá");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting("Bom dia");
        } else if (hour < 18) {
            setGreeting("Boa tarde");
        } else {
            setGreeting("Boa noite");
        }
    }, []);


    useEffect(() => {
        if (!user) return;

        const fetchPosts = async () => {
            setLoading(true);
            try {
                const postsCol = collection(db, `users/${user.uid}/posts`);
                const q = query(postsCol);
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
                console.error("Error fetching posts for dashboard: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [user]);
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const currentMonthPosts = posts.filter(p => new Date(p.createdAt) > lastMonth);
    const previousMonthPosts = posts.filter(p => {
        const postDate = new Date(p.createdAt);
        return postDate <= lastMonth && postDate > new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1);
    });

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

    const currentMetrics = calculateMetrics(currentMonthPosts);
    const previousMetrics = calculateMetrics(previousMonthPosts);
    
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
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const monthlyProfit: { [key: string]: number } = {};

        posts.forEach(post => {
            const date = new Date(post.createdAt);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            const profit = (post.revenue || 0) - (post.investment || 0);
            monthlyProfit[monthKey] = (monthlyProfit[monthKey] || 0) + profit;
        });

        const sortedMonths = Object.keys(monthlyProfit).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        return sortedMonths.map(monthKey => {
            const [year, monthIndex] = monthKey.split('-');
            return {
                month: months[parseInt(monthIndex, 10)],
                profit: monthlyProfit[monthKey],
            };
        });
    }, [posts]);
    
    const funnelData = useMemo(() => {
        const totalMetrics = posts.reduce((acc, post) => {
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
    }, [posts]);


    const formatCurrency = (value: number) => `R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
    const formatPercentageChange = (value: number) => {
        if (!isFinite(value)) return <span className="text-green-500">Novo</span>;
        const sign = value >= 0 ? '+' : '';
        const color = value >= 0 ? 'text-green-500' : 'text-red-500';
        return <span className={color}>{`${sign}${value.toFixed(1)}%`}</span>;
    }

    const userName = useMemo(() => {
      if (!user) return "";
      return user.displayName || user.email?.split('@')[0] || "Usuário";
    }, [user]);


    if (loading) {
        return <div className="p-8">Carregando dashboard...</div>
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
             <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {greeting}, <span className="text-primary">{userName}!</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Seja bem-vindo ao LCI! Visão geral do desempenho de suas campanhas.
                    </p>
                </div>
                 <Link href="/posts">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nova Postagem
                    </Button>
                </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(currentMetrics.revenue)}</div>
                        <p className="text-xs text-muted-foreground">
                           {formatPercentageChange(revenueChange)} do último mês
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(currentMetrics.investment)}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatPercentageChange(expensesChange)} do último mês
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
                        <p className="text-xs text-muted-foreground">
                            {formatPercentageChange(profitChange)} do último mês
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
                        <p className="text-xs text-muted-foreground">
                            {formatPercentageChange(roiChange)} do último mês
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Análise de Tendência de Lucro</CardTitle>
                         <p className="text-sm text-muted-foreground">Lucro mensal ao longo do ano.</p>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ProfitChart data={profitTrendData} />
                    </CardContent>
                </Card>
                <Card className="col-span-4 md:col-span-3">
                     <CardHeader>
                        <CardTitle>Análise de Performance</CardTitle>
                        <p className="text-sm text-muted-foreground">Métricas chave de performance da campanha.</p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                       <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-4">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>ROAS</span>
                          </div>
                          <div className="text-3xl font-bold">{roas.toFixed(1)}x</div>
                        </div>
                        <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Percent className="h-4 w-4 text-muted-foreground" />
                                <span>Taxa de Conversão</span>
                            </div>
                            <div className="text-3xl font-bold">{formatPercentage(conversionRate)}</div>
                        </div>
                        <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>CPA</span>
                            </div>
                            <div className="text-3xl font-bold">{formatCurrency(cpa)}</div>
                        </div>
                        <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                <span>Ticket Médio</span>
                            </div>
                            <div className="text-3xl font-bold">{formatCurrency(averageTicket)}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div className="grid gap-4">
                <FunnelChart data={funnelData} />
            </div>
        </div>
    )
}
