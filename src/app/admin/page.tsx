"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/contexts/loader-context';

export default function AdminRootPage() {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    showLoader();
    router.replace('/admin/dashboard');
  }, [router, showLoader]);

  // Renderiza um loader enquanto o redirecionamento ocorre
  // para evitar uma tela em branco piscando.
  return null;
}
