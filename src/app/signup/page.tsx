
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLoader } from '@/contexts/loader-context';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    showLoader();
    
    toast({
      title: "Acesso via Pagamento",
      description: "As credenciais de acesso são enviadas para seu e-mail após a confirmação do pagamento.",
      duration: 8000,
    });

    router.replace('/login');
    
    // Um pequeno delay para garantir que o loader seja visto
    // antes que o hideLoader do layout de login seja chamado.
    const timer = setTimeout(() => {
        hideLoader();
    }, 500);

    return () => clearTimeout(timer);

  }, [router, toast, showLoader, hideLoader]);

  // Renderiza null ou um loader enquanto redireciona
  return null;
}
