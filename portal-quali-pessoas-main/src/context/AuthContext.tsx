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
      console.log('🔐 Iniciando login no frontend...');
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('📊 Resposta do login recebida:', {
        success: data.success,
        hasData: !!data.data,
        hasToken: !!(data.data?.token || data.data?.access_token),
        structure: Object.keys(data.data || {})
      });
      
      if (!response.ok || !data.success) {
        console.log('❌ Login falhou:', data.message);
        return { success: false, message: 'E-mail ou senha inválidos.' };
      }
      
      setUser(data);
      setIsAuthenticated(true);
      
      // Armazenar dados do usuário
      sessionStorage.setItem('user', JSON.stringify(data));
      
      // Armazenar token separadamente para facilitar acesso
      const token = data.data?.token || data.data?.access_token || data.data?.auth?.token?.access;
      if (token) {
        console.log('✅ Token encontrado e será armazenado:', token.substring(0, 30) + '...');
        sessionStorage.setItem('token', token);
      } else {
        console.warn('⚠️ Token não encontrado na resposta do login');
        console.log('📋 Estrutura completa da resposta:', JSON.stringify(data, null, 2));
      }
      
      console.log('✅ Login concluído com sucesso no frontend');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro durante login no frontend:', error);
      return { success: false, message: 'Erro ao conectar ao servidor.' };
    }
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token'); // Remover token também
    console.log('✅ Logout concluído');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
