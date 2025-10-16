
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { doc, updateDoc, Timestamp } from "firebase/firestore/lite";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CropperImage } from "@/components/cropper-image";
import { Progress } from "@/components/ui/progress";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const profileSchema = z.object({
  displayName: z.string().min(2, "O nome de usuário é obrigatório."),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória."),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As novas senhas não coincidem.",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading, updateUserInContext } = useAuth();
  const { toast } = useToast();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{ planName: string; expiresAt?: Date; progress?: number, remainingDays?: number }>({ planName: "Vitalício" });

  const userInitial = user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        displayName: user.displayName || "",
      });
      setPhotoURL(user.photoURL || null);

      const expiresAtTimestamp = user.subscriptionExpiresAt as Timestamp | { seconds: number, nanoseconds: number };
      const paidAtTimestamp = user.paidAt as Timestamp | { seconds: number, nanoseconds: number };

      if (expiresAtTimestamp && typeof expiresAtTimestamp.seconds === 'number' && paidAtTimestamp && typeof paidAtTimestamp.seconds === 'number') {
          const expiresAt = new Date(expiresAtTimestamp.seconds * 1000);
          const paidAt = new Date(paidAtTimestamp.seconds * 1000);

          const totalDays = differenceInDays(expiresAt, paidAt);
          const remainingDays = differenceInDays(expiresAt, new Date());
          const progress = totalDays > 0 ? ((totalDays - remainingDays) / totalDays) * 100 : 0;
          
          setSubscriptionInfo({
              planName: "Plano Mensal",
              expiresAt: expiresAt,
              progress: Math.max(0, Math.min(100, progress)),
              remainingDays: Math.max(0, remainingDays),
          });
      } else {
          setSubscriptionInfo({ planName: "Plano Vitalício" });
      }
    }
  }, [user, profileForm]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!user) return;
    setIsUploading(true);

    try {
      const storageRef = ref(storage, `profile_pictures/${user.id}/profile.jpg`);
      const snapshot = await uploadBytes(storageRef, croppedBlob, { contentType: 'image/jpeg' });
      const downloadURL = await getDownloadURL(snapshot.ref);

      setPhotoURL(downloadURL);
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { photoURL: downloadURL });
      
      updateUserInContext({ photoURL: downloadURL });

      toast({
        title: "Foto atualizada!",
        description: "Sua nova foto de perfil foi salva.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro de Upload",
        description: error.message || "Não foi possível enviar sua foto.",
      });
    } finally {
      setIsUploading(false);
      setImageToCrop(null);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSubmittingProfile(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        displayName: data.displayName,
      });

      updateUserInContext({ displayName: data.displayName });

      toast({
        title: "Sucesso!",
        description: "Seu nome foi atualizado.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o perfil.",
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };
  
  const onPasswordSubmit = async (data: PasswordFormData) => {
      if (!user) return;
      
      if (data.currentPassword !== user.password) {
          toast({
              variant: "destructive",
              title: "Erro",
              description: "A senha atual está incorreta."
          });
          return;
      }
      
      setIsSubmittingPassword(true);
      try {
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, {
              password: data.newPassword,
          });

          updateUserInContext({ password: data.newPassword });
          passwordForm.reset();

          toast({
              title: "Sucesso!",
              description: "Sua senha foi alterada."
          });
          
      } catch (error: any) {
          toast({
              variant: "destructive",
              title: "Erro ao alterar senha",
              description: error.message || "Não foi possível alterar sua senha."
          });
      } finally {
          setIsSubmittingPassword(false);
      }
  }

  if (authLoading) {
    return <p>Carregando perfil...</p>;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie as informações da sua conta e assinatura.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Assinatura</CardTitle>
            <CardDescription>Detalhes do seu plano atual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                    <Crown className="h-8 w-8 text-primary" />
                    <div>
                        <p className="font-semibold">{subscriptionInfo.planName}</p>
                        <p className="text-sm text-muted-foreground">
                            {subscriptionInfo.expiresAt
                                ? `Sua assinatura expira em ${format(subscriptionInfo.expiresAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                                : 'Acesso por tempo ilimitado.'
                            }
                        </p>
                    </div>
                </div>
                {subscriptionInfo.remainingDays !== undefined && (
                    <div className="text-right">
                        <p className="text-sm font-semibold">{subscriptionInfo.remainingDays} dias</p>
                        <p className="text-xs text-muted-foreground">Restantes</p>
                    </div>
                )}
            </div>
            {subscriptionInfo.progress !== undefined && (
                <div>
                    <Progress value={subscriptionInfo.progress} className="h-2" />
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Perfil</CardTitle>
            <CardDescription>
              Atualize seu nome de usuário e foto de perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                      <div className="relative group">
                          <Avatar className="h-32 w-32">
                              <AvatarImage src={photoURL || undefined} alt={user?.displayName || "Avatar"} />
                              <AvatarFallback className="text-4xl">{userInitial}</AvatarFallback>
                          </Avatar>
                          <div 
                              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={() => fileInputRef.current?.click()}
                          >
                              {isUploading ? (
                                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                              ) : (
                                  <Camera className="h-8 w-8 text-white" />
                              )}
                          </div>
                      </div>
                      <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/png, image/jpeg, image/gif"
                          disabled={isUploading}
                      />
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                          {isUploading ? "Enviando..." : "Trocar Foto"}
                      </Button>
                  </div>

                <FormField
                  control={profileForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmittingProfile}>
                    {isSubmittingProfile && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Para sua segurança, escolha uma senha forte.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Senha Atual</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Sua senha atual" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nova Senha</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Sua nova senha" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirmar Nova Senha</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Confirme sua nova senha" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isSubmittingPassword}>
                            {isSubmittingPassword && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Alterar Senha
                        </Button>
                    </div>
                </form>
            </Form>
          </CardContent>
        </Card>

      </div>

      <CropperImage
        imageSrc={imageToCrop}
        open={isCropperOpen}
        onOpenChange={setIsCropperOpen}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
