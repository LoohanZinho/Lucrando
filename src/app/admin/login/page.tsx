"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const ADMIN_PASSWORD = "iamgestor";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password === ADMIN_PASSWORD) {
      try {
        localStorage.setItem('lci-admin-auth', 'true');
        toast({ title: "Sucesso!", description: "Login de administrador realizado." });
        router.push('/admin/dashboard');
      } catch (error) {
         toast({
            variant: "destructive",
            title: "Erro de Armazenamento",
            description: "Não foi possível salvar o estado de login no seu navegador.",
        });
        setLoading(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "A senha de administrador está incorreta.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="flex flex-col items-center justify-center gap-2 mb-4">
                <Image src="https://i.imgur.com/bgXDxQU.png" alt="LCI Logo" width={48} height={48} />
            </div>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Área de Administração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Administrador</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Verificando..." : "Entrar"}
              <ShieldCheck className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
