
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
}

export function SubscriptionExpiredDialog({ open, expirationDate, paymentLink }: SubscriptionExpiredDialogProps) {

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
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleRenew} disabled={!paymentLink}>
            Renovar Assinatura
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
