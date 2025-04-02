import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaHeart, FaTag, FaBoxOpen } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { API_URL } from '../config/constants';

function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Function to get the correct image URL
  const getImageUrl = (item) => {
    if (!item.image) return 'https://via.placeholder.com/150?text=No+Image';
    
    if (item.image.startsWith('http')) {
      return item.image;
    } else {
      return `http://localhost:5000${item.image.startsWith('/') ? '' : '/'}${item.image}`;
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <FaHeart className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Your wishlist is empty</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Items you add to your wishlist will appear here.</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">My Wishlist ({wishlist.length})</h1>
        <button
          onClick={clearWishlist}
          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          Clear Wishlist
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {wishlist.map((item) => (
            <li key={item.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="flex-shrink-0 h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                  <img
                    src={getImageUrl(item)}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <Link to={`/products/${item.id}`} className="text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                      {item.title}
                    </Link>
                    <div className="mt-2 sm:mt-0">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{formatPrice(item.price)}</p>
                      {/* Stock status indicator */}
                      {(item.stock || item.quantity) > 0 ? (
                        <span className={`text-xs font-medium ${(item.stock || item.quantity) <= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                          {(item.stock || item.quantity) <= 5 ? `Only ${item.stock || item.quantity} left!` : `${item.stock || item.quantity} in stock`}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    {item.category && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <FaTag className="inline-block mr-1" />
                        <span>{item.category}</span>
                      </div>
                    )}
                    {item.seller && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>Seller: {item.seller.name || item.seller.username || 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="flex items-center text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <FaTrash className="mr-2" />
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        addToCart(item);
                        removeFromWishlist(item.id);
                      }}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                      disabled={(item.stock || item.quantity) <= 0}
                    >
                      <FaShoppingCart className="mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Wishlist;
