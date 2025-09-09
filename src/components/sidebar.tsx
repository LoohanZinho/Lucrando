
"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart3, Home, Users, Calendar, Send, Settings, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/posts', label: 'Posts', icon: Send },
        { href: '/calendar', label: 'Calendário', icon: Calendar },
        { href: '/influencers', label: 'Influenciadores', icon: Users },
        { href: '/products', label: 'Produtos', icon: Package },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link href="#" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
                    <BarChart3 className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">LCI</span>
                </Link>
                <TooltipProvider>
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Tooltip key={href}>
                            <TooltipTrigger asChild>
                                <Link href={href} className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8", { "bg-accent text-accent-foreground": pathname.startsWith(href) })}>
                                    <Icon className="h-5 w-5" />
                                    <span className="sr-only">{label}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{label}</TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="#" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                                <Settings className="h-5 w-5" />
                                <span className="sr-only">Configurações</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">Configurações</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </nav>
        </aside>
    )
}
