import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { api } from '../services/api.js';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  subscribeToAccessToken,
} from '../services/authToken.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (getAccessToken() ? 'checking' : 'anonymous'));

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!getAccessToken()) {
        setStatus('anonymous');
        return;
      }

      try {
        const response = await api.getMe();

        if (!active) return;
        setUser(response.data.user);
        setStatus('authenticated');
      } catch {
        if (!active) return;
        clearAccessToken();
        setUser(null);
        setStatus('anonymous');
      }
    };

    void restoreSession();

    const unsubscribe = subscribeToAccessToken((token) => {
      if (!token) {
        setUser(null);
        setStatus('anonymous');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      login: async (credentials) => {
        setStatus('checking');

        try {
          const response = await api.login(credentials);
          setAccessToken(response.token);
          setUser(response.data.user);
          setStatus('authenticated');
          return response.data.user;
        } catch (error) {
          clearAccessToken();
          setStatus('anonymous');
          throw error;
        }
      },
      logout: async () => {
        try {
          await api.logout();
        } finally {
          clearAccessToken();
          setUser(null);
          setStatus('anonymous');
        }
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
