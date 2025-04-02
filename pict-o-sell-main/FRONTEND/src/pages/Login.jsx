import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { showUniqueToast } from '../utils/toastManager';
import toast from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      handlePendingCartAction();
    }
  }, [isAuthenticated]);

  const handlePendingCartAction = async () => {
    const pendingAction = localStorage.getItem('pendingCartAction');
    if (pendingAction) {
      try {
        const { action, product } = JSON.parse(pendingAction);
        if (action === 'addToCart' && product) {
          await addToCart(product);
          showUniqueToast('Added to cart successfully!', 'success');
          navigate('/cart');
        }
      } catch (error) {
        console.error('Error handling pending cart action:', error);
        showUniqueToast('Failed to add item to cart', 'error');
      } finally {
        localStorage.removeItem('pendingCartAction');
      }
    } else {
      // If no pending action, redirect to the intended page or home
      const from = location.state?.from || '/';
      navigate(from);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showUniqueToast('Please fill in all fields', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await login({ email, password });
      // Success toast is now handled in AuthContext
      // handlePendingCartAction is called by the useEffect when isAuthenticated changes
    } catch (err) {
      showUniqueToast(err.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      setGoogleLoading(true);
      // Redirect to the backend's Google OAuth endpoint
      // Make sure we're using the correct URL format
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      window.location.href = `${apiUrl}/api/auth/google`;
    } catch (error) {
      showUniqueToast('Failed to start Google login', 'error');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-indigo-100 dark:border-indigo-900 overflow-hidden">
        <div className="p-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center justify-center">
              <span className="mr-4">●</span>
              Sign in to your account
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
              Welcome back to Pict'o sell
            </p>
          </div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-indigo-600 opacity-70" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full pl-12 pr-4 py-3 border-2 border-transparent bg-indigo-100/30 dark:bg-indigo-900/30 rounded-full placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-4 focus:ring-indigo-200/50 dark:focus:ring-indigo-800/50 transition-all duration-400 ease-in-out text-gray-800 dark:text-gray-200"
                  placeholder="College Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-indigo-600 opacity-70" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full pl-12 pr-4 py-3 border-2 border-transparent bg-indigo-100/30 dark:bg-indigo-900/30 rounded-full placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-4 focus:ring-indigo-200/50 dark:focus:ring-indigo-800/50 transition-all duration-400 ease-in-out text-gray-800 dark:text-gray-200"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor="remember-me" 
                  className="ml-3 block text-base text-gray-900 dark:text-gray-200"
                >
                  Remember me
                </label>
              </div>

              <div className="text-base">
                <a 
                  href="#" 
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-300"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-5 border border-transparent rounded-full shadow-lg text-base font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-500 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="mr-3 text-lg group-hover:animate-pulse" />
                    Sign in
                  </>
                )}
              </button>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="mt-4 w-full flex justify-center items-center py-3.5 px-5 border border-transparent rounded-full shadow-lg text-base font-bold bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-500 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting to Google...
                    </>
                  ) : (
                    <>
                      <FaGoogle className="mr-3 text-lg group-hover:animate-pulse text-red-500" />
                      Continue with Google
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;