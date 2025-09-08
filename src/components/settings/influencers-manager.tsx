
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Trash2, Loader2, Edit, Users, Eye } from "lucide-react";
import { type Influencer } from "@/lib/data-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const influencerSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    instagram: z.string().optional(),
    followers: z.coerce.number().int("Deve ser um número inteiro").min(0, "Deve ser um número positivo").optional(),
    storyViews: z.coerce.number().int("Deve ser um número inteiro").min(0, "Deve ser um número positivo").optional(),
});
type InfluencerFormData = z.infer<typeof influencerSchema>;

function InfluencerForm({ onSuccess, influencerToEdit, onCancel }: { onSuccess: () => void, influencerToEdit?: Influencer | null, onCancel: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!influencerToEdit;

    const form = useForm<InfluencerFormData>({
        resolver: zodResolver(influencerSchema),
        defaultValues: {
            name: "",
            instagram: "",
            followers: undefined,
            storyViews: undefined,
        }
    });

    useEffect(() => {
        if (influencerToEdit) {
            form.reset({
                ...influencerToEdit,
                followers: influencerToEdit.followers,
                storyViews: influencerToEdit.storyViews,
            });
        } else {
            form.reset({ 
                name: "", 
                instagram: "", 
                followers: undefined, 
                storyViews: undefined 
            });
        }
    }, [influencerToEdit, form]);


    async function onSubmit(values: InfluencerFormData) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            if (isEditMode && influencerToEdit) {
                const influencerRef = doc(db, `users/${user.uid}/influencers`, influencerToEdit.id);
                await updateDoc(influencerRef, { ...values, userId: user.uid });
                toast({ title: "Sucesso!", description: "Influenciador atualizado." });
            } else {
                await addDoc(collection(db, `users/${user.uid}/influencers`), { ...values, userId: user.uid });
                toast({ title: "Sucesso!", description: "Novo influenciador adicionado." });
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving influencer: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o influenciador." });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
        let value = e.target.value;

        // Ensure it's lowercase
        value = value.toLowerCase();
        
        // Allow only letters, numbers, periods, and underscores after the @
        if (value.startsWith('@')) {
            const username = value.substring(1).replace(/[^a-z0-9._]/g, '');
            value = '@' + username;
        } else {
            // Handles case where user might have deleted the @
            value = value.replace(/[^a-z0-9._]/g, '');
        }

        if (value.length > 0 && !value.startsWith('@')) {
            value = '@' + value;
        }

        // Handle backspace when only '@' is left
        if (e.nativeEvent instanceof InputEvent && e.nativeEvent.inputType === 'deleteContentBackward' && field.value === '@') {
            value = '';
        }

        field.onChange(value);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
                 <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Influenciador</FormLabel>
                        <FormControl><Input placeholder="Ex: Maria Souza" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="instagram" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="@username" 
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => handleInstagramChange(e, field)}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="followers" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Seguidores</FormLabel>
                        <FormControl><Input type="number" placeholder="Ex: 150000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="storyViews" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Média de Views nos Stories</FormLabel>
                        <FormControl><Input type="number" placeholder="Ex: 15000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Salvar Alterações' : 'Adicionar Influenciador'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export function InfluencersManager() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);

    const fetchInfluencers = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const influencersCol = collection(db, `users/${user.uid}/influencers`);
            const q = query(influencersCol, orderBy("name", "asc"));
            const querySnapshot = await getDocs(q);
            const fetchedInfluencers = querySnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Influencer));
            setInfluencers(fetchedInfluencers);
        } catch (error) {
            console.error("Error fetching influencers: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar a lista de influenciadores." });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchInfluencers();
    }, [fetchInfluencers]);

    const handleDelete = async (influencerId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/influencers`, influencerId));
            toast({ title: "Sucesso!", description: "Influenciador removido." });
            fetchInfluencers();
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o influenciador." });
        }
    };
    
    const handleEdit = (influencer: Influencer) => {
        setEditingInfluencer(influencer);
        setIsSheetOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingInfluencer(null);
        setIsSheetOpen(true);
    }

    const handleFormSuccess = () => {
        setIsSheetOpen(false);
        setEditingInfluencer(null);
        fetchInfluencers();
    }
    
    const formatNumber = (num?: number) => {
        if (num === undefined || num === null) return 'N/A';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    }


    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Gerenciar Influenciadores</CardTitle>
                        <CardDescription>
                            Adicione e gerencie os influenciadores da sua campanha.
                        </CardDescription>
                    </div>
                    <Button onClick={handleAddNew}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Adicionar Influenciador
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading && [...Array(3)].map((_, i) => (
                             <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                <div className="flex items-center gap-4">
                                     <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                   <Skeleton className="h-8 w-8 rounded-md" />
                                   <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        ))}
                        {!loading && influencers.map(influencer => (
                            <div key={influencer.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                     <Avatar>
                                        <AvatarFallback>{influencer.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{influencer.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{influencer.instagram || 'Sem Instagram'}</p>
                                    </div>
                                </div>
                                 <div className="hidden md:flex items-center gap-6 mx-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{formatNumber(influencer.followers)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Eye className="h-4 w-4" />
                                         <span>{formatNumber(influencer.storyViews)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(influencer)}>
                                        <Edit className="h-4 w-4" />
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
                                                    Tem certeza que deseja excluir <strong>{influencer.name}</strong>? Esta ação não pode ser desfeita.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(influencer.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                         {!loading && influencers.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhum influenciador adicionado.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

             <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{editingInfluencer ? 'Editar Influenciador' : 'Adicionar Novo Influenciador'}</SheetTitle>
                        <SheetDescription>
                            {editingInfluencer ? 'Atualize os dados do influenciador abaixo.' : 'Preencha os dados para registrar um novo influenciador.'}
                        </SheetDescription>
                    </SheetHeader>
                    <InfluencerForm 
                        onSuccess={handleFormSuccess} 
                        influencerToEdit={editingInfluencer}
                        onCancel={() => setIsSheetOpen(false)}
                    />
                </SheetContent>
            </Sheet>
        </>
    )
}

    
