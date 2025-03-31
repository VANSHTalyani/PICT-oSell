import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Create a flag to track if the toast has been shown
// Using a module-level variable instead of state to ensure it persists across renders
let loginToastShown = false;

function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          toast.error('Google login failed. Please try again.');
          navigate('/login');
          return;
        }

        if (!token) {
          toast.error('No token received. Please try again.');
          navigate('/login');
          return;
        }

        // Store token in localStorage directly
        localStorage.setItem('token', token);
        
        // Fetch user profile using the token
        try {
          const { user } = await googleLogin(token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Handle any pending cart actions and redirect
          const pendingAction = localStorage.getItem('pendingCartAction');
          if (pendingAction) {
            localStorage.removeItem('pendingCartAction');
            navigate('/cart');
          } else {
            navigate('/');
          }
          
          // Show only one toast notification
          if (!loginToastShown) {
            toast.success('Successfully logged in with Google!');
            loginToastShown = true;
          }
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
          // Even if profile fetch fails, we still have the token, so redirect to home
          navigate('/');
          // Don't show a success toast here
        }
      } catch (error) {
        console.error('Google callback error:', error);
        toast.error('Failed to complete Google login. Please try again.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [googleLogin, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center">
      <div className="text-center">
        {isLoading && (
          <>
            <div className="animate-spin w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            <p className="text-gray-600 dark:text-gray-300">Completing Google authentication...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default GoogleCallback;
