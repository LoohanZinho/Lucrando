"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Home, Users, User, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/posts', label: 'Posts', icon: Share2 },
        { href: '/influencers', label: 'Influenciadores', icon: Users },
        { href: '/partners', label: 'Sócios', icon: User },
    ];

    return (
        <nav className="grid gap-6 text-lg font-medium">
            <Link href="#" className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
                <BarChart3 className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">LCI</span>
            </Link>
            {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", { 'text-foreground': pathname === href })}>
                    <Icon className="h-5 w-5" />
                    {label}
                </Link>
            ))}
        </nav>
    );
}
