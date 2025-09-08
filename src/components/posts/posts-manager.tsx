
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Loader2, Edit, MoreHorizontal, LinkIcon } from "lucide-react";
import { type Post, type Influencer, type Partner } from "@/lib/data-types";
import { useAuth } from "@/contexts/auth-context";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, orderBy, updateDoc, DocumentData } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "../ui/combobox";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const postSchema = z.object({
    title: z.string().min(3, "Título é obrigatório (mínimo 3 caracteres)."),
    description: z.string().optional(),
    link: z.string().url("Link inválido.").min(1, "Link é obrigatório."),
    influencerId: z.string().min(1, "Selecione um influenciador."),
    partnerId: z.string().min(1, "Selecione um sócio."),
    clicks: z.coerce.number().min(0, "Cliques não podem ser negativos.").default(0),
    sales: z.coerce.number().min(0, "Vendas não podem ser negativas.").default(0),
    revenue: z.coerce.number().min(0, "Receita não pode ser negativa.").default(0),
});
type PostFormData = z.infer<typeof postSchema>;

function PostForm({ onSuccess, postToEdit, influencers, partners, onCancel }: { onSuccess: () => void, postToEdit?: Post | null, influencers: Influencer[], partners: Partner[], onCancel: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!postToEdit;

    const form = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: postToEdit ? {
            ...postToEdit,
            clicks: postToEdit.clicks ?? 0,
            sales: postToEdit.sales ?? 0,
            revenue: postToEdit.revenue ?? 0,
        } : {
            title: "",
            description: "",
            link: "",
            influencerId: "",
            partnerId: "",
            clicks: 0,
            sales: 0,
            revenue: 0,
        }
    });

     useEffect(() => {
        if (postToEdit) {
            form.reset({
                 ...postToEdit,
                clicks: postToEdit.clicks ?? 0,
                sales: postToEdit.sales ?? 0,
                revenue: postToEdit.revenue ?? 0,
            });
        } else {
            form.reset({
                title: "",
                description: "",
                link: "",
                influencerId: "",
                partnerId: "",
                clicks: 0,
                sales: 0,
                revenue: 0,
            });
        }
    }, [postToEdit, form]);


    async function onSubmit(values: PostFormData) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            if (isEditMode && postToEdit) {
                const postRef = doc(db, "posts", postToEdit.id);
                await updateDoc(postRef, { ...values });
                toast({ title: "Sucesso!", description: "Post atualizado." });
            } else {
                await addDoc(collection(db, "posts"), { ...values, userId: user.uid, createdAt: new Date().toISOString() });
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
    
    const influencerOptions = useMemo(() => influencers.map(i => ({ label: i.name, value: i.id })), [influencers]);
    const partnerOptions = useMemo(() => partners.map(p => ({ label: p.name, value: p.id })), [partners]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Título do Post</FormLabel>
                        <FormControl><Input placeholder="Ex: Divulgação do Produto X" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl><Textarea placeholder="Descreva brevemente a campanha ou post." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="link" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Link de Afiliado</FormLabel>
                        <FormControl><Input placeholder="https://seu.link.de/afiliado" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="influencerId" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Influenciador</FormLabel>
                            <Combobox 
                                options={influencerOptions}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Selecione..."
                            />
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="partnerId" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Sócio</FormLabel>
                            <Combobox 
                                options={partnerOptions}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Selecione..."
                            />
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <Card className="bg-secondary/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Métricas</CardTitle>
                        <CardDescription className="text-xs">
                            Insira os dados de performance do post.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField control={form.control} name="clicks" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cliques</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="sales" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vendas</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="revenue" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Receita (R$)</FormLabel>
                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Salvar Alterações' : 'Criar Post'}
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

    const fetchPostsAndRelations = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const postsCol = collection(db, 'posts');
            const influencersCol = collection(db, 'influencers');
            const partnersCol = collection(db, 'partners');

            const postQuery = query(postsCol, where('userId', '==', user.uid), orderBy("createdAt", "desc"));
            const influencerQuery = query(influencersCol, where('userId', '==', user.uid), orderBy("name", "asc"));
            const partnerQuery = query(partnersCol, where('userId', '==', user.uid), orderBy("name", "asc"));

            const [postSnapshot, influencerSnapshot, partnerSnapshot] = await Promise.all([
                getDocs(postQuery),
                getDocs(influencerQuery),
                getDocs(partnerQuery),
            ]);

            const fetchedPosts = postSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Post));
            const fetchedInfluencers = influencerSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Influencer));
            const fetchedPartners = partnerSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Partner));
            
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
        fetchPostsAndRelations();
    }, [fetchPostsAndRelations]);

    const handleDelete = async (postId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, "posts", postId));
            toast({ title: "Sucesso!", description: "Post removido." });
            fetchPostsAndRelations();
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
        fetchPostsAndRelations();
    }
    
    const getInfluencerName = (id: string) => influencers.find(i => i.id === id)?.name || 'N/A';
    const getPartnerName = (id: string) => partners.find(p => p.id === id)?.name || 'N/A';


    return (
        <>
             <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
                <p className="text-muted-foreground">
                    Adicione, edite e gerencie os posts das suas campanhas.
                </p>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Seus Posts</CardTitle>
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Post
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Post</TableHead>
                                <TableHead className="hidden md:table-cell">Influenciador</TableHead>
                                <TableHead className="hidden lg:table-cell">Sócio</TableHead>
                                <TableHead className="text-right">Receita</TableHead>
                                <TableHead className="hidden md:table-cell text-center">Métricas</TableHead>
                                <TableHead><span className="sr-only">Ações</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                            {!loading && posts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell>
                                        <div className="font-medium">{post.title}</div>
                                        <div className="text-xs text-muted-foreground hidden sm:inline">
                                            {format(new Date(post.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{getInfluencerName(post.influencerId)}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{getPartnerName(post.partnerId)}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        R${' '}{post.revenue.toFixed(2).replace('.', ',')}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs text-center">
                                        {post.clicks} cliques • {post.sales} vendas
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(post)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.open(post.link, '_blank')}>
                                                        <LinkIcon className="mr-2 h-4 w-4" />
                                                        Abrir Link
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Excluir
                                                            </DropdownMenuItem>
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
                        </TableBody>
                    </Table>
                    {!loading && posts.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Nenhum post adicionado ainda.
                        </p>
                    )}
                </CardContent>
            </Card>

             <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full max-w-[400px] sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>{editingPost ? 'Editar Post' : 'Adicionar Novo Post'}</SheetTitle>
                        <SheetDescription>
                            {editingPost ? 'Atualize os dados do seu post.' : 'Preencha os dados para registrar um novo post.'}
                        </SheetDescription>
                    </SheetHeader>
                     <div className="mt-4 overflow-y-auto pr-6 h-[calc(100vh-100px)]">
                        <PostForm 
                            onSuccess={handleFormSuccess} 
                            postToEdit={editingPost}
                            influencers={influencers}
                            partners={partners}
                            onCancel={() => setIsSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
