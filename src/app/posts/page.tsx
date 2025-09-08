
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { PostsManager } from "@/components/posts/posts-manager";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PostsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
       <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
         <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
       </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
            <PostsManager />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
