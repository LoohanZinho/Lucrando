import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
      <div className="flex items-center gap-2 overflow-hidden">
        <SidebarTrigger className="md:hidden" />
        <div className="overflow-hidden">
           <h1 className="font-bold text-lg tracking-wider text-primary truncate whitespace-nowrap">
                Lucrando com Influenciadores
           </h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
