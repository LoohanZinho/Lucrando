
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackagePlus, Trash2, Loader2, Edit, Package } from "lucide-react";
import { type Product } from "@/lib/data-types";
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
import { Textarea } from "../ui/textarea";

const productSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    description: z.string().optional(),
});
type ProductFormData = z.infer<typeof productSchema>;

function ProductForm({ onSuccess, productToEdit, onCancel }: { onSuccess: () => void, productToEdit?: Product | null, onCancel: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!productToEdit;

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
        }
    });

    useEffect(() => {
        if (productToEdit) {
            form.reset(productToEdit);
        } else {
            form.reset({ name: "", description: "" });
        }
    }, [productToEdit, form]);


    async function onSubmit(values: ProductFormData) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            if (isEditMode && productToEdit) {
                const productRef = doc(db, `users/${user.id}/products`, productToEdit.id);
                await updateDoc(productRef, { ...values, userId: user.id });
                toast({ title: "Sucesso!", description: "Produto atualizado." });
            } else {
                await addDoc(collection(db, `users/${user.id}/products`), { ...values, userId: user.id });
                toast({ title: "Sucesso!", description: "Novo produto adicionado." });
            }
            onSuccess();
        } catch (error) {
            console.error("Erro ao salvar produto: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o produto." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Produto</FormLabel>
                        <FormControl><Input placeholder="Ex: Curso de Marketing" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl><Textarea placeholder="Descreva brevemente o produto..." {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Salvar Alterações' : 'Adicionar Produto'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export function ProductsManager() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const productsCol = collection(db, `users/${user.id}/products`);
            const q = query(productsCol, orderBy("name", "asc"));
            const querySnapshot = await getDocs(q);
            const fetchedProducts = querySnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(fetchedProducts);
        } catch (error) {
            console.error("Erro ao buscar produtos: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar a lista de produtos." });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (productId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.id}/products`, productId));
            toast({ title: "Sucesso!", description: "Produto removido." });
            fetchProducts();
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o produto." });
        }
    };
    
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsSheetOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingProduct(null);
        setIsSheetOpen(true);
    }

    const handleFormSuccess = () => {
        setIsSheetOpen(false);
        setEditingProduct(null);
        fetchProducts();
    }


    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Gerenciar Produtos</CardTitle>
                        <CardDescription>
                            Adicione e gerencie os produtos da sua empresa.
                        </CardDescription>
                    </div>
                    <Button onClick={handleAddNew} className="w-full md:w-auto">
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Adicionar Produto
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
                        {!loading && products.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                <div className="flex items-center gap-4">
                                     <Avatar>
                                        <AvatarFallback><Package className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                         {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(product)}>
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
                                                    Tem certeza que deseja excluir o produto <strong>{product.name}</strong>? Esta ação não pode ser desfeita.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                         {!loading && products.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhum produto adicionado.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

             <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</SheetTitle>
                        <SheetDescription>
                            {editingProduct ? 'Atualize os dados do produto abaixo.' : 'Preencha os dados para registrar um novo produto.'}
                        </SheetDescription>
                    </SheetHeader>
                    <ProductForm 
                        onSuccess={handleFormSuccess} 
                        productToEdit={editingProduct}
                        onCancel={() => setIsSheetOpen(false)}
                    />
                </SheetContent>
            </Sheet>
        </>
    )
}
