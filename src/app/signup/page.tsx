
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "As senhas não coincidem.",
        });
        return;
    }

    setLoading(true);
    
    const success = await signup(username, email, password);

    if (success) {
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: "Este e-mail já está em uso. Tente outro.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSignup}>
          <CardHeader className="text-center">
             <Link href="/" className="flex flex-col items-center justify-center gap-4 mb-4" title="LCI Home">
                <Image src="https://i.imgur.com/bgXDxQU.png" alt="LCI Logo" width={64} height={64} />
            </Link>
            <CardTitle>Criar Nova Conta</CardTitle>
            <CardDescription>
              Preencha os dados para se registrar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="Seu nome" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="usuario@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Criando..." : "Criar conta"}
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
            <div className="text-sm text-center">
                <span className="text-muted-foreground">Já tem uma conta? </span>
                <Link href="/login" className="underline font-medium text-primary hover:text-primary/90">
                    Fazer Login
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
