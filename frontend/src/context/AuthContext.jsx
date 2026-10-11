import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'

  // Check current session on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await authAPI.getMe();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        // Not logged in or expired token; clean state
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (identifier, password) => {
    const data = await authAPI.login(identifier, password);
    if (data.success && data.user) {
      setUser(data.user);
      setIsAuthModalOpen(false);
    }
    return data;
  };

  const register = async (username, email, password) => {
    const data = await authAPI.register(username, email, password);
    if (data.success && data.user) {
      setUser(data.user);
      setIsAuthModalOpen(false);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
    }
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
