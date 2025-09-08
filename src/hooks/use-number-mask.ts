"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2, MoreHorizontal } from "lucide-react";
import { type Post, type Influencer, type Partner } from "@/lib/data-types";
import { useAuth } from "@/contexts/auth-context";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, updateDoc, DocumentData, Timestamp } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const postSchema = z.object({
    title: z.string().min(2, "Título é obrigatório"),
    description: z.string().optional(),
    link: z.string().url("Link inválido").optional().or(z.literal('')),
    influencerId: z.string().min(1, "Selecione um influenciador"),
    hasPartner: z.boolean().default(false),
    partnerId: z.string().optional(),
    partnerShareType: z.enum(['percentage', 'fixed']).optional(),
    partnerShareValue: z.coerce.number().min(0, "Valor da comissão não pode ser negativo").optional(),
    investment: z.coerce.number().min(0, "Investimento não pode ser negativo").optional(),
    revenue: z.coerce.number().min(0, "Receita não pode ser negativa").optional(),
    views: z.coerce.number().int("Views deve ser um número inteiro").min(0).optional(),
    clicks: z.coerce.number().int("Cliques deve ser um número inteiro").min(0).optional(),
    pageVisits: z.coerce.number().int("Visitas deve ser um número inteiro").min(0).optional(),
    sales: z.coerce.number().int("Vendas deve ser um número inteiro").min(0).optional(),
}).refine(data => {
    if (data.hasPartner) {
        return !!data.partnerId && !!data.partnerShareType && data.partnerShareValue !== undefined;
    }
    return true;
}, {
    message: "Se um sócio for adicionado, todos os campos de sócio são obrigatórios.",
    path: ['partnerId'] // You can choose a more appropriate path
});

type PostFormData = z.infer<typeof postSchema>;

