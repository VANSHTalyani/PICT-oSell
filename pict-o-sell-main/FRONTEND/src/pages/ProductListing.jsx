import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter, FiSearch, FiX, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { FaShoppingCart, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function ProductListing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([
    'Electronics',
    'Academics',
    'Hostel & Lifestyle',
    'Fashion',
    'Gaming',
    'Project & DIY',
    'Bicycles & Vehicles',
    'Miscellaneous'
  ]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = 'http://localhost:3000/products';
        const response = await axios.get(url);
        if (response.data.products) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else {
      // newest first (default)
      return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
    }
  });

  // View product details
  const viewProductDetails = (product) => {
    navigate(`/products/${product.id}`, { state: { product } });
  };

  // Add to cart
  const handleAddToCart = async (product, event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await addToCart(product);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Add to wishlist
  const handleAddToWishlist = (product, event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    // TODO: Implement wishlist functionality
    toast.success('Added to wishlist!');
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('newest');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header Section with Enhanced Styling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">All Products</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Browse all available items from our community</p>
      
        {/* Search and Filters with Refined Styling */}
        <div className="mt-6">
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-indigo-100 dark:border-gray-700 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 dark:text-indigo-300 w-5 h-5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  showFilters
                    ? 'border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300'
                    : 'border-indigo-100 text-indigo-400 hover:border-indigo-200 dark:border-gray-700 dark:text-indigo-300 dark:hover:border-gray-600'
                }`}
                aria-label="Toggle filters"
              >
                <FiFilter className="w-5 h-5" />
              </button>
            </div>

            {/* Search Status with Refined Styling */}
            {(searchQuery || selectedCategory !== 'All' || sortBy !== 'newest') && (
              <div className="absolute left-0 right-0 -bottom-6 flex items-center justify-between text-sm">
                <div className="text-gray-500 dark:text-gray-400">
                  <span>
                    Found {sortedProducts.length} result{sortedProducts.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Filters with Enhanced Styling */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 mt-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-indigo-100 dark:border-gray-700 animate-fadeIn shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-indigo-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
                >
                  <option value="All">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-indigo-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
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
      </div>

      {/* Products Grid with Enhanced Styling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No products found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-md"
            >
              Clear filters and try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="product-card bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl p-4 relative group animate-scaleIn cursor-pointer transition-all duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                onClick={() => viewProductDetails(product)}
              >
                {/* Product Image with Enhanced Overlay */}
                <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <img
                    src={'http://localhost:3000/' + product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transform transition-transform group-hover:scale-110 duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge with Enhanced Styling */}
                  <div className="absolute top-6 left-6">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  
                  {/* Quick Actions with Enhanced Positioning */}
                  <div className="absolute top-6 right-6 flex flex-col gap-2 transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="p-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors dark:bg-indigo-700 dark:hover:bg-indigo-800"
                      title="Add to Cart"
                      aria-label="Add to Cart"
                    >
                      <FaShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAddToWishlist(product, e)}
                      className="p-2 bg-pink-600 text-white rounded-lg shadow-md hover:bg-pink-700 transition-colors dark:bg-pink-700 dark:hover:bg-pink-800"
                      title="Add to Wishlist"
                      aria-label="Add to Wishlist"
                    >
                      <FiHeart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Product Info with Enhanced Typography */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 text-lg">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    {product.rating && (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-yellow-500 dark:text-yellow-400">{product.rating}</span>
                        <span className="text-yellow-500 dark:text-yellow-400 ml-1">★</span>
                      </div>
                    )}
                    {product.seller && (
                      <>
                        <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <FaMapMarkerAlt className="w-3 h-3" />
                          <span>{product.seller.username || 'Unknown seller'}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
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

export default ProductListing;