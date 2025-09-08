"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, User, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoaderLink } from "./loader-link";

const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/posts", label: "Posts", icon: ClipboardList },
    { href: "/influencers", label: "Influencers", icon: Users },
    { href: "/partners", label: "Sócios", icon: Handshake },
    { href: "/profile", label: "Perfil", icon: User },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
            <div className="grid h-full grid-cols-5 mx-auto font-medium">
                {menuItems.map((item) => (
                    <LoaderLink
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "inline-flex flex-col items-center justify-center hover:bg-accent/50 transition-colors group px-1",
                            pathname === item.href
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs text-center">{item.label}</span>
                    </LoaderLink>
                ))}
            </div>
        </div>
    );
}
