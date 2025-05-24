"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "./firebase-init";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || "Erro ao fazer login");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message || "Erro ao fazer logout");
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: username });
    } catch (error: any) {
      throw new Error(error.message || "Erro ao criar conta");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};
