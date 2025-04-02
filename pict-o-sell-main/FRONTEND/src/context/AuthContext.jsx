import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';
import { showUniqueToast } from '../utils/toastManager';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null
  });

  // Load user data if we have a token
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        setState(prev => ({ ...prev, token }));
        
        try {
          const { user } = await api.getProfile();
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          }));
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Load user error:', error);
          // Only clear auth if it's an auth error
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: 'Session expired. Please login again.'
          }));
          showUniqueToast('Session expired. Please login again.', 'error');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        showUniqueToast(error.message, 'error');
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { token, user } = await api.login(credentials);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null
      });
      
      showUniqueToast('Login successful!', 'success');
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: error.message || 'Login failed'
      }));
      showUniqueToast(error.message || 'Login failed', 'error');
      throw error;
    }
  };

  const googleLogin = async (response) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // If we already have a token (from the callback URL), use it to fetch the profile
      if (typeof response === 'string') {
        // This is a token from the OAuth callback
        try {
          const userData = await api.getProfile();
          
          // Update state with user data
          setState({
            isAuthenticated: true,
            user: userData.user,
            loading: false,
            error: null
          });
          
          return { user: userData.user, token: response };
        } catch (profileError) {
          console.error('Error fetching profile with token:', profileError);
          setState(prev => ({ 
            ...prev, 
            loading: false,
            error: profileError.message || 'Failed to fetch profile'
          }));
          showUniqueToast(profileError.message || 'Failed to fetch profile', 'error');
          throw profileError;
        }
      } else {
        // This is a direct Google login attempt (not from callback)
        // Handle both formats: {credential: token} or direct token object
        const payload = response.credential 
          ? { token: response.credential } 
          : response;
        
        const { token, user } = await api.googleLogin(payload);
        
        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update state
        setState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
        
        return { user, token };
      }
    } catch (error) {
      console.error('Google login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to login with Google'
      }));
      showUniqueToast(error.message || 'Google login failed', 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null
    });
    showUniqueToast('Logged out successfully', 'success');
  };

  const register = async (userData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { token, user } = await api.register(userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null
      });
      
      showUniqueToast('Registration successful!', 'success');
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: error.message || 'Registration failed'
      }));
      showUniqueToast(error.message || 'Registration failed', 'error');
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    logout,
    googleLogin,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};