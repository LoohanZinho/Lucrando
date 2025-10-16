"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  displayName: z.string().min(2, "O nome de usuário é obrigatório."),
  photoURL: z.string().url("Por favor, insira uma URL válida para a foto.").or(z.literal("")).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const userInitial = user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      photoURL: "",
    },
  });
  
  const photoUrlValue = form.watch("photoURL");

  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para atualizar o perfil.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile(auth.currentUser!, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });
      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado.",
      });
       // Force a re-render or state update if needed to show new data immediately
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o perfil.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <p>Carregando perfil...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie as informações da sua conta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Perfil</CardTitle>
          <CardDescription>
            Atualize seu nome de usuário e foto de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={photoUrlValue || user?.photoURL || undefined} alt={user?.displayName || "Avatar"} />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                    <FormField
                        control={form.control}
                        name="photoURL"
                        render={({ field }) => (
                            <FormItem className="w-full">
                            <FormLabel>URL da Foto de Perfil</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/sua-foto.png" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

              <FormField
                control={form.control}
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
