
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, query, where, getDocs, Timestamp, getDoc, doc } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { useLoader } from './loader-context';
import { type User } from '@/lib/data-types';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from './subscription-context';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (username: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUserInContext: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  updateUserInContext: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useLoader();
  const { toast } = useToast();
  const { showSubscriptionModal } = useSubscription();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('lci-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        if (parsedUser.paidAt?.seconds) {
          parsedUser.paidAt = new Timestamp(parsedUser.paidAt.seconds, parsedUser.paidAt.nanoseconds);
        }
        if (parsedUser.subscriptionExpiresAt?.seconds) {
          const expiresAtTimestamp = new Timestamp(parsedUser.subscriptionExpiresAt.seconds, parsedUser.subscriptionExpiresAt.nanoseconds);
          parsedUser.subscriptionExpiresAt = expiresAtTimestamp;

          if (new Date() > expiresAtTimestamp.toDate()) {
             console.log("Subscription expired on load, logging out.");
             showSubscriptionModal(expiresAtTimestamp.toDate());
             logout();
             return;
          }
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, [showSubscriptionModal]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    showLoader();
    try {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Erro de Login",
          description: "As credenciais fornecidas estão incorretas.",
        });
        return false;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as Omit<User, 'id'>;

      if (userData.password !== pass) {
        toast({
          variant: "destructive",
          title: "Erro de Login",
          description: "As credenciais fornecidas estão incorretas.",
        });
        return false;
      }

      if (userData.subscriptionExpiresAt) {
        const expiresDate = (userData.subscriptionExpiresAt as Timestamp).toDate();
        if (new Date() > expiresDate) {
          showSubscriptionModal(expiresDate);
          return false;
        }
      }
      
      const loggedUser: User = { id: userDoc.id, ...userData };
      
      setUser(loggedUser);
      localStorage.setItem('lci-user', JSON.stringify(loggedUser));
      return true;

    } catch (error) {
      console.error("Login error:", error);
       toast({
        variant: "destructive",
        title: "Erro Inesperado",
        description: "Ocorreu um erro durante o login.",
      });
      return false;
    } finally {
      hideLoader();
    }
  };

  const signup = async (username: string, email: string, pass: string): Promise<boolean> => {
    toast({
        title: "Acesso via Pagamento",
        description: "As credenciais de acesso são enviadas por e-mail após a confirmação do pagamento.",
        duration: 8000,
    });
    return false;
  };

  const logout = () => {
    showLoader();
    setUser(null);
    localStorage.removeItem('lci-user');
    setTimeout(hideLoader, 100);
  };
  
  const updateUserInContext = (updatedData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('lci-user', JSON.stringify(updatedUser));
    }
  };

  const value = { user, loading, login, signup, logout, updateUserInContext };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
