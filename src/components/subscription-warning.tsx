
"use client";

import { useAuth } from "@/contexts/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Timestamp } from "firebase/firestore/lite";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Button } from "./ui/button";

export function SubscriptionWarning() {
    const { user } = useAuth();
    
    if (!user || !user.subscriptionExpiresAt) {
        return null;
    }

    const expiresAt = (user.subscriptionExpiresAt as Timestamp).toDate();
    const today = new Date();
    const remainingDays = differenceInDays(expiresAt, today);

    if (remainingDays > 5) {
        return null;
    }
    
    const formattedDate = format(expiresAt, "dd 'de' MMMM", { locale: ptBR });
    
    let message;
    if (remainingDays < 0) {
        message = "Sua assinatura expirou.";
    } else if (remainingDays === 0) {
        message = "Sua assinatura expira hoje.";
    } else if (remainingDays === 1) {
        message = "Sua assinatura expira amanhã.";
    } else {
        message = `Sua assinatura expira em ${remainingDays} dias, em ${formattedDate}.`;
    }


    return (
        <Alert variant={remainingDays < 0 ? "destructive" : "default"} className="mb-6 bg-primary/10 border-primary/50 text-primary-foreground">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertTitle className="font-bold text-primary">Atenção!</AlertTitle>
            <AlertDescription className="flex justify-between items-center text-primary/90">
                {message}
                <Button asChild variant="link" className="text-primary pr-0">
                    <Link href="/profile">Ver detalhes</Link>
                </Button>
            </AlertDescription>
        </Alert>
    );
}
