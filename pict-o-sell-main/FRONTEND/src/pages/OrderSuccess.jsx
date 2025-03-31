import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaListAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.error('Please login to view order details');
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.getOrderById(orderId);
        setOrder(response.order);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && isAuthenticated) {
      fetchOrderDetails();
    }
  }, [orderId, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-green-600 dark:text-green-400 text-3xl" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
            
            {order && (
              <div className="text-left border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order Details</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Order ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Payment Method</p>
                      <p className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Payment Status</p>
                      <p className={`font-medium ${
                        order.paymentStatus === 'Completed' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 dark:text-gray-400">Shipping Address</p>
                      <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order Items</h2>
                  <div className="space-y-3">
                    {order.items && order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {item.Product && item.Product.image_path && (
                            <img 
                              src={item.Product.image_path} 
                              alt={item.Product.title} 
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.Product ? item.Product.title : 'Product'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <FaHome className="mr-2" />
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <FaListAlt className="mr-2" />
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
