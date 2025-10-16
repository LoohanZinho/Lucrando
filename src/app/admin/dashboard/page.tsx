
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2, Edit, Trash2 } from "lucide-react";
import { type User } from "@/lib/data-types";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, updateDoc, DocumentData, where } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const userSchema = z.object({
    displayName: z.string().min(2, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    photoURL: z.string().url("URL da foto inválida").optional().or(z.literal('')),
});
type UserFormData = z.infer<typeof userSchema>;

function UserForm({ onSuccess, userToEdit, onCancel }: { onSuccess: () => void, userToEdit?: User | null, onCancel: () => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!userToEdit;

    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            displayName: "",
            email: "",
            password: "",
            photoURL: "",
        }
    });

    useEffect(() => {
        if (userToEdit) {
            form.reset({
                ...userToEdit,
                password: userToEdit.password || '******', // Show placeholder for security
            });
        } else {
            form.reset({
                displayName: "",
                email: "",
                password: "",
                photoURL: "",
            });
        }
    }, [userToEdit, form]);

    async function onSubmit(values: UserFormData) {
        setIsSubmitting(true);
        try {
            const userData = { ...values };
            // Do not update password if it's the placeholder
            if (isEditMode && userData.password === '******') {
                delete (userData as any).password;
            }

            if (isEditMode && userToEdit) {
                const userRef = doc(db, `users`, userToEdit.id);
                await updateDoc(userRef, userData);
                toast({ title: "Sucesso!", description: "Usuário atualizado." });
            } else {
                // Check for existing email before creating
                const q = query(collection(db, "users"), where("email", "==", values.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    toast({ variant: "destructive", title: "Erro", description: "Este e-mail já está em uso." });
                    setIsSubmitting(false);
                    return;
                }
                await addDoc(collection(db, `users`), userData);
                toast({ title: "Sucesso!", description: "Novo usuário criado." });
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving user: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o usuário." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
                <FormField control={form.control} name="displayName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl><Input placeholder="Nome do usuário" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="usuario@example.com" {...field} disabled={isEditMode} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="photoURL" render={({ field }) => (
                    <FormItem>
                        <FormLabel>URL da Foto</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Salvar Alterações' : 'Criar Usuário'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}


export default function AdminDashboardPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const usersCol = collection(db, `users`);
            const q = query(usersCol, orderBy("displayName", "asc"));
            const querySnapshot = await getDocs(q);
            const fetchedUsers = querySnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as User));
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users: ", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar a lista de usuários." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (userId: string) => {
        try {
            await deleteDoc(doc(db, `users`, userId));
            toast({ title: "Sucesso!", description: "Usuário removido." });
            fetchUsers();
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o usuário." });
        }
    };
    
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsSheetOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingUser(null);
        setIsSheetOpen(true);
    }

    const handleFormSuccess = () => {
        setIsSheetOpen(false);
        setEditingUser(null);
        fetchUsers();
    }

    return (
        <>
            <div className="container mx-auto p-4 md:p-8">
                <Card>
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Gerenciamento de Usuários</CardTitle>
                            <CardDescription>
                                Adicione, edite ou remova usuários do sistema.
                            </CardDescription>
                        </div>
                        <Button onClick={handleAddNew} className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Novo Usuário
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && [...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.displayName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(user)}>
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
                                                                Tem certeza que deseja excluir <strong>{user.displayName}</strong>? Esta ação não pode ser desfeita.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Excluir
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8">
                                            Nenhum usuário encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</SheetTitle>
                        <SheetDescription>
                            {editingUser ? 'Atualize os dados do usuário abaixo.' : 'Preencha os dados para criar um novo usuário.'}
                        </SheetDescription>
                    </SheetHeader>
                    <UserForm
                        onSuccess={handleFormSuccess}
                        userToEdit={editingUser}
                        onCancel={() => setIsSheetOpen(false)}
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}

    