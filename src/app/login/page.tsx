"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, BarChart3 } from "lucide-react";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useLoader } from '@/contexts/loader-context';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { showLoader } = useLoader();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showLoader();
      router.push('/');
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Erro de Login",
        description: "As credenciais fornecidas estão incorretas. Por favor, tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4" title="LCI Home">
                <div className="p-2 bg-primary rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">LCI</span>
            </Link>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Acesse seu painel de controle de campanhas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Entrando..." : "Entrar"}
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
            <div className="text-sm text-center">
                <span className="text-muted-foreground">Não tem uma conta? </span>
                <Link href="/signup" className="underline font-medium text-primary hover:text-primary/90">
                    Criar nova conta
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
