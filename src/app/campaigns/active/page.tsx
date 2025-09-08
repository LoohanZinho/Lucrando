import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function ActiveCampaignsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
            <h1 className="text-2xl font-bold">Campanhas Ativas</h1>
            <p>Conteúdo da página de Campanhas Ativas.</p>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
