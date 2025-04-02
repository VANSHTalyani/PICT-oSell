import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaCheck, FaTag, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { showUniqueToast } from '../utils/toastManager';
import { formatPrice } from '../utils/formatPrice';
import * as api from '../services/api';
import '../styles/sellerDetails.css';

function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, updateCartItem, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const authState = useAuth();
  const { isAuthenticated } = authState;
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(location.state?.product || null);
  const [fetchError, setFetchError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [fullImageTransition, setFullImageTransition] = useState(false);

  // Check if product is already in cart and get current quantity
  const productInCart = cartItems?.find(item => {
    // Handle different possible structures of cart items
    if (item.product && item.product.id) {
      return item.product.id === (product?.id || id);
    } else if (item.productId) {
      return item.productId === (product?.id || id);
    } else if (item.id) {
      return item.id === (product?.id || id);
    }
    return false;
  });
  
  const currentCartQuantity = productInCart ? productInCart.quantity : 0;
  
  // Calculate remaining stock after considering what's already in cart
  const remainingStock = product ? (product.stock || 0) - currentCartQuantity : 0;

  // Keep track of the last successful cart operation
  const [lastAddedQuantity, setLastAddedQuantity] = useState(0);

  // Function to get the correct image URL
  const getImageUrl = (product, imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/500?text=No+Image';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    }
  };

  // Handle image loading error
  const handleImageError = () => {
    console.error(`Failed to load image for product: ${product?.title || 'Unknown Product'}`);
    setImageError(true);
  };

  // Fetch product data if not available in location state
  useEffect(() => {
    const fetchProductData = async () => {
      if (!product && id) {
        try {
          setLoading(true);
          const response = await api.getProduct(id);
          
          // Check if the response has the expected structure
          if (response && response.product) {
            // Normalize product data
            const normalizedProduct = {
              ...response.product,
              // Ensure stock/quantity is properly set
              stock: response.product.stock || response.product.quantity || 0,
              // Ensure price is a number
              price: typeof response.product.price === 'string' ? parseFloat(response.product.price) : response.product.price,
              // Ensure rating is a number
              rating: response.product.rating || 0,
              // Ensure seller information is present
              seller: response.product.seller || { username: 'Unknown Seller' }
            };
            
            // Process images
            processProductImages(normalizedProduct);
            
            setProduct(normalizedProduct);
            setFetchError(null);
          } else if (response) {
            // If we got a response but it doesn't have the expected structure
            // This might happen if the API returns a different format
            const normalizedProduct = {
              ...response,
              // Ensure stock/quantity is properly set
              stock: response.stock || response.quantity || 0,
              // Ensure price is a number
              price: typeof response.price === 'string' ? parseFloat(response.price) : response.price,
              // Ensure rating is a number
              rating: response.rating || 0,
              // Ensure seller information is present
              seller: response.seller || { username: 'Unknown Seller' }
            };
            
            // Process images
            processProductImages(normalizedProduct);
            
            setProduct(normalizedProduct);
            setFetchError(null);
          } else {
            throw new Error('Invalid product data received');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          setFetchError('Failed to load product details. Please try again.');
          showUniqueToast('Failed to load product details', 'error');
        } finally {
          setLoading(false);
        }
      } else if (product) {
        // Process images for product from location state
        processProductImages(product);
      }
    };

    fetchProductData();
  }, [id, product]);

  // Process product images
  const processProductImages = (productData) => {
    // Initialize images array
    let images = [];
    
    // Handle case where product has images array
    if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
      images = productData.images;
    } 
    // Handle case where product has a single image
    else if (productData.image) {
      images = [productData.image];
    }
    
    // If we have additional images in a different format (e.g., additionalImages)
    if (productData.additionalImages && Array.isArray(productData.additionalImages)) {
      images = [...images, ...productData.additionalImages];
    }
    
    // Remove duplicates
    images = [...new Set(images)];
    
    // Set the product images
    setProductImages(images);
    console.log('Processed product images:', images);
  };

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  // Increase quantity
  const increaseQuantity = () => {
    // Calculate actual available stock considering what's in cart and what we just added
    const actualAvailableStock = product.stock - currentCartQuantity;
    
    if (quantity < actualAvailableStock) {
      setQuantity(prev => prev + 1);
    } else {
      showUniqueToast(`Sorry, only ${actualAvailableStock} more units available`, 'error');
    }
  };

  // Decrease quantity
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle direct quantity input
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      // Calculate actual available stock considering what's in cart
      const actualAvailableStock = product.stock - currentCartQuantity;
      
      // Ensure quantity is within valid range (1 to actualAvailableStock)
      const newQuantity = Math.max(1, Math.min(value, actualAvailableStock));
      setQuantity(newQuantity);
    }
  };

  // Handle keyboard shortcuts for quantity
  const handleQuantityKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increaseQuantity();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decreaseQuantity();
    }
  };

  // Handle keyboard events for the full image viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showFullImage) {
        if (e.key === 'Escape') {
          setFullImageTransition(false);
          setTimeout(() => {
            setShowFullImage(false);
          }, 300);
        } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
          setCurrentImageIndex(prev => prev - 1);
        } else if (e.key === 'ArrowRight' && currentImageIndex < productImages.length - 1) {
          setCurrentImageIndex(prev => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFullImage, currentImageIndex, productImages.length]);

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
            {productImages.length > 0 ? (
              <div 
                className="w-full h-[500px] cursor-zoom-in"
                onClick={() => {
                  setFullImageTransition(true);
                  setShowFullImage(true);
                }}
              >
                <img 
                  src={imageError ? 'https://via.placeholder.com/500?text=No+Image' : getImageUrl(product, productImages[currentImageIndex])} 
                  alt={product.title} 
                  onError={handleImageError}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
            ) : (
              <div 
                className="w-full h-[500px] cursor-zoom-in"
                onClick={() => {
                  setFullImageTransition(true);
                  setShowFullImage(true);
                }}
              >
                <img 
                  src={imageError ? 'https://via.placeholder.com/500?text=No+Image' : getImageUrl(product, product.image)} 
                  alt={product.title} 
                  onError={handleImageError}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
            )}
            
            {/* Image navigation controls */}
            {productImages.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev - 1);
                  }} 
                  disabled={currentImageIndex === 0}
                  className="text-2xl text-white bg-black bg-opacity-50 p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed z-10"
                >
                  <FiChevronLeft />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev + 1);
                  }} 
                  disabled={currentImageIndex === productImages.length - 1}
                  className="text-2xl text-white bg-black bg-opacity-50 p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed z-10"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
            
            {/* Image thumbnails */}
            {productImages.length > 1 && (
              <div className="absolute -bottom-16 left-0 right-0 flex justify-center space-x-2 overflow-x-auto py-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`
                      w-16 h-16 rounded-md overflow-hidden border-2 
                      ${currentImageIndex === index 
                        ? 'border-indigo-500 shadow-md' 
                        : 'border-gray-200 dark:border-gray-700'
                      }
                      transition-all hover:border-indigo-300
                    `}
                  >
                    <img 
                      src={getImageUrl(product, img)} 
                      alt={`${product.title} - view ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80?text=Image';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
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
              <div className="flex flex-col space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg line-through text-gray-400 dark:text-gray-500">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                
                {/* Stock Status Indicator */}
                <div className="flex items-center space-x-2">
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock === 0
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : product.stock <= 5
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {product.stock === 0 
                      ? 'Out of Stock' 
                      : product.stock <= 5 
                        ? `Only ${product.stock} left!` 
                        : `${product.stock} in stock`}
                  </span>
                  
                  {product.stock > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currentCartQuantity > 0 && `(${currentCartQuantity} in your cart)`}
                    </span>
                  )}
                </div>
              </div>

              {currentCartQuantity > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
                  <p className="text-indigo-700 dark:text-indigo-300">
                    You already have {currentCartQuantity} of this item in your cart
                  </p>
                </div>
              )}

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>

              {/* Quantity Selector */}
              {remainingStock > 0 && (
                <div className="flex items-center space-x-4 my-4">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Quantity:</span>
                  <div className="flex items-center border-2 border-indigo-100 dark:border-indigo-800 rounded-lg overflow-hidden">
                    <button 
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      aria-label="Decrease quantity"
                    >
                      <FaMinus />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock - currentCartQuantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      onKeyDown={handleQuantityKeyDown}
                      className="w-16 px-2 py-2 text-center font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      aria-label="Quantity"
                    />
                    <button 
                      onClick={increaseQuantity}
                      disabled={quantity >= (product.stock - currentCartQuantity)}
                      className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      aria-label="Increase quantity"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {product.stock - currentCartQuantity} available
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={async () => {
                    if (!isAuthenticated || !localStorage.getItem('token')) {
                      // Store the product and intended action in localStorage before redirecting
                      localStorage.setItem('pendingCartAction', JSON.stringify({
                        productId: product.id,
                        action: 'addToCart',
                        product, // Store the whole product to avoid fetching again
                        quantity // Store the selected quantity
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
                      
                      // Check if adding this quantity would exceed stock
                      if (currentCartQuantity + quantity > product.stock) {
                        showUniqueToast(`Cannot add ${quantity} more items. Only ${product.stock - currentCartQuantity} left in stock.`, 'error');
                        setLoading(false);
                        return;
                      }
                      
                      // If product is already in cart, update the quantity instead of adding a new item
                      if (productInCart) {
                        await updateCartItem(productInCart.id, currentCartQuantity + quantity);
                        showUniqueToast(`Added ${quantity} more item${quantity > 1 ? 's' : ''} to cart! (Total: ${currentCartQuantity + quantity})`, 'success');
                      } else {
                        await addToCart(product, quantity);
                        showUniqueToast(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`, 'success');
                      }
                      
                      // Store the last added quantity for reference
                      setLastAddedQuantity(quantity);
                      
                      // Reset quantity to 1 after adding to cart to avoid confusion
                      setQuantity(1);
                      
                      // Don't navigate away, allow the user to continue shopping
                      // Only show a toast notification
                    } catch (error) {
                      console.error('Add to cart error:', error);
                      // Don't show the error if it's handled by the API interceptor
                      if (!error.includes('Please login')) {
                        showUniqueToast(error || 'Failed to add to cart', 'error');
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || remainingStock <= 0}
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
                  ) : remainingStock <= 0 ? (
                    <span>Out of Stock</span>
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
                      showUniqueToast('Please login to add items to wishlist', 'error');
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
                        showUniqueToast('Removed from wishlist!', 'success');
                      } else {
                        await addToWishlist(product.id);
                        showUniqueToast('Added to wishlist!', 'success');
                      }
                    } catch (error) {
                      console.error('Wishlist error:', error);
                      if (!error.includes('Please login')) {
                        showUniqueToast(error || 'Failed to update wishlist', 'error');
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
            <div className="border-t border-indigo-100 dark:border-indigo-900/50 pt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Seller Information</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {product.seller?.username?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {product.seller?.username || 'Unknown Seller'}
                  </p>
                  {product.seller?.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.seller.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showFullImage && (
        <div className={`fixed top-0 left-0 right-0 bottom-0 bg-black flex items-center justify-center z-50 
          ${fullImageTransition ? 'opacity-100' : 'opacity-0'} 
          transition-opacity duration-300 ease-in-out`}
        >
          <button 
            onClick={() => {
              setFullImageTransition(false);
              setTimeout(() => {
                setShowFullImage(false);
              }, 300);
            }} 
            className="absolute top-4 right-4 text-3xl text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all"
            aria-label="Close fullscreen view"
          >
            <FiX />
          </button>
          
          {/* Navigation controls */}
          {productImages.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                disabled={currentImageIndex === 0}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-4xl text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous image"
              >
                <FiChevronLeft />
              </button>
              <button 
                onClick={() => setCurrentImageIndex(prev => Math.min(productImages.length - 1, prev + 1))}
                disabled={currentImageIndex === productImages.length - 1}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-4xl text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next image"
              >
                <FiChevronRight />
              </button>
            </>
          )}
          
          {/* Image counter and keyboard instructions */}
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center">
            {productImages.length > 1 && (
              <div className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-full mb-2">
                {currentImageIndex + 1} / {productImages.length}
              </div>
            )}
            <div className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
              Press <kbd className="px-2 py-0.5 bg-gray-700 rounded">ESC</kbd> to close, 
              {productImages.length > 1 && (
                <> <kbd className="px-2 py-0.5 bg-gray-700 rounded mx-1">←</kbd> <kbd className="px-2 py-0.5 bg-gray-700 rounded mx-1">→</kbd> to navigate</>
              )}
            </div>
          </div>
          
          <img 
            src={imageError ? 'https://via.placeholder.com/800?text=No+Image' : getImageUrl(product, productImages.length > 0 ? productImages[currentImageIndex] : product.image)} 
            alt={product.title} 
            onError={handleImageError}
            className={`max-w-[90vw] max-h-[90vh] object-contain transform transition-transform duration-300 ${fullImageTransition ? 'scale-100' : 'scale-95'}`}
          />
        </div>
      )}
    </div>
  );
}

export default ProductDetail;