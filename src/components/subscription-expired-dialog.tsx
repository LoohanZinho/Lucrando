
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SubscriptionExpiredDialogProps {
  open: boolean;
  expirationDate: Date | null;
  paymentLink: string | null;
  supportLink?: string;
}

export function SubscriptionExpiredDialog({ open, expirationDate, paymentLink, supportLink = "mailto:lucrandolcihub@gmail.com" }: SubscriptionExpiredDialogProps) {

  const handleRenew = () => {
    if (paymentLink) {
      window.location.href = paymentLink;
    }
  };
  
  const formattedDate = expirationDate ? format(expirationDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'N/A';

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Assinatura Expirada</AlertDialogTitle>
          <AlertDialogDescription>
            Sua assinatura expirou em <strong>{formattedDate}</strong>. Para continuar utilizando a plataforma, por favor, renove sua assinatura.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col items-center gap-2 pt-4">
            <Button onClick={handleRenew} disabled={!paymentLink} className="w-full">
                Renovar Assinatura
            </Button>
            <Link
                href={supportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-center text-muted-foreground underline hover:text-primary mt-2"
            >
                Falar com suporte
            </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
