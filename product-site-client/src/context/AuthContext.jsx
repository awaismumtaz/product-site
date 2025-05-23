import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      await api.post('/account/login', { email, password });
      // The backend will set the authentication cookie
      // We just need to fetch the user info
      const userResponse = await api.get('/account/me');
      const userData = userResponse.data;
      setUser(userData);
      return { 
        success: true,
        isAdmin: userData.roles?.includes('Admin') || false
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/account/logout');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: error.response?.data?.message || 'Logout failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      await api.post('/account/register', { email, password });
      // The backend will automatically sign in the user after registration
      // We just need to fetch the user info
      const userResponse = await api.get('/account/me');
      setUser(userResponse.data);
      closeLoginModal();
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Check for existing user session on initial load
  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        const response = await api.get('/account/me');
        setUser(response.data);
      } catch (error) {
        console.error("Session verification error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUserSession();
  }, []);

  const value = {
    user,
    login,
    logout,
    register,
    hasRole,
    loading,
    loginModalOpen,
    openLoginModal,
    closeLoginModal
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
