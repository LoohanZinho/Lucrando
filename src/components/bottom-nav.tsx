
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Send, Users, Calendar, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/posts', label: 'Posts', icon: Send },
        { href: '/calendar', label: 'Calendário', icon: Calendar },
    ];

    return (
        <div className="sm:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
            <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
                {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link 
                        key={href} 
                        href={href} 
                        className={cn(
                            "inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 group",
                            pathname.startsWith(href) ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                        <Icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
