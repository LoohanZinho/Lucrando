
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2, Loader2, Edit, User, LogOut } from "lucide-react";
import { type User as UserType } from "@/lib/data-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

// Schema para o formulário de usuário
const userSchema = z.object({
    displayName: z.string().min(2, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    photoURL: z.string().url("URL da foto inválida").optional().or(z.literal('')),
});
type UserFormData = z.infer<typeof userSchema>;

// --- Componente do Formulário de Usuário ---
function UserForm({ onSuccess, userToEdit, onCancel }: { onSuccess: () => void, userToEdit?: UserType | null, onCancel: () => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!userToEdit;

    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: { displayName: "", email: "", password: "", photoURL: "" }
    });

    useEffect(() => {
        if (userToEdit) {
            form.reset({
                ...userToEdit,
                password: userToEdit.password || '******', // mascarar senha
            });
        } else {
            form.reset({ displayName: "", email: "", password: "", photoURL: "" });
        }
    }, [userToEdit, form]);

    async function onSubmit(values: UserFormData) {
        setIsSubmitting(true);
        try {
            // Verifica se o email já existe ao criar novo usuário
            if (!isEditMode) {
                const usersCol = collection(db, 'users');
                const q = query(usersCol, where("email", "==", values.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    toast({ variant: "destructive", title: "Erro", description: "Este email já está em uso." });
                    setIsSubmitting(false);
                    return;
                }
            }
            
            if (isEditMode && userToEdit) {
                const userRef = doc(db, 'users', userToEdit.id);
                const dataToUpdate: Partial<UserFormData> = {...values};
                // Não atualiza a senha se for a mascarada
                if (dataToUpdate.password === '******') {
                    delete dataToUpdate.password;
                }
                await updateDoc(userRef, dataToUpdate);
                toast({ title: "Sucesso!", description: "Usuário atualizado." });
            } else {
                await addDoc(collection(db, 'users'), values);
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
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
                        <FormLabel>URL da Foto (Opcional)</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="flex gap-2 justify-end">
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

// --- Componente do Dashboard de Admin ---
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const { toast } = useToast();
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const usersCol = collection(db, 'users');
            const q = query(usersCol, orderBy("displayName", "asc"));
            const querySnapshot = await getDocs(q);
            const fetchedUsers = querySnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as UserType));
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
            await deleteDoc(doc(db, "users", userId));
            toast({ title: "Sucesso!", description: "Usuário removido." });
            fetchUsers();
        } catch (error) {
             toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o usuário." });
        }
    };
    
    const handleEdit = (user: UserType) => {
        setEditingUser(user);
        setIsSheetOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingUser(null);
        setIsSheetOpen(true);
    };

    const handleFormSuccess = () => {
        setIsSheetOpen(false);
        setEditingUser(null);
        fetchUsers();
    };

    return (
        <>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                    <h1 className="text-xl font-semibold text-primary">Painel do Gestor</h1>
                    <div className="ml-auto">
                        <Button variant="outline" onClick={onLogout}>
                            <LogOut className="mr-2" />
                            Sair
                        </Button>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6">
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Gerenciar Usuários</CardTitle>
                                <CardDescription>Adicione, edite ou remova usuários do sistema.</CardDescription>
                            </div>
                            <Button onClick={handleAddNew} className="w-full md:w-auto">
                                <UserPlus className="mr-2" />
                                Adicionar Usuário
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
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    </div>
                                ))}
                                {!loading && users.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <Avatar>
                                                {user.photoURL && <img src={user.photoURL} alt={user.displayName} className="object-cover w-full h-full" />}
                                                <AvatarFallback>{user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{user.displayName}</p>
                                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(user)}>
                                                <Edit />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                        <Trash2 />
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
                                                        <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                                {!loading && users.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum usuário encontrado.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</SheetTitle>
                        <SheetDescription>{editingUser ? 'Atualize os dados do usuário.' : 'Preencha os dados para criar um novo usuário.'}</SheetDescription>
                    </SheetHeader>
                    <UserForm onSuccess={handleFormSuccess} userToEdit={editingUser} onCancel={() => setIsSheetOpen(false)} />
                </SheetContent>
            </Sheet>
        </>
    );
}


// --- Componente Principal da Página ---
export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { toast } = useToast();
    const ADMIN_PASSWORD = "iamgestor";
    const AUTH_KEY = "lci-admin-auth-v2";

    useEffect(() => {
        // Verificar o localStorage apenas no cliente
        try {
            const authStatus = localStorage.getItem(AUTH_KEY);
            if (authStatus === 'true') {
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error("Could not access localStorage.", e);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password === ADMIN_PASSWORD) {
            try {
                localStorage.setItem(AUTH_KEY, 'true');
                setIsAuthenticated(true);
                toast({ title: "Acesso concedido!", description: "Bem-vindo, Gestor." });
            } catch (e) {
                 toast({ variant: "destructive", title: "Erro de Armazenamento", description: "Não foi possível salvar a sessão." });
            }
        } else {
            setError("Senha incorreta. Tente novamente.");
        }
    };

    const handleLogout = () => {
        try {
            localStorage.removeItem(AUTH_KEY);
            setIsAuthenticated(false);
            toast({ title: "Sessão encerrada." });
        } catch (e) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível encerrar a sessão." });
        }
    };
    
    if (isLoading) {
        return (
             <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary/50">
                <Card className="w-full max-w-sm">
                    <form onSubmit={handleLogin}>
                        <CardHeader>
                            <CardTitle>Acesso Restrito</CardTitle>
                            <CardDescription>Esta área é exclusiva para gestores.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha de Acesso</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full">Entrar</Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        );
    }

    return <AdminDashboard onLogout={handleLogout} />;
}

    