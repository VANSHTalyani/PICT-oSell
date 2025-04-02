import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaMapMarkerAlt, FaMoneyBill } from 'react-icons/fa';
import { RiBankFill } from 'react-icons/ri';
import { SiPhonepe, SiGooglepay, SiPaytm } from 'react-icons/si';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import * as api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const hasRedirected = useRef(false);
  const isInitialMount = useRef(true);

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cash', // Default to cash
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  // Function to get the correct image URL
  const getImageUrl = (item) => {
    // Safely access properties with null checks
    if (!item) return '/placeholder-image.svg';
    
    // First try to get image from Product object if it exists
    if (item.Product && item.Product.image) {
      const imagePath = item.Product.image;
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

  // Handle initial authentication and cart check only once
  useEffect(() => {
    // Only redirect if not authenticated
    if (!isAuthenticated) {
      hasRedirected.current = true;
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    // Wait for cart to finish loading before making any decisions
    if (!cartLoading) {
      // Only redirect if cart is empty and we're not in the middle of loading
      if (cartItems.length === 0 && !hasRedirected.current) {
        hasRedirected.current = true;
        navigate('/cart');
      } else if (cartItems.length > 0) {
        // Cart has items, we can show the checkout page
        setLoading(false);
      }
    }
  }, [isAuthenticated, cartItems, cartLoading, navigate]);

  // Calculate cart total safely
  const cartTotal = cartItems && cartItems.length > 0 
    ? cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0)
    : 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePaymentMethodChange = (method) => {
    setFormData({
      ...formData,
      paymentMethod: method
    });
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setOrderProcessing(true);
      
      // Create order object
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        paymentMethod: formData.paymentMethod,
        totalAmount: cartTotal
      };
      
      // Submit order to API
      const response = await api.createOrder(orderData);
      
      // Clear cart after successful order
      await clearCart();
      
      // Show success message
      toast.success('Order placed successfully!');
      
      // Redirect to order confirmation page
      navigate('/order-confirmation', { state: { order: response } });
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setOrderProcessing(false);
    }
  };

  // Handle image errors
  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    e.target.onerror = null; // Prevent infinite error loops
    e.target.src = '/placeholder-image.svg';
  };

  // Payment method options
  const paymentMethods = [
    { id: 'cash', label: 'Cash on Delivery', icon: <FaMoneyBill className="text-xl" /> },
    { id: 'netbanking', label: 'Net Banking', icon: <RiBankFill className="text-xl" /> },
    { id: 'upi', label: 'UPI', icon: <div className="flex space-x-1"><SiPhonepe className="text-purple-600" /><SiGooglepay className="text-green-600" /><SiPaytm className="text-blue-600" /></div> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Loading...</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/cart')}
          className="mb-6 flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Cart</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Shipping Information</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                {/* Address Information */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                {/* Payment Method */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                          formData.paymentMethod === method.id ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'
                        }`}
                        onClick={() => handleInputChange({ target: { name: 'paymentMethod', value: method.id } })}
                      >
                        <div className="flex flex-1 items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900 flex items-center gap-2">
                                {method.icon} {method.label}
                              </p>
                            </div>
                          </div>
                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                            formData.paymentMethod === method.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === method.id && (
                              <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional fields based on payment method */}
                {formData.paymentMethod === 'netbanking' && (
                  <div className="mt-6 grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        id="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="ifscCode"
                        id="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'upi' && (
                  <div className="mt-6">
                    <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">
                      UPI ID
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="upiId"
                        id="upiId"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        placeholder="yourname@upi"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mt-2 flex justify-center space-x-4">
                      <SiPhonepe className="text-3xl text-purple-600" />
                      <SiGooglepay className="text-3xl text-green-600" />
                      <SiPaytm className="text-3xl text-blue-600" />
                    </div>
                  </div>
                )}
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    disabled={orderProcessing}
                  >
                    {orderProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden sticky top-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Order Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {cartItems && cartItems.length > 0 ? cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-16 h-16">
                        <img 
                          src={item.Product && item.Product.image 
                            ? `http://localhost:5000${item.Product.image.startsWith('/') ? '' : '/'}${item.Product.image}`
                            : (item.image 
                                ? `http://localhost:5000${item.image.startsWith('/') ? '' : '/'}${item.image}`
                                : '/placeholder-image.svg')}
                          alt={item.name || 'Product'} 
                          className="w-full h-full object-cover rounded"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name || 'Product'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity || 1}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 dark:text-gray-400">No items in cart</p>
                  )}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-800 dark:text-white">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="font-medium text-gray-800 dark:text-white">Free</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-800 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
