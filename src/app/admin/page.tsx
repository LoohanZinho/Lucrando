
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2, Loader2, Edit, User, LogOut, Camera, Eye, EyeOff, Calendar as CalendarIcon, Badge } from "lucide-react";
import { type User as UserType } from "@/lib/data-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, updateDoc, DocumentData, where, Timestamp } from "firebase/firestore/lite";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { CropperImage } from "@/components/cropper-image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";


const userSchema = z.object({
    displayName: z.string().min(2, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    photoURL: z.string().optional(),
    subscriptionExpiresAt: z.date().nullable().optional(),
});
type UserFormData = z.infer<typeof userSchema>;

function UserForm({ onSuccess, userToEdit, onCancel }: { onSuccess: () => void, userToEdit?: UserType | null, onCancel: () => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditMode = !!userToEdit;
    const [showPassword, setShowPassword] = useState(false);

    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: { displayName: "", email: "", password: "", photoURL: "", subscriptionExpiresAt: null }
    });

    const photoUrlValue = form.watch("photoURL");

    useEffect(() => {
        if (userToEdit) {
            form.reset({
                ...userToEdit,
                password: userToEdit.password || '******',
                subscriptionExpiresAt: userToEdit.subscriptionExpiresAt instanceof Timestamp 
                    ? userToEdit.subscriptionExpiresAt.toDate() 
                    : null
            });
        } else {
            form.reset({ displayName: "", email: "", password: "", photoURL: "", subscriptionExpiresAt: null });
        }
    }, [userToEdit, form]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageToCrop(reader.result as string);
            setIsCropperOpen(true);
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleCropComplete = async (croppedBlob: Blob) => {
        setIsUploading(true);
        const userIdForUpload = userToEdit?.id || new Date().getTime().toString();
        try {
            const storageRef = ref(storage, `profile_pictures/${userIdForUpload}/profile.jpg`);
            const snapshot = await uploadBytes(storageRef, croppedBlob, { contentType: 'image/jpeg' });
            const downloadURL = await getDownloadURL(snapshot.ref);
            form.setValue('photoURL', downloadURL);
            toast({ title: "Upload Concluído", description: "A imagem foi enviada." });
        } catch (error) {
            console.error("Upload error:", error);
            toast({ variant: "destructive", title: "Erro de Upload", description: "Não foi possível enviar a imagem." });
        } finally {
            setIsUploading(false);
            setImageToCrop(null);
        }
    };

    async function onSubmit(values: UserFormData) {
        setIsSubmitting(true);
        try {
            let dataToSave: Partial<UserFormData> & { photoURL?: string, subscriptionExpiresAt?: Timestamp | null } = { 
                ...values,
                subscriptionExpiresAt: values.subscriptionExpiresAt ? Timestamp.fromDate(values.subscriptionExpiresAt) : null,
             };

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
                if (dataToSave.password === '******') {
                    delete dataToSave.password;
                }
                await updateDoc(userRef, dataToSave);
                toast({ title: "Sucesso!", description: "Usuário atualizado." });
            } else {
                await addDoc(collection(db, 'users'), dataToSave);
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
        <>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
                
                <div className="flex flex-col items-center gap-4">
                   <Avatar className="h-24 w-24">
                        <AvatarImage src={photoUrlValue || undefined} />
                        <AvatarFallback>
                            <User className="h-10 w-10 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Enviando...</> : <><Camera className="mr-2 h-4 w-4"/> Carregar Foto</>}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                    />
                </div>
                
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
                        <div className="relative">
                            <FormControl>
                                <Input type={showPassword ? 'text' : 'password'} {...field} />
                            </FormControl>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{showPassword ? 'Esconder senha' : 'Mostrar senha'}</span>
                            </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="subscriptionExpiresAt" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>A Assinatura Expira em</FormLabel>
                         <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Sem data de expiração</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value ?? undefined}
                                    onSelect={(date) => field.onChange(date ?? null)}
                                    initialFocus
                                    locale={ptBR}
                                />
                                 <div className="p-2 border-t">
                                    <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => field.onChange(null)}>
                                        Limpar data
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )} />
               
                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting || isUploading}>
                        {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Salvar Alterações' : 'Criar Usuário'}
                    </Button>
                </div>
            </form>
        </Form>
        <CropperImage
            imageSrc={imageToCrop}
            open={isCropperOpen}
            onOpenChange={setIsCropperOpen}
            onCropComplete={handleCropComplete}
        />
        </>
    );
}

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

    const getSubscriptionStatus = (user: UserType): { text: string, variant: "default" | "secondary" | "destructive" } => {
        if (!user.subscriptionExpiresAt) {
            return { text: 'Sem Assinatura', variant: 'secondary' };
        }
        const expiresDate = (user.subscriptionExpiresAt as Timestamp).toDate();
        if (isBefore(expiresDate, new Date())) {
            return { text: `Expirou em ${format(expiresDate, 'dd/MM/yy')}`, variant: 'destructive' };
        }
        return { text: `Ativo até ${format(expiresDate, 'dd/MM/yy')}`, variant: 'default' };
    }

    return (
        <>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                    <h1 className="text-xl font-semibold text-primary">Painel LCI HUB</h1>
                    <div className="ml-auto">
                        <Button variant="outline" onClick={onLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
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
                                <UserPlus className="mr-2 h-4 w-4" />
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
                                {!loading && users.map(user => {
                                    const status = getSubscriptionStatus(user);
                                    return (
                                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <Avatar>
                                                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                                                    <AvatarFallback>{user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{user.displayName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                                        <Badge variant={status.variant} className="hidden sm:inline-flex">{status.text}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(user)}>
                                                    <Edit className="h-4 w-4"/>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="h-4 w-4"/>
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
                                    );
                                })}
                                {!loading && users.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum usuário encontrado.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto">
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

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { toast } = useToast();
    const ADMIN_PASSWORD = "iamgestor";
    const AUTH_KEY = "lci-admin-auth-v2";

    useEffect(() => {
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

    