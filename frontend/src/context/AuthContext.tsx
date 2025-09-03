import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAccessToken, getCsrfCookie, API_BASE_URL } from '../services/api';
import type { User } from '../types';

type AuthCtx = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/user', { baseURL: API_BASE_URL, withCredentials: true });
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  const login = async (email: string, password: string) => {
    await getCsrfCookie();

    const res = await api.post(
      '/login',
      { email, password },
      { baseURL: API_BASE_URL, withCredentials: true }
    );

    const t = res?.data?.token || res?.data?.plainTextToken || res?.data?.access_token;
    if (t) setAccessToken(t);

    await fetchUser();
  };

  const logout = async () => {
    try {
      await api.post('/logout', {}, { baseURL: API_BASE_URL, withCredentials: true });
    } catch {}
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);