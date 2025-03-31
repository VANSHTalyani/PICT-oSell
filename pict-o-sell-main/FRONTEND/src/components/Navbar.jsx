import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  Bell,
  ShoppingCart,
  Heart
} from 'lucide-react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const { darkMode, toggleDarkMode } = useTheme();
  const authState = useAuth();
  const { isAuthenticated, user, logout } = authState;

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  }, [location]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav 
      ref={dropdownRef} 
      className="sticky top-0 z-50 flex justify-between items-center p-4 bg-gradient-to-r from-white via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 shadow-2xl border-b border-indigo-100 dark:border-indigo-900/30 backdrop-blur-sm transition-colors duration-300"
    >
      {/* Logo with Enhanced Hover and Gradient */}
      <Link 
        to="/" 
        className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent 
        hover:from-violet-600 hover:to-indigo-600 transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-2"
      >
        Pict'o sell
      </Link>
      
      {/* Desktop Navigation with Refined Interactions */}
      <div className="hidden md:flex items-center space-x-5">
        {/* Dark Mode Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="relative p-2.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 dark:from-indigo-800 dark:to-purple-800 hover:shadow-lg
            transition-all duration-300 group overflow-hidden hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-tr from-yellow-300 to-yellow-200 dark:from-indigo-600 dark:to-purple-700 opacity-80 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            <div className="relative w-6 h-6 flex items-center justify-center">
              <FiSun className="absolute w-5 h-5 text-amber-600 dark:text-transparent dark-toggle-icon sun transition-all duration-500 transform dark:rotate-90 dark:scale-0 scale-100 group-hover:text-amber-700" />
              <FiMoon className="absolute w-5 h-5 text-transparent dark:text-indigo-100 dark-toggle-icon moon transition-all duration-500 transform -rotate-90 scale-0 dark:scale-100 dark:rotate-0 group-hover:dark:text-white" />
            </div>
          </button>
        </div>
        
        {/* Cart Icon */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/cart')}
            className="relative p-2.5 rounded-full bg-indigo-100/30 dark:bg-indigo-900/30 hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 
            transition-all duration-300 group"
          >
            <ShoppingCart className="w-6 h-6 text-indigo-700 group-hover:text-indigo-900 
              group-hover:scale-110 transition-all" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white 
              text-xs rounded-full px-2 py-0.5 animate-pulse">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Wishlist Icon */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/wishlist')}
            className="relative p-2.5 rounded-full bg-pink-100/30 dark:bg-pink-900/30 hover:bg-pink-200/50 dark:hover:bg-pink-800/50 
            transition-all duration-300 group"
          >
            <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 
              group-hover:scale-110 transition-all" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white 
              text-xs rounded-full px-2 py-0.5 animate-pulse">
                {wishlist.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Notification Icon with Advanced Effects */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 rounded-full bg-indigo-100/30 dark:bg-indigo-900/30 hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 
            transition-all duration-300 group"
          >
            <Bell className="w-6 h-6 text-indigo-700 group-hover:text-indigo-900 
              group-hover:scale-110 transition-all" />
            {notifications > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white 
              text-xs rounded-full px-2 py-0.5 animate-pulse">
                {notifications}
              </span>
            )}
          </button>
        </div>

        {/* Authentication and User Management */}
        {!isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="px-5 py-2.5 text-indigo-700 hover:text-indigo-900 
              hover:bg-indigo-100 rounded-full transition-all duration-300"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 
              text-white rounded-full hover:from-violet-700 hover:to-indigo-700 
              transition-all duration-500 shadow-lg hover:shadow-xl"
            >
              Sign up
            </Link>
          </div>
        ) : (
          <>
            {/* Removing "Sell an Item" link from navbar since it's already on the home page */}
            
            {/* User Dropdown with Elegant Styling */}
            <div className="relative">
              <button 
                onClick={toggleDropdown} 
                aria-label="User menu"
                className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-violet-200 dark:from-indigo-800 dark:to-violet-800 
                text-indigo-700 dark:text-indigo-200 rounded-full hover:from-indigo-300 hover:to-violet-300 dark:hover:from-indigo-700 dark:hover:to-violet-700 
                transition-all duration-300 flex items-center justify-center 
                shadow-md hover:shadow-lg"
              >
                <User className="w-6 h-6" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900/30 
                rounded-2xl shadow-2xl z-20 overflow-hidden animate-slide-down">
                  <Link 
                    to="/profile" 
                    className="flex items-center px-5 py-3.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 
                    transition-colors duration-300 group"
                  >
                    <User className="mr-4 w-5 h-5 text-indigo-600 group-hover:text-indigo-800" /> 
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="flex items-center px-5 py-3.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 
                    transition-colors duration-300 group"
                  >
                    <Settings className="mr-4 w-5 h-5 text-indigo-600 group-hover:text-indigo-800" /> 
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-5 py-3.5 hover:bg-red-50 
                    text-red-600 transition-colors duration-300 group"
                  >
                    <LogOut className="mr-4 w-5 h-5 group-hover:text-red-800" /> 
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle with Enhanced Interaction */}
      <div className="md:hidden flex items-center space-x-2">
        <button 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          className="p-2 rounded-full bg-indigo-100/30 hover:bg-indigo-200/50 
          focus:outline-none focus:ring-4 focus:ring-indigo-300/50 
          transition-all duration-300 ease-in-out transform active:scale-90"
        >
          <Menu className="w-6 h-6 text-indigo-700 hover:text-indigo-900" />
        </button>
      </div>

      {/* Mobile Menu Dropdown with Refined Aesthetic */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-gradient-to-b from-white to-indigo-50 
        shadow-2xl md:hidden z-20 border-t-2 border-indigo-100 animate-slide-down">
          {/* Mobile Menu Items with Refined Styling */}
          <div className="flex flex-col p-4 space-y-4">
            {/* Notifications for Mobile */}
            <div className="flex justify-between items-center pb-4 border-b border-indigo-100">
              <button 
                onClick={() => navigate('/notifications')}
                className="flex items-center space-x-3 hover:bg-indigo-50 p-3 
                rounded-full transition-colors duration-300 group"
              >
                <Bell className="w-6 h-6 text-indigo-600 group-hover:text-indigo-800" />
                <span className="text-gray-700 group-hover:text-indigo-900">Notifications</span>
                {notifications > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full 
                  px-2 py-0.5 ml-2 animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Authentication Flow */}
            {!isAuthenticated ? (
              <div className="space-y-4">
                <Link 
                  to="/login" 
                  className="block w-full text-center px-5 py-3.5 text-indigo-700 
                  hover:bg-indigo-100 rounded-full transition-colors duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block w-full text-center px-5 py-3.5 bg-gradient-to-r 
                  from-indigo-600 to-violet-600 text-white rounded-full 
                  hover:from-violet-700 hover:to-indigo-700 transition-all 
                  duration-500 shadow-lg"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Removing "Sell an Item" link from mobile menu since it's already on the home page */}
                <div className="border-t border-indigo-100 pt-4">
                  <Link 
                    to="/profile" 
                    className="block px-5 py-3.5 hover:bg-indigo-50 
                    rounded-full transition-colors duration-300 group"
                  >
                    <span className="text-gray-700 group-hover:text-indigo-900">View Profile</span>
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-5 py-3.5 hover:bg-indigo-50 
                    rounded-full transition-colors duration-300 group"
                  >
                    <span className="text-gray-700 group-hover:text-indigo-900">Settings</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left block px-5 py-3.5 
                    hover:bg-red-50 text-red-600 rounded-full 
                    transition-colors duration-300 group"
                  >
                    <span className="group-hover:text-red-800">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;