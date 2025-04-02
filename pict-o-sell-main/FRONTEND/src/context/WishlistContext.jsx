import React, { createContext, useContext, useState, useEffect } from 'react';
import { showUniqueToast } from '../utils/toastManager';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const authState = useAuth();
  const { isAuthenticated, user } = authState;

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
        setWishlist([]);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    if (!isAuthenticated) {
      showUniqueToast('Please login to add items to your wishlist', 'error');
      return;
    }

    if (wishlist.some(item => item.id === product.id)) {
      showUniqueToast('Item already in wishlist', 'error');
      return;
    }

    setWishlist(prev => [...prev, product]);
    showUniqueToast('Added to wishlist', 'success');
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
    showUniqueToast('Removed from wishlist', 'success');
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  // Clear wishlist
  const clearWishlist = () => {
    setWishlist([]);
    showUniqueToast('Wishlist cleared', 'success');
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
