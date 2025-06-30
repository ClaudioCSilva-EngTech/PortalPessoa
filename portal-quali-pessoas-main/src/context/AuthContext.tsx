import React, { createContext, useContext, useState, type ReactNode } from 'react';

const API_URL = import.meta.env.VITE_BFF_URL;

export interface UserType {
  data: {detalhes: {setor: string,nome: string}}
  // ...outros campos
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserType | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log(data);
      if (!response.ok || !data.success) {
        return { success: false, message: 'E-mail ou senha inválidos.1' };
      }
      setUser(data);
      setIsAuthenticated(true);
      sessionStorage.setItem('user', JSON.stringify(data));
      return { success: true };
    } catch {
      return { success: false, message: 'Erro ao conectar ao servidor.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('user'); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};