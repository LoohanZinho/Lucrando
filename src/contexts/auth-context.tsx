
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { useLoader } from './loader-context';
import { type User } from '@/lib/data-types';

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

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('lci-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
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
        return false;
      }
      
      const userData = querySnapshot.docs[0].data() as Omit<User, 'id'>;
      const loggedUser: User = { id: querySnapshot.docs[0].id, ...userData };
      
      setUser(loggedUser);
      localStorage.setItem('lci-user', JSON.stringify(loggedUser));
      return true;

    } catch (error) {
      console.error("Login error:", error);
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
            // User already exists
            return false;
        }

        const newUser: Omit<User, 'id'> = {
            displayName: username,
            email,
            password: pass, // Storing password in plain text
            photoURL: '',
        };

        const docRef = await addDoc(usersCol, newUser);

        const loggedUser: User = { id: docRef.id, ...newUser };
        
        setUser(loggedUser);
        localStorage.setItem('lci-user', JSON.stringify(loggedUser));
        return true;

     } catch (error) {
        console.error("Signup error:", error);
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
