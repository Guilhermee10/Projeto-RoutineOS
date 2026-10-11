import { createContext, useContext, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());

  async function login(email, password) {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
  }

  async function register(name, email, password) {
    const newUser = await authService.register(name, email, password);
    setUser(newUser);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  const value = { user, isAuthenticated: !!user, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook customizado: em vez de toda tela importar useContext(AuthContext),
// ela só chama useAuth() - mais limpo, e centraliza a checagem de erro
// caso alguém tente usar isso fora do Provider.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider.');
  }
  return context;
}
