
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2, Eye, Pencil, Trash2, Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { type Post, type Influencer, type Product } from "@/lib/data-types";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostDetailsDialog } from "./post-details-dialog";
import { Separator } from "../ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const postSchema = z.object({
    title: z.string().min(2, "Título é obrigatório"),
    description: z.string().optional(),
    link: z.string().url("Link inválido").optional().or(z.literal('')),
    postDate: z.date({ required_error: "A data do post é obrigatória." }),
    
    influencerSelection: z.enum(['existing', 'new']).default('existing'),
    influencerId: z.string().optional(),
    newInfluencerName: z.string().optional(),
    newInfluencerInstagram: z.string().optional(),

    productSelection: z.enum(['existing', 'new']).default('existing'),
    productId: z.string().optional(),
    newProductName: z.string().optional(),
    newProductDescription: z.string().optional(),

    investment: z.coerce.number().min(0, "Investimento não pode ser negativo").optional(),
    revenue: z.coerce.number().min(0, "Receita não pode ser negativa").optional(),
    views: z.coerce.number().int("Views deve ser um número inteiro").min(0).optional(),
    clicks: z.coerce.number().int("Cliques deve ser um número inteiro").min(0).optional(),
    sales: z.coerce.number().int("Vendas deve ser um número inteiro").min(0).optional(),
})
.refine((data) => {
    if (data.productSelection === 'existing') return !!data.productId;
    return true;
}, { message: "Selecione um produto existente.", path: ['productId']})
.refine((data) => {
     if (data.productSelection === 'new') return data.newProductName && data.newProductName.length >= 2;
    return true;
}, { message: "O nome do novo produto é obrigatório.", path: ['newProductName']})
.refine((data) => {
    if (data.influencerSelection === 'existing') return !!data.influencerId;
    return true;
}, { message: "Selecione um influenciador existente.", path: ['influencerId']})
.refine((data) => {
    if (data.influencerSelection === 'new') return data.newInfluencerName && data.newInfluencerName.length >= 2;
    return true;
}, { message: "O nome do novo influenciador é obrigatório.", path: ['newInfluencerName']});


type PostFormData = z.infer<typeof postSchema>;

type PostFormProps = {
  onSuccess: () => void;
  postToEdit?: Post | null;
  onCancel: () => void;
  influencers: Influencer[];
  products: Product[];
  onDataCreated: () => void;
  initialDate?: Date;
};

