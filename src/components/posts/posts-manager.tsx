

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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const postSchema = z.object({
    title: z.string().min(2, "Título é obrigatório"),
    description: z.string().optional(),
    link: z.string().url("Link inválido").optional().or(z.literal('')),
    influencerId: z.string().min(1, "Selecione um influenciador"),
    partnerId: z.string().min(1, "Selecione um sócio"),
    investment: z.coerce.number().min(0, "Investimento não pode ser negativo").optional(),
    revenue: z.coerce.number().min(0, "Receita não pode ser negativa").optional(),
    views: z.coerce.number().int("Views deve ser um número inteiro").min(0).optional(),
    clicks: z.coerce.number().int("Cliques deve ser um número inteiro").min(0).optional(),
    pageVisits: z.coerce.number().int("Visitas deve ser um número inteiro").min(0).optional(),
    sales: z.coerce.number().int("Vendas deve ser um número inteiro").min(0).optional(),
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
            partnerId: "",
            investment: 0,
            revenue: 0,
            views: 0,
            clicks: 0,
            pageVisits: 0,
            sales: 0,
        }
    });

    useEffect(() => {
        if (postToEdit) {
            form.reset({
                 ...postToEdit,
                views: postToEdit.views ?? 0,
                clicks: postToEdit.clicks ?? 0,
                pageVisits: postToEdit.pageVisits ?? 0,
                sales: postToEdit.sales ?? 0,
                revenue: postToEdit.revenue ?? 0,
                investment: postToEdit.investment ?? 0,
            });
        } else {
            form.reset({
                title: "",
                description: "",
                link: "",
                influencerId: "",
                partnerId: "",
                investment: 0,
                revenue: 0,
                views: 0,
                clicks: 0,
                pageVisits: 0,
                sales: 0,
            });
        }
    }, [postToEdit, form]);


    async function onSubmit(values: PostFormData) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const postData = {
                ...values,
                userId: user.uid,
                createdAt: isEditMode ? postToEdit?.createdAt : Timestamp.now()
            };

            if (isEditMode && postToEdit) {
                const postRef = doc(db, `users/${user.uid}/posts`, postToEdit.id);
                await updateDoc(postRef, postData);
                toast({ title: "Sucesso!", description: "Post atualizado." });
            } else {
                await addDoc(collection(db, `users/${user.uid}/posts`), postData);
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

    const influencerOptions = influencers.map(i => ({ label: i.name, value: i.id }));
    const partnerOptions = partners.map(p => ({ label: p.name, value: p.id }));

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
                    <FormField control={form.control} name="link" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Link</FormLabel>
                            <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="influencerId" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Influenciador</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={influencerOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione o influenciador"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="partnerId" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Sócio</FormLabel>
                            <FormControl>
                                <Combobox
                                    options={partnerOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione o sócio"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Descrição</FormLabel>
                            <FormControl><Textarea placeholder="Detalhes sobre o post..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="investment" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Investimento (R$)</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
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
                    <FormField control={form.control} name="views" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Views (Stories)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="clicks" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cliques (Link)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="pageVisits" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Visitas na Página</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="sales" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Conversões (Vendas)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
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
    const getPartnerName = (id: string) => partners.find(p => p.id === id)?.name || 'N/A';

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Gerenciar Posts</CardTitle>
                    <CardDescription>
                        Adicione e gerencie as publicações da sua campanha.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead className="hidden md:table-cell">Influenciador</TableHead>
                                <TableHead className="hidden md:table-cell">Sócio</TableHead>
                                <TableHead className="hidden lg:table-cell">Investimento</TableHead>
                                <TableHead className="hidden lg:table-cell">Receita</TableHead>
                                <TableHead className="hidden lg:table-cell">Vendas</TableHead>
                                <TableHead><span className="sr-only">Ações</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                </TableRow>
                            ))}
                            {!loading && posts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell className="hidden md:table-cell">{getInfluencerName(post.influencerId)}</TableCell>
                                    <TableCell className="hidden md:table-cell">{getPartnerName(post.partnerId)}</TableCell>
                                    <TableCell className="hidden lg:table-cell">R$ {post.investment?.toFixed(2) ?? '0.00'}</TableCell>
                                    <TableCell className="hidden lg:table-cell">R$ {post.revenue?.toFixed(2) ?? '0.00'}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{post.sales ?? 0}</TableCell>
                                    <TableCell>
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
                                                        <Button variant="ghost" className="w-full justify-start cursor-pointer font-normal h-8 px-2 text-sm relative flex select-none items-center rounded-sm transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 hover:bg-accent hover:text-red-700">Excluir</Button>
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
