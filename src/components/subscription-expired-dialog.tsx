
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
        <AlertDialogFooter className="flex-col gap-4">
          <AlertDialogAction onClick={handleRenew} disabled={!paymentLink}>
            Renovar Assinatura
          </AlertDialogAction>
          <a
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-center text-muted-foreground underline hover:text-primary"
          >
            Falar com suporte
          </a>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
