
"use client"
import { UserNav } from "./user-nav";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="flex-1">
                 <h1 className="truncate text-lg font-semibold text-primary dark:bg-gradient-to-r dark:from-primary dark:to-foreground dark:bg-clip-text dark:text-transparent">Lucrando com Influenciadores</h1>
            </div>
            <div className="relative ml-auto flex items-center gap-2 md:grow-0">
                <ThemeToggle />
                <UserNav />
            </div>
        </header>
    )
}
