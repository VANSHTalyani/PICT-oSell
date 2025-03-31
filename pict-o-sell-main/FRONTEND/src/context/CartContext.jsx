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
      // Transform cart items to ensure consistent price access
      const transformedItems = cartItems.map(item => ({
        ...item,
        price: item.Product ? item.Product.price : item.price,
        name: item.Product ? item.Product.title : item.name,
        image: item.Product ? item.Product.image_path : item.image,
        category: item.Product ? item.Product.category : item.category
      }));
      setCartItems(transformedItems);
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
      // Transform cart item to ensure consistent price access
      const transformedItem = {
        ...cartItem,
        price: cartItem.Product ? cartItem.Product.price : cartItem.price,
        name: cartItem.Product ? cartItem.Product.title : cartItem.name,
        image: cartItem.Product ? cartItem.Product.image_path : cartItem.image,
        category: cartItem.Product ? cartItem.Product.category : cartItem.category
      };
      setCartItems(prev => [...prev, transformedItem]);
      return transformedItem;
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
      const { cartItem } = await api.updateCartQuantity(itemId, quantity);
      // Transform cart item to ensure consistent price access
      const transformedItem = {
        ...cartItem,
        price: cartItem.Product ? cartItem.Product.price : cartItem.price,
        name: cartItem.Product ? cartItem.Product.title : cartItem.name,
        image: cartItem.Product ? cartItem.Product.image_path : cartItem.image,
        category: cartItem.Product ? cartItem.Product.category : cartItem.category
      };
      setCartItems(prev => 
        prev.map(item => item.id === itemId ? transformedItem : item)
      );
      return transformedItem;
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
      // Use item.price directly since we've already transformed the items
      return total + (item.price * item.quantity);
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
    updateCartQuantity: updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
