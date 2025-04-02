import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import { API_URL } from '../config/constants';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateCartItem, clearCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Function to get the correct image URL
  const getImageUrl = (item) => {
    // First try to get image from Product object if it exists
    if (item.Product && item.Product.image_path) {
      const imagePath = item.Product.image_path;
      return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    }
    
    // Then try the direct image property
    if (item.image) {
      if (item.image.startsWith('http')) {
        return item.image;
      } else {
        return `http://localhost:5000${item.image.startsWith('/') ? '' : '/'}${item.image}`;
      }
    }
    
    // Fallback to placeholder
    return '/placeholder-image.svg';
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('token')) {
      toast.error('Please login to view your cart');
      navigate('/login', { state: { from: '/cart' } });
    }
  }, [isAuthenticated, navigate]);

  // Calculate cart total using the getCartTotal function from context
  const cartTotal = getCartTotal();

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(item.id, newQuantity);
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Handle image errors
  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    e.target.onerror = null; // Prevent infinite error loops
    e.target.src = '/placeholder-image.svg';
  };

  // Show loading state while cart is empty but user is authenticated
  if (isAuthenticated && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your cart is empty</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Add some items to your cart to see them here.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Shopping</span>
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Your Cart is Empty</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-full hover:from-indigo-700 hover:to-violet-700 transition-all"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          <FaArrowLeft />
          <span>Continue Shopping</span>
        </button>
        
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden dark:bg-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your Shopping Cart</h1>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {cartItems.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 flex-shrink-0">
                  <img 
                    src={item.Product && item.Product.image 
                      ? `http://localhost:5000${item.Product.image.startsWith('/') ? '' : '/'}${item.Product.image}`
                      : (item.image 
                          ? `http://localhost:5000${item.image.startsWith('/') ? '' : '/'}${item.image}`
                          : '/placeholder-image.svg')}
                    alt={item.name} 
                    className="w-full h-full object-cover rounded-lg"
                    onError={handleImageError}
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-white">{item.name}</h3>
                  <p className="text-gray-500 text-sm dark:text-gray-400">{item.category}</p>
                  <div className="mt-2 font-semibold text-indigo-600 dark:text-indigo-400">{formatPrice(item.price)}</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center dark:text-white">{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
                
                <div className="font-semibold text-gray-800 dark:text-white">
                  {formatPrice(item.price * item.quantity)}
                </div>
                
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <span className="font-medium text-gray-800 dark:text-gray-200">Subtotal</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between mb-6">
              <span className="font-medium text-gray-800 dark:text-gray-200">Shipping</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-800 dark:text-gray-200">Total</span>
              <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(cartTotal)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
