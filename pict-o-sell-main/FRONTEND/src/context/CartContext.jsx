import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const authState = useAuth();
  const { isAuthenticated } = authState;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart items when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCartItems();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const { cartItems } = await api.getCart();
      setCartItems(cartItems);
    } catch (error) {
      console.error('Load cart error:', error);
      setError(error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      const { cartItem } = await api.addToCart(product.id, quantity);
      setCartItems(prev => [...prev, cartItem]);
      return cartItem;
    } catch (error) {
      console.error('Add to cart error:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const { cartItem } = await api.updateCartItem(itemId, quantity);
      setCartItems(prev => 
        prev.map(item => item.id === itemId ? cartItem : item)
      );
      return cartItem;
    } catch (error) {
      console.error('Update cart error:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      await api.removeFromCart(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Remove from cart error:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await api.clearCart();
      setCartItems([]);
    } catch (error) {
      console.error('Clear cart error:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.Product.price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
