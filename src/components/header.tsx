
"use client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="hidden md:block">
                <h1 className="text-lg font-semibold">Lucrando com Influenciadores</h1>
            </div>
            <div className="relative ml-auto flex items-center gap-2 md:grow-0">
                <ThemeToggle />
                <UserNav />
            </div>
        </header>
    )
}
