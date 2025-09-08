
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar } from '@/components/sidebar';
import { useLoader } from '@/contexts/loader-context';
import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';

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
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 md:gap-8 pb-20 sm:pb-4">
            {children}
        </main>
      </div>
       <BottomNav />
    </div>
  );
}

    
