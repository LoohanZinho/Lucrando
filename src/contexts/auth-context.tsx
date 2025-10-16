
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
          description: "Credenciais inválidas.",
        });
        return false;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as Omit<User, 'id'>;

      // Validação de Assinatura
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
      } else {
        // Se não houver data de expiração, significa que nunca pagou
        toast({
            variant: "destructive",
            title: "Sem Assinatura Ativa",
            description: "Você não possui uma assinatura ativa.",
          });
        return false;
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
     showLoader();
     try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            toast({
              variant: "destructive",
              title: "Erro de Cadastro",
              description: "Este e-mail já está em uso.",
            });
            return false;
        }

        // Não cria o usuário, apenas mostra o toast
        toast({
          title: "Quase lá!",
          description: "Agora realize o pagamento para receber suas credenciais de acesso por e-mail.",
          duration: 10000,
        });
        
        // Retorna false para manter o usuário na tela atual e redirecioná-lo para o checkout (se aplicável).
        return false;

     } catch (error) {
        console.error("Signup check error:", error);
         toast({
          variant: "destructive",
          title: "Erro Inesperado",
          description: "Ocorreu um erro durante a verificação do cadastro.",
        });
        return false;
     } finally {
        hideLoader();
     }
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
