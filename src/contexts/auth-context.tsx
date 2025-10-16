
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  
  const logout = useCallback(() => {
    showLoader();
    setUser(null);
    localStorage.removeItem('lci-user');
    // We don't hide the loader immediately to allow for a page transition
    // The new page's own logic will hide the loader.
    setTimeout(hideLoader, 500); 
  }, [showLoader, hideLoader]);

  useEffect(() => {
    const verifyUserSession = async () => {
       // Se estiver na página de admin, não faz a verificação de sessão de usuário comum.
      if (pathname === '/admin') {
        setLoading(false);
        return;
      }
      
      let storedUser;
      try {
        const storedUserJSON = localStorage.getItem('lci-user');
        if (!storedUserJSON) {
          setLoading(false);
          return;
        }
        storedUser = JSON.parse(storedUserJSON);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        setLoading(false);
        return;
      }
      
      if (storedUser?.id) {
        try {
          const userRef = doc(db, "users", storedUser.id);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const freshUserData = { id: userSnap.id, ...userSnap.data() } as User;

            if (freshUserData.subscriptionExpiresAt) {
              const expiresAt = (freshUserData.subscriptionExpiresAt as Timestamp).toDate();
              if (new Date() > expiresAt) {
                console.log("Subscription expired on load, logging out.");
                showSubscriptionModal(expiresAt);
                logout();
                return;
              }
            }
            // Update local state and storage with fresh data
            setUser(freshUserData);
            localStorage.setItem('lci-user', JSON.stringify(freshUserData));
          } else {
            // User doesn't exist in DB anymore, clear session
            logout();
          }
        } catch (error) {
            console.error("Error verifying user session against Firestore:", error);
            // In case of DB error, trust local data for a bit but might be stale
            setUser(storedUser);
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, [logout, showSubscriptionModal, pathname]);


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
