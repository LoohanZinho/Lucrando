
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Trash2, Loader2, Edit, Eye } from "lucide-react";
import { type Partner } from "@/lib/data-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, updateDoc, DocumentData } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { PartnerHistoryDialog } from "./partner-history-dialog";

const partnerSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
});
type PartnerFormData = z.infer<typeof partnerSchema>;

function PartnerForm({ onSuccess, partnerToEdit, onCancel }: { onSuccess: () => void, partnerToEdit?: Partner | null, onCancel: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!partnerToEdit;

    const form = useForm<PartnerFormData>({
        resolver: zodResolver(partnerSchema),
        defaultValues: {
            name: "",
        }
    });

    useEffect(() => {
        if (partnerToEdit) {
            form.reset(partnerToEdit);
        } else {
            form.reset({ name: "" });
        }
    }, [partnerToEdit, form]);


    async function onSubmit(values: PartnerFormData) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            if (isEditMode && partnerToEdit) {
                const partnerRef = doc(db, `users/${user.uid}/partners`, partnerToEdit.id);
                await updateDoc(partnerRef, { ...values, userId: user.uid });
                toast({ title: "Sucesso!", description: "Sócio atualizado." });
            } else {
                await addDoc(collection(db, `users/${user.uid}/partners`), { ...values, userId: user.uid });
                toast({ title: "Sucesso!", description: "Novo sócio adicionado." });
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving partner: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o sócio." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Sócio</FormLabel>
                        <FormControl><Input placeholder="Ex: João da Silva" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Salvar Alterações' : 'Adicionar Sócio'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export function PartnersManager() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [viewingHistory, setViewingHistory] = useState<Partner | null>(null);

    const fetchPartners = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const partnersCol = collection(db, `users/${user.uid}/partners`);
            const q = query(partnersCol, orderBy("name", "asc"));
            const querySnapshot = await getDocs(q);
            const fetchedPartners = querySnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Partner));
            setPartners(fetchedPartners);
        } catch (error) {
            console.error("Error fetching partners: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar a lista de sócios." });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchPartners();
    }, [fetchPartners]);

    const handleDelete = async (partnerId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/partners`, partnerId));
            toast({ title: "Sucesso!", description: "Sócio removido." });
            fetchPartners();
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o sócio." });
        }
    };
    
    const handleEdit = (partner: Partner) => {
        setEditingPartner(partner);
        setIsSheetOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingPartner(null);
        setIsSheetOpen(true);
    }

    const handleViewHistory = (partner: Partner) => {
        setViewingHistory(partner);
    }

    const handleFormSuccess = () => {
        setIsSheetOpen(false);
        setEditingPartner(null);
        fetchPartners();
    }


    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Gerenciar Sócios</CardTitle>
                        <CardDescription>
                            Adicione e gerencie os sócios da sua equipe.
                        </CardDescription>
                    </div>
                    <Button onClick={handleAddNew} className="w-full md:w-auto">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Adicionar Sócio
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
                                   <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        ))}
                        {!loading && partners.map(partner => (
                            <div key={partner.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                <div className="flex items-center gap-4">
                                     <Avatar>
                                        <AvatarFallback>{partner.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{partner.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleViewHistory(partner)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(partner)}>
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
                                                    Tem certeza que deseja excluir <strong>{partner.name}</strong>? Esta ação não pode ser desfeita.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(partner.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                         {!loading && partners.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhum sócio adicionado.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

             <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{editingPartner ? 'Editar Sócio' : 'Adicionar Novo Sócio'}</SheetTitle>
                        <SheetDescription>
                            {editingPartner ? 'Atualize os dados do sócio abaixo.' : 'Preencha os dados para registrar um novo sócio.'}
                        </SheetDescription>
                    </SheetHeader>
                    <PartnerForm 
                        onSuccess={handleFormSuccess} 
                        partnerToEdit={editingPartner}
                        onCancel={() => setIsSheetOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            {viewingHistory && (
                <PartnerHistoryDialog
                    partner={viewingHistory}
                    open={!!viewingHistory}
                    onOpenChange={(isOpen) => !isOpen && setViewingHistory(null)}
                />
            )}
        </>
    )
}
