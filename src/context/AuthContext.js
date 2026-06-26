import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const STORAGE_KEY = 'snapwild_user';

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(val => { if (val) setUser(JSON.parse(val)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (phone) => {
    const userData = {
      phone,
      username: 'Explorer_' + phone.slice(-4),
      level: 1,
      xp: { hunter: 0, guardian: 0, health: 0, social: 0 },
      streak: 0,
      catches: 0,
      rescues: 0,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
