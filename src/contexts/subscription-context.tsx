
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { SubscriptionExpiredDialog } from '@/components/subscription-expired-dialog';

interface SubscriptionContextType {
  showSubscriptionModal: (expirationDate: Date) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [modalState, setModalState] = useState<{ open: boolean; expirationDate: Date | null; paymentLink: string | null }>({
    open: false,
    expirationDate: null,
    paymentLink: null,
  });

  const showSubscriptionModal = useCallback(async (expirationDate: Date) => {
    try {
      const settingsRef = doc(db, 'settings', 'app_config');
      const docSnap = await getDoc(settingsRef);
      let paymentLink = null;
      if (docSnap.exists()) {
        paymentLink = docSnap.data().paymentLink || null;
      }
      setModalState({ open: true, expirationDate, paymentLink });
    } catch (error) {
      console.error("Erro ao buscar link de pagamento:", error);
      // Still show the modal, but without the link
      setModalState({ open: true, expirationDate, paymentLink: null });
    }
  }, []);

  return (
    <SubscriptionContext.Provider value={{ showSubscriptionModal }}>
      {children}
      <SubscriptionExpiredDialog
        open={modalState.open}
        expirationDate={modalState.expirationDate}
        paymentLink={modalState.paymentLink}
      />
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription deve ser usado dentro de um SubscriptionProvider');
  }
  return context;
};
