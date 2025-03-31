import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist ({wishlist.length})</h1>
        <button
          onClick={clearWishlist}
          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
        >
          Clear Wishlist
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {wishlist.map((item) => (
            <li key={item.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="flex-shrink-0 h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/150'}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                  <div className="flex justify-between">
                    <Link to={`/products/${item.id}`} className="text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                      {item.title}
                    </Link>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{formatPrice(item.price)}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
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
