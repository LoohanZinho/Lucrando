"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Trash2, Loader2, Edit } from "lucide-react";
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
        }
    });

    useEffect(() => {
        if (influencerToEdit) {
            form.reset(influencerToEdit);
        } else {
            form.reset({ name: "" });
        }
    }, [influencerToEdit, form]);


    async function onSubmit(values: InfluencerFormData) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            if (isEditMode && influencerToEdit) {
                const influencerRef = doc(db, "influencers", influencerToEdit.id);
                await updateDoc(influencerRef, { ...values, userId: user.uid });
                toast({ title: "Sucesso!", description: "Influenciador atualizado." });
            } else {
                await addDoc(collection(db, "influencers"), { ...values, userId: user.uid });
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
            const influencersCol = collection(db, 'influencers');
            const q = query(influencersCol, where('userId', '==', user.uid), orderBy("name", "asc"));
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
            await deleteDoc(doc(db, "influencers", influencerId));
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


    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                     <CardTitle>Seus Influenciadores</CardTitle>
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
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                   <Skeleton className="h-8 w-8 rounded-md" />
                                   <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        ))}
                        {!loading && influencers.map(influencer => (
                            <div key={influencer.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                <div className="flex items-center gap-4">
                                     <Avatar>
                                        <AvatarFallback>{influencer.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{influencer.name}</p>
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
