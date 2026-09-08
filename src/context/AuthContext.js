import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the saved session when the app starts
  useEffect(() => {
    (async () => {
      try {
        const [token, savedUser] = await Promise.all([
          AsyncStorage.getItem('bhasha_token'),
          AsyncStorage.getItem('bhasha_user'),
        ]);
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    await AsyncStorage.setItem('bhasha_token', res.data.token);
    await AsyncStorage.setItem('bhasha_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    await AsyncStorage.setItem('bhasha_token', res.data.token);
    await AsyncStorage.setItem('bhasha_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['bhasha_token', 'bhasha_user']);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
