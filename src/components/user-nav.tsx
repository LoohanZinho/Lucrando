"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { LoaderLink } from "./loader-link";
import { useLoader } from "@/contexts/loader-context";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { user, signOut: firebaseSignOut } = useAuth();
  const { showLoader } = useLoader();
  const router = useRouter();

  if (!user) {
    return (
      <Button asChild>
        <LoaderLink href="/login">Entrar</LoaderLink>
      </Button>
    )
  }
  
  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    const name = user.displayName;
    if(name) {
        const parts = name.split(' ');
        if(parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  const handleSignOut = async () => {
    showLoader();
    await firebaseSignOut();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} data-ai-hint="foto de perfil" />
            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName ?? "Usuário"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <LoaderLink href="/profile" className="w-full">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </LoaderLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <LoaderLink href="/settings" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </LoaderLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
