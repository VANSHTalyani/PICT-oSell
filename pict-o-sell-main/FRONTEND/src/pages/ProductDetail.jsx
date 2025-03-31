import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaCheck, FaTag, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import * as api from '../services/api';
import '../styles/sellerDetails.css';

function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const authState = useAuth();
  const { isAuthenticated } = authState;
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(location.state?.product || null);
  const [fetchError, setFetchError] = useState(null);

  // Fetch product data if not available in location state
  useEffect(() => {
    const fetchProductData = async () => {
      if (!product && id) {
        try {
          setLoading(true);
          const response = await api.getProduct(id);
          setProduct(response.product);
          setFetchError(null);
        } catch (error) {
          console.error('Error fetching product:', error);
          setFetchError('Failed to load product details. Please try again.');
          toast.error('Failed to load product details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProductData();
  }, [id, product]);

  // If loading or no product is available yet
  if (loading || (!product && !fetchError)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
        <div className="text-center">
          <div className="animate-pulse w-16 h-16 mx-auto mb-4 bg-indigo-300 dark:bg-indigo-700 rounded-full"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading product details...</p>
        </div>
      </div>
    );
  }

  // If there was an error fetching the product
  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{fetchError}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Products</span>
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-indigo-100 dark:border-indigo-900 overflow-hidden">
          {/* Image Section with Hover Effect */}
          <div className="relative group">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
          </div>

          {/* Product Details Section */}
          <div className="p-10 space-y-6">
            <div className="border-b border-indigo-100 dark:border-indigo-900/50 pb-4">
              <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                {product.title}
              </h1>
              <div className="flex items-center space-x-3">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <span 
                      key={index} 
                      className={`text-2xl ${
                        index < Math.floor(product.rating) 
                          ? 'text-amber-400' 
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-300">
                  ({product.rating} ratings)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatPrice(product.price)}
                </span>
                <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full flex items-center space-x-2">
                  <FaCheck className="text-green-600 dark:text-green-400" />
                  <span>{product.stock} in stock</span>
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={async () => {
                    if (!isAuthenticated || !localStorage.getItem('token')) {
                      // Store the product and intended action in localStorage before redirecting
                      localStorage.setItem('pendingCartAction', JSON.stringify({
                        productId: product.id,
                        action: 'addToCart',
                        product // Store the whole product to avoid fetching again
                      }));
                      navigate('/login', { 
                        state: { 
                          from: location.pathname,
                          message: 'Please login to add items to cart'
                        } 
                      });
                      return;
                    }
                    
                    try {
                      setLoading(true);
                      await addToCart(product);
                      toast.success('Added to cart successfully!');
                      navigate('/cart');
                    } catch (error) {
                      console.error('Add to cart error:', error);
                      // Don't show the error if it's handled by the API interceptor
                      if (!error.includes('Please login')) {
                        toast.error(error || 'Failed to add to cart');
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="
                    flex items-center justify-center space-x-3
                    bg-gradient-to-r from-indigo-600 to-violet-600 
                    text-white py-3 rounded-full 
                    hover:from-violet-700 hover:to-indigo-700 
                    transition-all duration-500
                    shadow-lg hover:shadow-xl
                    disabled:opacity-70 disabled:cursor-not-allowed
                  "
                >
                  {loading ? (
                    <span className="animate-pulse">Adding...</span>
                  ) : (
                    <>
                      <FaShoppingCart className="text-xl" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={async () => {
                    if (!isAuthenticated) {
                      toast.error('Please login to add items to wishlist');
                      navigate('/login', { 
                        state: { 
                          from: location.pathname,
                          message: 'Please login to add to wishlist'
                        } 
                      });
                      return;
                    }
                    
                    try {
                      if (isInWishlist(product.id)) {
                        await removeFromWishlist(product.id);
                        toast.success('Removed from wishlist!');
                      } else {
                        await addToWishlist(product.id);
                        toast.success('Added to wishlist!');
                      }
                    } catch (error) {
                      console.error('Wishlist error:', error);
                      if (!error.includes('Please login')) {
                        toast.error(error || 'Failed to update wishlist');
                      }
                    }
                  }}
                  className={`
                    flex items-center justify-center space-x-3 
                    border-2 ${isInWishlist(product.id) 
                      ? 'border-red-600 dark:border-red-500 text-red-600 dark:text-red-400' 
                      : 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    } py-3 rounded-full 
                    hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors
                    shadow-md hover:shadow-lg
                  `}
                >
                  <FaHeart className={isInWishlist(product.id) ? 'text-xl text-red-600' : 'text-xl'} />
                  <span>{isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 seller-details-card p-5 rounded-lg border border-indigo-100 dark:border-indigo-800 space-y-2">
              <div className="flex items-center space-x-3">
                <FaTag className="text-indigo-600 dark:text-indigo-400 seller-tag-icon text-xl" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Seller Details</h3>
              </div>
              {product.seller ? (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{product.seller.name}</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-amber-500 seller-rating-star">★</span>
                      <span className="text-gray-600 dark:text-gray-400 seller-rating-text">{product.seller.rating} Seller Rating</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Seller information not available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;