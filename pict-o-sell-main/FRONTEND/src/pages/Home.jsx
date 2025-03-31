import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiFilter, FiHeart, FiPlusCircle } from 'react-icons/fi';
import { FaShoppingCart, FaMapMarkerAlt } from 'react-icons/fa';
import { ProductSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';
import { API_URL } from '../config/constants';
import * as api from '../services/api';
import toast from 'react-hot-toast';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, addToCart: addToCartContext, updateCartQuantity } = useCart();
  const { addToWishlist: addToWishlistContext, removeFromWishlist, isInWishlist } = useWishlist();
  
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState({
    products: true,
    categories: true
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(prev => ({ ...prev, products: true }));
        const params = {};
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (selectedCategory !== 'All Categories') {
          params.category = selectedCategory;
        }
        if (sortBy) {
          params.sort = sortBy;
        }

        const response = await api.getProducts(params);
        setProducts(response.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy]);

  // Set predefined categories
  useEffect(() => {
    const predefinedCategories = [
      'Electronics',
      'Academics',
      'Hostel & Lifestyle',
      'Fashion',
      'Gaming',
      'Project & DIY',
      'Bicycles & Vehicles',
      'Miscellaneous'
    ];
    setCategories(predefinedCategories);
  }, []);

  // Add to cart
  const addToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      // Check if product is already in cart
      const productInCart = cartItems.find(item => item.product.id === product.id);
      const currentCartQuantity = productInCart ? productInCart.quantity : 0;
      
      // Check if there's still stock available
      if (currentCartQuantity >= product.stock) {
        toast.error(`Sorry, no more units available for this product`);
        return;
      }
      
      // Add 1 unit to cart (quick add from home page)
      if (productInCart) {
        await updateCartQuantity(productInCart.id, currentCartQuantity + 1);
        toast.success(`Added 1 more item to cart! (Total: ${currentCartQuantity + 1})`);
      } else {
        await addToCartContext(product);
        toast.success('Added to cart!');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSortBy('newest');
    setShowFilters(false);
  };

  // Add to wishlist - using the context implementation instead

  // View product details
  const viewProductDetails = (product) => {
    navigate(`/products/${product.id}`, { state: { product } });
  };

  // Navigate to sell new item page
  const navigateToSellItem = () => {
    if (!isAuthenticated) {
      toast.error('Please login to sell items');
      navigate('/login');
      return;
    }
    navigate('/post-ad');
  };

  // Format price
  const formatPrice = (price) => (
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price)
  );

  return (
    <div className="bg-gray-50">
      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="relative">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-indigo-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`ml-4 p-3 rounded-lg border-2 transition-all ${
                showFilters
                  ? 'border-indigo-500 text-indigo-500 bg-indigo-50'
                  : 'border-indigo-100 text-indigo-400 hover:border-indigo-200'
              }`}
            >
              <FiFilter className="w-5 h-5" />
            </button>
          </div>

          {/* Search Status */}
          {(isSearching || searchQuery || selectedCategory !== 'All Categories' || sortBy !== 'newest') && (
            <div className="absolute left-0 right-0 -bottom-6 flex items-center justify-between text-sm">
              <div className="text-gray-500">
                {isSearching ? (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping mr-2"></span>
                    Searching...
                  </span>
                ) : (
                  <span>
                    Found {products.length} result{products.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {(searchQuery || selectedCategory !== 'All Categories' || sortBy !== 'newest') && (
                <button
                  onClick={clearFilters}
                  className="text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border-2 border-indigo-100 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-indigo-100 bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-indigo-100 bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Discover unique items from fellow students</p>
          </div>
          <button
            onClick={navigateToSellItem}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            <FiPlusCircle className="w-5 h-5" />
            <span className="font-medium">Sell New Item</span>
          </button>
        </div>
        
        {loading.products ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No products found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
            >
              Clear filters and try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="product-card bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl p-4 relative group animate-scaleIn cursor-pointer transition-all duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                onClick={() => viewProductDetails(product)}
              >
                {/* Product Image */}
                <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transform transition-transform group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Category Badge */}
                <div className="absolute top-6 left-6">
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full">
                    {product.category}
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="p-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors dark:bg-indigo-700 dark:hover:bg-indigo-800"
                    title="Add to Cart"
                    aria-label="Add to Cart"
                  >
                    <FaShoppingCart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isInWishlist(product.id)) {
                        removeFromWishlist(product.id);
                      } else {
                        addToWishlistContext(product);
                      }
                    }}
                    className={`p-2 ${isInWishlist(product.id) ? 'bg-pink-700' : 'bg-pink-600'} text-white rounded-lg shadow-md hover:bg-pink-700 transition-colors dark:bg-pink-700 dark:hover:bg-pink-800`}
                    title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    aria-label={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <FiHeart className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 text-lg">
                      {product.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-yellow-500 dark:text-yellow-400">{product.rating}</span>
                      <span className="text-yellow-500 dark:text-yellow-400 ml-1">★</span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FaMapMarkerAlt className="w-3 h-3" />
                      <span>{product.seller.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.stock <= 5 && (
                        <span className="text-xs font-medium text-red-500 dark:text-red-400 animate-pulse">
                          Only {product.stock} left!
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewProductDetails(product);
                      }}
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;