function PostForm({ onSuccess, postToEdit, onCancel, influencers, products, onDataCreated, initialDate }: PostFormProps) {
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
            postDate: initialDate || new Date(),
            influencerSelection: 'existing',
            influencerId: undefined,
            newInfluencerName: "",
            newInfluencerInstagram: "",
            productSelection: 'existing',
            productId: undefined,
            newProductName: "",
            newProductDescription: "",
            investment: undefined,
            revenue: undefined,
            views: undefined,
            clicks: undefined,
            sales: undefined,
        }
    });

    const productSelection = useWatch({ control: form.control, name: 'productSelection' });
    const influencerSelection = useWatch({ control: form.control, name: 'influencerSelection' });

    useEffect(() => {
        if (postToEdit) {
            form.reset({
                ...postToEdit,
                postDate: postToEdit.postDate instanceof Timestamp ? postToEdit.postDate.toDate() : postToEdit.postDate,
                investment: postToEdit.investment ?? undefined,
                revenue: postToEdit.revenue ?? undefined,
                views: postToEdit.views ?? undefined,
                clicks: postToEdit.clicks ?? undefined,
                sales: postToEdit.sales ?? undefined,
                productSelection: 'existing', 
                productId: postToEdit.productId || undefined,
                influencerSelection: 'existing',
                influencerId: postToEdit.influencerId || undefined
            });
        } else {
            form.reset({
                title: "",
                description: "",
                link: "",
                postDate: initialDate || new Date(),
                influencerSelection: 'existing',
                influencerId: undefined,
                newInfluencerName: "",
                newInfluencerInstagram: "",
                productSelection: 'existing',
                productId: undefined,
                newProductName: "",
                newProductDescription: "",
                investment: undefined,
                revenue: undefined,
                views: undefined,
                clicks: undefined,
                sales: undefined,
            });
        }
    }, [postToEdit, form, initialDate]);

    async function onSubmit(values: PostFormData) {
        if (!user) {
            toast({ variant: "destructive", title: "Erro de Autenticação", description: "Sua sessão pode ter expirado. Por favor, tente novamente." });
            return;
        }
        
        setIsSubmitting(true);
        try {
            let finalProductId = values.productId;
            if (values.productSelection === 'new' && !isEditMode) {
                const newProductData = { name: values.newProductName!, description: values.newProductDescription || "", userId: user.id };
                const newProductRef = await addDoc(collection(db, `users/${user.id}/products`), newProductData);
                finalProductId = newProductRef.id;
                toast({ title: "Produto Criado!", description: `O produto "${newProductData.name}" foi adicionado.` });
            }

            let finalInfluencerId = values.influencerId;
            if (values.influencerSelection === 'new' && !isEditMode) {
                const newInfluencerData = { name: values.newInfluencerName!, instagram: values.newInfluencerInstagram || "", userId: user.id };
                const newInfluencerRef = await addDoc(collection(db, `users/${user.id}/influencers`), newInfluencerData);
                finalInfluencerId = newInfluencerRef.id;
                toast({ title: "Influenciador Criado!", description: `O influenciador "${newInfluencerData.name}" foi adicionado.` });
            }
            
            if (!finalProductId || !finalInfluencerId) {
                toast({ variant: "destructive", title: "Erro", description: "É necessário selecionar ou criar um produto e um influenciador." });
                setIsSubmitting(false);
                return;
            }

            if (values.productSelection === 'new' || values.influencerSelection === 'new') {
                onDataCreated();
            }

            const postData: Omit<Post, 'id' | 'postDate'> & { [key: string]: any } = {
                ...values,
                productId: finalProductId!,
                influencerId: finalInfluencerId!,
                userId: user.id,
                postDate: Timestamp.fromDate(values.postDate)
            };

            // Clean up temporary form fields
            delete postData.productSelection;
            delete postData.newProductName;
            delete postData.newProductDescription;
            delete postData.influencerSelection;
            delete postData.newInfluencerName;
            delete postData.newInfluencerInstagram;


            if (isEditMode && postToEdit) {
                const postRef = doc(db, `users/${user.id}/posts`, postToEdit.id);
                await updateDoc(postRef, postData);
                toast({ title: "Sucesso!", description: "Post atualizado." });
            } else {
                await addDoc(collection(db, `users/${user.id}/posts`), postData);
                toast({ title: "Sucesso!", description: "Novo post adicionado." });
            }
            onSuccess();
        } catch (error) {
            console.error("Erro ao salvar post: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o post." });
        } finally {
            setIsSubmitting(false);
        }
    }

    const influencerOptions = influencers.map(i => ({ label: `${i.name} ${i.instagram ? `(${i.instagram})` : ''}`, value: i.id }));
    const productOptions = products.map(p => ({ label: p.name, value: p.id }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl><Input placeholder="Ex: Post Promocional" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                     <FormField control={form.control} name="postDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Data do Post</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}/>

                    <div className="md:col-span-2 space-y-4 p-4 border rounded-lg">
                        <FormField control={form.control} name="influencerSelection" render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Influenciador</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4" disabled={isEditMode}>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="existing" /></FormControl>
                                            <FormLabel className="font-normal">Existente</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="new" /></FormControl>
                                            <FormLabel className="font-normal">Novo</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {influencerSelection === 'existing' && (
                            <FormField control={form.control} name="influencerId" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Selecione o Influenciador</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={influencers.length === 0}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={influencers.length === 0 ? "Nenhum influenciador cadastrado" : "Selecione..."} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {influencerOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                        {influencerSelection === 'new' && !isEditMode && (
                            <div className="space-y-4 pt-4 border-t">
                                <FormField control={form.control} name="newInfluencerName" render={({ field }) => (
                                    <FormItem><FormLabel>Nome do Novo Influenciador</FormLabel><FormControl><Input placeholder="Ex: Maria Souza" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="newInfluencerInstagram" render={({ field }) => (
                                    <FormItem><FormLabel>Instagram (Opcional)</FormLabel><FormControl><Input placeholder="@username" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-4 p-4 border rounded-lg">
                        <FormField control={form.control} name="productSelection" render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Produto Divulgado</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4" disabled={isEditMode}>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="existing" /></FormControl>
                                            <FormLabel className="font-normal">Existente</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="new" /></FormControl>
                                            <FormLabel className="font-normal">Novo</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {productSelection === 'existing' && (
                             <FormField control={form.control} name="productId" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Selecione o Produto</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={products.length === 0}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={products.length === 0 ? "Nenhum produto cadastrado" : "Selecione..."} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {productOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                        {productSelection === 'new' && !isEditMode && (
                            <div className="space-y-4 pt-4 border-t">
                                <FormField control={form.control} name="newProductName" render={({ field }) => (
                                    <FormItem><FormLabel>Nome do Novo Produto</FormLabel><FormControl><Input placeholder="Ex: Curso de Finanças" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="newProductDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descrição (Opcional)</FormLabel><FormControl><Textarea placeholder="Descreva o novo produto" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        )}
                    </div>
                    
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
                            <FormItem><FormLabel>Investimento (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ex: 1500.00" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="revenue" render={({ field }) => (
                            <FormItem><FormLabel>Receita (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ex: 5000.00" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="views" render={({ field }) => (
                            <FormItem><FormLabel>Views (Stories)</FormLabel><FormControl><Input type="number" placeholder="Ex: 25000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="clicks" render={({ field }) => (
                            <FormItem><FormLabel>Cliques (Link)</FormLabel><FormControl><Input type="number" placeholder="Ex: 1200" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="sales" render={({ field }) => (
                            <FormItem><FormLabel>Conversões (Vendas)</FormLabel><FormControl><Input type="number" placeholder="Ex: 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
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
    const searchParams = useSearchParams();
    const [posts, setPosts] = useState<Post[]>([]);
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [viewingPost, setViewingPost] = useState<Post | null>(null);
    const [initialDate, setInitialDate] = useState<Date | undefined>();

    const fetchData = useCallback(async (showLoading = true) => {
        if (!user) return;
        if(showLoading) setLoading(true);
        try {
            const postsCol = collection(db, `users/${user.id}/posts`);
            const influencersCol = collection(db, `users/${user.id}/influencers`);
            const productsCol = collection(db, `users/${user.id}/products`);

            const [postsSnapshot, influencersSnapshot, productsSnapshot] = await Promise.all([
                getDocs(query(postsCol, orderBy("postDate", "desc"))),
                getDocs(query(influencersCol, orderBy("name", "asc"))),
                getDocs(query(productsCol, orderBy("name", "asc"))),
            ]);

            const fetchedPosts = postsSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data(), postDate: doc.data().postDate.toDate() } as Post));
            const fetchedInfluencers = influencersSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Influencer));
            const fetchedProducts = productsSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Product));
            
            setPosts(fetchedPosts);
            setInfluencers(fetchedInfluencers);
            setProducts(fetchedProducts);

        } catch (error) {
            console.error("Erro ao buscar dados: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os dados." });
        } finally {
            if(showLoading) setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const newParam = searchParams.get('new');
        const dateParam = searchParams.get('date');
        const editParam = searchParams.get('edit');

        if (newParam === 'true') {
            if (dateParam) {
                setInitialDate(parseISO(dateParam));
            } else {
                setInitialDate(undefined);
            }
            handleAddNew();
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
        if (editParam) {
            const postToEdit = posts.find(p => p.id === editParam);
            if (postToEdit) {
                handleEdit(postToEdit);
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
    }, [searchParams, posts]);

    const handleDelete = async (postId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.id}/posts`, postId));
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

    const handleViewDetails = (post: Post) => {
        setViewingPost(post);
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
    
    const getInfluencerDisplay = (id: string) => {
        const influencer = influencers.find(i => i.id === id);
        if (!influencer) return 'N/A';
        return `${influencer.name} ${influencer.instagram ? `(${influencer.instagram})` : ''}`;
    };

    const getInfluencer = (id: string) => influencers.find(i => i.id === id);
    const getProduct = (id: string) => products.find(p => p.id === id);

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return "R$ 0,00";
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const formatNumber = (value?: number) => {
        if (value === undefined || value === null) return "0";
        return value.toLocaleString('pt-BR');
    }

    const getDateToFormat = (date: Date | Timestamp): Date => {
        return date instanceof Timestamp ? date.toDate() : date;
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Gerenciar Posts</CardTitle>
                        <CardDescription>
                            Adicione e gerencie as publicações da sua campanha.
                        </CardDescription>
                    </div>
                     <Button onClick={handleAddNew} className="w-full md:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nova Postagem
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Produto</TableHead>
                                    <TableHead className="hidden md:table-cell">Influenciador</TableHead>
                                    <TableHead className="hidden lg:table-cell text-right">Investimento</TableHead>
                                    <TableHead className="hidden lg:table-cell text-right">Receita</TableHead>
                                    <TableHead className="hidden md:table-cell text-right">Vendas</TableHead>
                                    <TableHead><span className="sr-only">Ações</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                                        <TableCell>
                                             <div className="flex justify-end items-center gap-2">
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && posts.map(post => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell>{format(getDateToFormat(post.postDate), "dd/MM/yy")}</TableCell>
                                        <TableCell>{getProduct(post.productId)?.name || 'N/A'}</TableCell>
                                        <TableCell className="hidden md:table-cell">{getInfluencerDisplay(post.influencerId)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-right">{formatCurrency(post.investment)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-right">{formatCurrency(post.revenue)}</TableCell>
                                        <TableCell className="hidden md:table-cell text-right">{formatNumber(post.sales)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end items-center gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleViewDetails(post)}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Ver Detalhes</span>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(post)}>
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Excluir</span>
                                                        </Button>
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
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && posts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4">
                                            Nenhum post adicionado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="md:hidden space-y-4">
                         {loading && [...Array(3)].map((_, i) => (
                             <Card key={i} className="p-4">
                                 <div className="flex justify-between items-start">
                                     <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-40" />
                                     </div>
                                      <Skeleton className="h-8 w-8" />
                                 </div>
                             </Card>
                         ))}
                        {!loading && posts.map(post => (
                             <Card key={post.id}>
                                <CardContent className="p-0">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2 gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{post.title}</h3>
                                                <p className="text-sm text-muted-foreground">{format(getDateToFormat(post.postDate), "dd/MM/yyyy")}</p>
                                                <p className="text-sm text-muted-foreground">{getInfluencerDisplay(post.influencerId)}</p>
                                                <p className="text-sm text-muted-foreground">Produto: {getProduct(post.productId)?.name || 'N/A'}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(post)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="p-4">
                                        <Button variant="ghost" className="w-full justify-center" onClick={() => handleViewDetails(post)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Ver Detalhes
                                        </Button>
                                    </div>
                                </CardContent>
                             </Card>
                        ))}
                         {!loading && posts.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhum post adicionado.
                            </p>
                        )}
                    </div>
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
                        products={products}
                        onDataCreated={() => fetchData(false)}
                        initialDate={initialDate}
                    />
                </SheetContent>
            </Sheet>

            {viewingPost && (
                <PostDetailsDialog
                    post={viewingPost}
                    influencer={getInfluencer(viewingPost.influencerId)}
                    product={getProduct(viewingPost.productId)}
                    open={!!viewingPost}
                    onOpenChange={(isOpen) => !isOpen && setViewingPost(null)}
                />
            )}
        </>
    )
}

    