function PostForm({ onSuccess, postToEdit, onCancel, influencers, partners }: { onSuccess: () => void, postToEdit?: Post | null, onCancel: () => void, influencers: Influencer[], partners: Partner[] }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!postToEdit;

    const form = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: "",
            description: "",
            link: "",
            influencerId: "",
            hasPartner: false,
            partnerId: "",
            partnerShareType: 'percentage',
            partnerShareValue: undefined,
            investment: undefined,
            revenue: undefined,
            views: undefined,
            clicks: undefined,
            pageVisits: undefined,
            sales: undefined,
        }
    });

    const hasPartner = useWatch({
        control: form.control,
        name: 'hasPartner'
    });

    useEffect(() => {
        if (postToEdit) {
            form.reset({
                 ...postToEdit,
                hasPartner: !!postToEdit.partnerId,
                investment: postToEdit.investment,
                revenue: postToEdit.revenue,
                views: postToEdit.views,
                clicks: postToEdit.clicks,
                pageVisits: postToEdit.pageVisits,
                sales: postToEdit.sales,
            });
        } else {
            form.reset({
                title: "",
                description: "",
                link: "",
                influencerId: "",
                hasPartner: false,
                partnerId: "",
                partnerShareType: 'percentage',
                partnerShareValue: undefined,
                investment: undefined,
                revenue: undefined,
                views: undefined,
                clicks: undefined,
                pageVisits: undefined,
                sales: undefined,
            });
        }
    }, [postToEdit, form]);


    async function onSubmit(values: PostFormData) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const postData: Partial<Post> = {
                ...values,
                userId: user.uid,
                createdAt: isEditMode ? postToEdit?.createdAt : Timestamp.now()
            };

            if (!values.hasPartner) {
                postData.partnerId = undefined;
                postData.partnerShareType = undefined;
                postData.partnerShareValue = undefined;
            }
            // @ts-ignore
            delete postData.hasPartner;


            if (isEditMode && postToEdit) {
                const postRef = doc(db, `users/${user.uid}/posts`, postToEdit.id);
                await updateDoc(postRef, postData);
                toast({ title: "Sucesso!", description: "Post atualizado." });
            } else {
                await addDoc(collection(db, `users/${user.uid}/posts`), postData as DocumentData);
                toast({ title: "Sucesso!", description: "Novo post adicionado." });
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving post: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o post." });
        } finally {
            setIsSubmitting(false);
        }
    }

    const influencerOptions = influencers.map(i => ({
        label: `${i.name} ${i.instagram ? `(${i.instagram})` : ''}`,
        value: i.id
    }));
    const partnerOptions = partners.map(p => ({ label: p.name, value: p.id }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Título</FormLabel>
                            <FormControl><Input placeholder="Ex: Post Promocional" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="influencerId" render={({ field }) => (
                        <FormItem className="flex flex-col md:col-span-2">
                            <FormLabel>Influenciador</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o influenciador" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {influencerOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Descrição</FormLabel>
                            <FormControl><Textarea placeholder="Detalhes sobre o post..." {...field} value={field.value ?? ''}/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="link" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Link de Divulgação</FormLabel>
                            <FormControl><Input placeholder="https://..." {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-medium">Métricas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="investment" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Investimento (R$)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="Ex: 1500.00" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="revenue" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Receita (R$)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="Ex: 5000.00" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="views" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Views (Stories)</FormLabel>
                                <FormControl><Input type="number" placeholder="Ex: 25000" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="clicks" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cliques (Link)</FormLabel>
                                <FormControl><Input type="number" placeholder="Ex: 1200" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="pageVisits" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Visitas na Página</FormLabel>
                                <FormControl><Input type="number" placeholder="Ex: 800" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="sales" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Conversões (Vendas)</FormLabel>
                                <FormControl><Input type="number" placeholder="Ex: 50" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                 </div>
                
                 <div className="space-y-4 p-4 border rounded-lg">
                     <FormField
                        control={form.control}
                        name="hasPartner"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                               <div className="space-y-0.5">
                                    <FormLabel className="text-base">Adicionar Sócio?</FormLabel>
                                    <FormDescription>
                                        Marque se este post tiver a participação de um sócio.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                    {hasPartner && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                             <FormField control={form.control} name="partnerId" render={({ field }) => (
                                <FormItem className="flex flex-col md:col-span-2">
                                    <FormLabel>Sócio</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o sócio" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {partnerOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                             <FormField
                                control={form.control}
                                name="partnerShareType"
                                render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Tipo de Comissão</FormLabel>
                                    <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="percentage" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Porcentagem (%)
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="fixed" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Valor Fixo (R$)
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <FormField control={form.control} name="partnerShareValue" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor da Comissão</FormLabel>
                                    <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}
                 </div>

                <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Salvar Alterações' : 'Adicionar Post'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}


export function PostsManager() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [posts, setPosts] = useState<Post[]>([]);
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const postsCol = collection(db, `users/${user.uid}/posts`);
            const influencersCol = collection(db, `users/${user.uid}/influencers`);
            const partnersCol = collection(db, `users/${user.uid}/partners`);

            const [postsSnapshot, influencersSnapshot, partnersSnapshot] = await Promise.all([
                getDocs(query(postsCol, orderBy("createdAt", "desc"))),
                getDocs(query(influencersCol, orderBy("name", "asc"))),
                getDocs(query(partnersCol, orderBy("name", "asc")))
            ]);

            const fetchedPosts = postsSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as Post));
            const fetchedInfluencers = influencersSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Influencer));
            const fetchedPartners = partnersSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Partner));
            
            setPosts(fetchedPosts);
            setInfluencers(fetchedInfluencers);
            setPartners(fetchedPartners);

        } catch (error) {
            console.error("Error fetching data: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os dados." });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchData();
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('new') === 'true') {
            handleAddNew();
             // Clean up URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, [fetchData]);

    const handleDelete = async (postId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/posts`, postId));
            toast({ title: "Sucesso!", description: "Post removido." });
            fetchData();
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o post." });
        }
    };
    
    const handleEdit = (post: Post) => {
        setEditingPost(post);
        setIsSheetOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingPost(null);
        setIsSheetOpen(true);
    }

    const handleFormSuccess = () => {
        setIsSheetOpen(false);
        setEditingPost(null);
        fetchData();
    }
    
    const getInfluencerName = (id: string) => influencers.find(i => i.id === id)?.name || 'N/A';
    const getPartnerName = (id?: string) => partners.find(p => p.id === id)?.name || 'Nenhum';

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return "R$ 0,00";
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const formatNumber = (value?: number) => {
        if (value === undefined || value === null) return "0";
        return value.toLocaleString('pt-BR');
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Gerenciar Posts</CardTitle>
                        <CardDescription>
                            Adicione e gerencie as publicações da sua campanha.
                        </CardDescription>
                    </div>
                     <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nova Postagem
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead className="hidden md:table-cell">Influenciador</TableHead>
                                <TableHead className="hidden md:table-cell">Sócio</TableHead>
                                <TableHead className="hidden lg:table-cell text-right">Investimento</TableHead>
                                <TableHead className="hidden lg:table-cell text-right">Receita</TableHead>
                                <TableHead className="hidden lg:table-cell text-right">Vendas</TableHead>
                                <TableHead><span className="sr-only">Ações</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                            {!loading && posts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell className="hidden md:table-cell">{getInfluencerName(post.influencerId)}</TableCell>
                                    <TableCell className="hidden md:table-cell">{getPartnerName(post.partnerId)}</TableCell>
                                    <TableCell className="hidden lg:table-cell text-right">{formatCurrency(post.investment)}</TableCell>
                                    <TableCell className="hidden lg:table-cell text-right">{formatCurrency(post.revenue)}</TableCell>
                                    <TableCell className="hidden lg:table-cell text-right">{formatNumber(post.sales)}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem onSelect={() => handleEdit(post)}>Editar</DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 hover:bg-accent hover:text-red-700">Excluir</button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Tem certeza que deseja excluir o post <strong>{post.title}</strong>? Esta ação não pode ser desfeita.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive hover:bg-destructive/90">
                                                                    Excluir
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {!loading && posts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">
                                        Nenhum post adicionado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingPost ? 'Editar Post' : 'Adicionar Novo Post'}</SheetTitle>
                        <SheetDescription>
                            {editingPost ? 'Atualize os dados do post abaixo.' : 'Preencha os dados para registrar um novo post.'}
                        </SheetDescription>
                    </SheetHeader>
                    <PostForm 
                        onSuccess={handleFormSuccess} 
                        postToEdit={editingPost}
                        onCancel={() => setIsSheetOpen(false)}
                        influencers={influencers}
                        partners={partners}
                    />
                </SheetContent>
            </Sheet>
        </>
    )
}