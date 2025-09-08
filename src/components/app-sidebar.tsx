"use client";

import { BarChart3, Users, HandCoins, Settings, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "./ui/sidebar";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LoaderLink } from "./loader-link";

const menuItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/influencers",
    label: "Influenciadores",
    icon: Users,
  },
  {
    href: "/campaigns",
    label: "Campanhas",
    icon: HandCoins,
    subItems: [
      { href: "/campaigns/active", label: "Ativas" },
      { href: "/campaigns/past", label: "Anteriores" },
    ],
  },
  {
    href: "/settings",
    label: "Configurações",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-wider text-primary">LCI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild={!item.subItems}
                  isActive={!item.subItems && pathname === item.href}
                  onClick={item.subItems ? () => toggleSubMenu(item.label) : undefined}
                >
                  {item.subItems ? (
                     <>
                        <item.icon />
                        <span>{item.label}</span>
                        <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${openSubMenus[item.label] ? 'rotate-90' : ''}`} />
                     </>
                  ) : (
                    <LoaderLink href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                    </LoaderLink>
                  )}
                </SidebarMenuButton>
                {item.subItems && openSubMenus[item.label] && (
                  <SidebarMenuSub>
                    {item.subItems.map((subItem) => (
                      <SidebarMenuItem key={subItem.label}>
                        <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                           <LoaderLink href={subItem.href}>{subItem.label}</LoaderLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarTrigger />
        </SidebarFooter>
    </Sidebar>
  );
}
