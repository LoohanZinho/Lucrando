
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { useLoader } from './loader-context';
import { type User } from '@/lib/data-types';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('lci-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Firestore Timestamps são convertidos para strings, precisamos convertê-los de volta
        if (parsedUser.paidAt) {
          parsedUser.paidAt = new Timestamp(parsedUser.paidAt.seconds, parsedUser.paidAt.nanoseconds);
        }
        if (parsedUser.subscriptionExpiresAt) {
          parsedUser.subscriptionExpiresAt = new Timestamp(parsedUser.subscriptionExpiresAt.seconds, parsedUser.subscriptionExpiresAt.nanoseconds);
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    showLoader();
    try {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, where("email", "==", email), where("password", "==", pass));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Erro de Login",
          description: "As credenciais fornecidas estão incorretas. Por favor, tente novamente.",
        });
        return false;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as Omit<User, 'id'>;

      // Se o usuário tem uma data de expiração, verifique-a.
      if (userData.subscriptionExpiresAt) {
        const expiresDate = (userData.subscriptionExpiresAt as Timestamp).toDate();
        if (new Date() > expiresDate) {
          toast({
            variant: "destructive",
            title: "Assinatura Expirada",
            description: "Sua assinatura expirou. Por favor, renove para continuar.",
          });
          return false;
        }
      }
      // Se não houver data de expiração (null ou undefined), o acesso é permitido (vitalício).
      
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
     // This function is deprecated as user creation is handled by the Cakto webhook.
     // It now just provides feedback to the user.
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
    // We expect the layout effect to redirect, which will hide the loader.
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

    