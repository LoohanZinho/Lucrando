
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, HelpCircle } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(email, password);

    if (success) {
      router.push('/dashboard');
    } else {
      // O toast de erro já é mostrado dentro da função de login
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <Link href="/" className="flex flex-col items-center justify-center gap-4 mb-4" title="LCI Home">
                <Image src="https://i.imgur.com/bgXDxQU.png" alt="LCI Logo" width={64} height={64} />
            </Link>
            <CardTitle>Bem-vindo!</CardTitle>
            <CardDescription>
              Faça login para continuar
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
            <div className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                <span>Não tem uma conta?</span>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <HelpCircle className="h-4 w-4 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>As credenciais são enviadas por e-mail após o pagamento.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
