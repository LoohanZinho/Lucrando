"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useLoader } from '@/contexts/loader-context';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (loading) {
      showLoader();
    } else {
      hideLoader();
    }

    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router, showLoader, hideLoader]);

  if (loading || !user) {
    return null; 
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}
