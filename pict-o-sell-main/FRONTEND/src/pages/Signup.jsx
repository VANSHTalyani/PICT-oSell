import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUserPlus, FaUser, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { showUniqueToast } from '../utils/toastManager';
import toast from 'react-hot-toast';

function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!name) {
      setError('Please enter your name');
      showUniqueToast('Please enter your name', 'error');
      return;
    }
    
    if (!email) {
      setError('Please enter your email');
      showUniqueToast('Please enter your email', 'error');
      return;
    }
    
    if (!password) {
      setError('Please enter a password');
      showUniqueToast('Please enter a password', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      showUniqueToast('Passwords do not match', 'error');
      return;
    }
    
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      showUniqueToast('Please accept the terms and conditions', 'error');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await register({ name, email, password });
      showUniqueToast('Account created successfully!', 'success');
      navigate('/');
    } catch (err) {
      // Check if the error is related to an existing email
      if (err.message && err.message.toLowerCase().includes('email already exists')) {
        setError('This email is already registered. Please use a different email or login to your existing account.');
        showUniqueToast('This email is already registered', 'error');
      } else {
        setError(err.message || 'Failed to create account');
        showUniqueToast(err.message || 'Failed to create account', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      setGoogleLoading(true);
      // Redirect to Google OAuth endpoint
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
              Create your account
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
              Join Pict'o sell and start selling or buying
            </p>
          </div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Name field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-indigo-600 opacity-70" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="
                    appearance-none block w-full pl-12 pr-4 py-3 border-2 border-transparent 
                    bg-indigo-100/30 dark:bg-indigo-900/30 rounded-full placeholder-gray-500 dark:placeholder-gray-400 
                    focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-4 focus:ring-indigo-200/50 dark:focus:ring-indigo-800/50 
                    transition-all duration-400 ease-in-out text-gray-800 dark:text-gray-200
                  "
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-indigo-600 opacity-70" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="
                    appearance-none block w-full pl-12 pr-4 py-3 border-2 border-transparent 
                    bg-indigo-100/30 dark:bg-indigo-900/30 rounded-full placeholder-gray-500 dark:placeholder-gray-400 
                    focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-4 focus:ring-indigo-200/50 dark:focus:ring-indigo-800/50 
                    transition-all duration-400 ease-in-out text-gray-800 dark:text-gray-200
                  "
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
                  className="
                    appearance-none block w-full pl-12 pr-4 py-3 border-2 border-transparent 
                    bg-indigo-100/30 dark:bg-indigo-900/30 rounded-full placeholder-gray-500 dark:placeholder-gray-400 
                    focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-4 focus:ring-indigo-200/50 dark:focus:ring-indigo-800/50 
                    transition-all duration-400 ease-in-out text-gray-800 dark:text-gray-200
                  "
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-indigo-600 opacity-70" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="
                    appearance-none block w-full pl-12 pr-4 py-3 border-2 border-transparent 
                    bg-indigo-100/30 dark:bg-indigo-900/30 rounded-full placeholder-gray-500 dark:placeholder-gray-400 
                    focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-700 focus:ring-4 focus:ring-indigo-200/50 dark:focus:ring-indigo-800/50 
                    transition-all duration-400 ease-in-out text-gray-800 dark:text-gray-200
                  "
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                className="
                  h-5 w-5 text-indigo-600 focus:ring-indigo-500 
                  border-gray-300 rounded mr-3
                "
              />
              <label 
                htmlFor="terms" 
                className="text-base text-gray-900 dark:text-gray-200"
              >
                I agree to the Terms and Conditions
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full flex justify-center py-3.5 px-5 
                  border border-transparent rounded-full 
                  shadow-lg text-base font-bold 
                  bg-gradient-to-r from-indigo-600 to-violet-600 
                  text-white hover:from-violet-700 hover:to-indigo-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-indigo-500 transition-all duration-500 
                  group disabled:opacity-70 disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing up...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-3 text-lg group-hover:animate-pulse" />
                    Sign up
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
                  className="
                    mt-4 w-full flex justify-center py-3.5 px-5 
                    border border-gray-300 dark:border-gray-700 rounded-full 
                    shadow-md text-base font-medium 
                    bg-white dark:bg-gray-800 
                    text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-indigo-500 transition-all duration-500 
                    group disabled:opacity-70 disabled:cursor-not-allowed
                  "
                >
                  {googleLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing up...
                    </>
                  ) : (
                    <>
                      <FaGoogle className="mr-3 text-lg text-red-500 group-hover:animate-pulse" />
                      Sign up with Google
                    </>
                  )}
                </button>
              </div>
              

              
              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </form>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-indigo-100"></div>
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Already a member?
                </span>
              </div>
            </div>
            
            <div className="mt-5">
              <Link 
                to="/login" 
                className="
                  font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 
                  transition-colors duration-300 text-base
                "
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;