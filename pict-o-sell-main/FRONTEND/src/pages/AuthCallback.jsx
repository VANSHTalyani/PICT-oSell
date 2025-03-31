import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import toast from 'react-hot-toast';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get token from URL query parameters
        const token = searchParams.get('token');
        
        if (!token) {
          toast.error('Authentication failed. No token received.');
          navigate('/login');
          return;
        }
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Fetch user profile with the token
        const { user } = await api.getProfile();
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        // Handle any pending cart actions
        const pendingAction = localStorage.getItem('pendingCartAction');
        if (pendingAction) {
          localStorage.removeItem('pendingCartAction');
          navigate('/cart');
        } else {
          navigate('/');
        }
        
        toast.success('Successfully logged in!');
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error(error.message || 'Authentication failed');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    handleAuthCallback();
  }, [searchParams, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Completing authentication...</h2>
      </div>
    </div>
  );
}

export default AuthCallback;
