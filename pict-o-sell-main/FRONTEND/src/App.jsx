import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './styles/darkMode.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import PostAd from './pages/PostAd';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';
import AuthCallback from './pages/AuthCallback';
import GoogleCallback from './pages/GoogleCallback';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Toaster 
                    position="top-center" 
                    toastOptions={{
                      className: '',
                      style: {
                        background: '#fff',
                        color: '#333',
                      },
                      // Dark mode toast styles
                      dark: {
                        style: {
                          background: '#1e293b',
                          color: '#f8fafc',
                        },
                      },
                      // Prevent duplicate toasts
                      id: (t) => t.message,
                      // Increase duration to prevent overlapping toasts
                      duration: 3000,
                    }} 
                  />
                
                  <main className="flex-1">
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/login/google/callback" element={<GoogleCallback />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/products" element={<ProductListing />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/post-ad" element={<PostAd />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                    </Routes>
                  </main>

                  {/* Footer */}
                  <footer className="bg-[#16161F] dark:bg-[#0D0D15] text-white transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div>
                          <h3 className="text-2xl font-bold mb-4 text-purple-500 dark:text-purple-400">
                            Pict'o sell
                          </h3>
                          <p className="mb-4 text-gray-300">
                            Your trusted marketplace for buying and selling within the college community.
                          </p>
                          <div className="flex space-x-4">
                            {[
                              { icon: FaFacebook, url: 'https://facebook.com/pictosell' },
                              { icon: FaTwitter, url: 'https://twitter.com/pictosell' },
                              { icon: FaInstagram, url: 'https://instagram.com/pictosell' },
                              { icon: FaLinkedin, url: 'https://linkedin.com/company/pictosell' }
                            ].map(({ icon: Icon, url }, index) => (
                              <a 
                                key={index} 
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-colors duration-300 text-white hover:text-purple-500"
                              >
                                <Icon size={24} />
                              </a>
                            ))}
                          </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                          <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
                          <ul className="space-y-2">
                            {[
                              { text: 'About Us', path: '/about' },
                              { text: 'FAQs', path: '/faqs' },
                              { text: 'Contact Us', path: '/contact' }
                            ].map(({ text, path }, index) => (
                              <li key={index}>
                                <Link 
                                  to={path}
                                  className="transition-colors duration-300 text-gray-300 hover:text-purple-500"
                                >
                                  {text}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Legal */}
                        <div>
                          <h4 className="font-semibold mb-4 text-lg">Legal</h4>
                          <ul className="space-y-2">
                            {[
                              { text: 'Terms of Service', path: '/terms' },
                              { text: 'Privacy Policy', path: '/privacy' },
                              { text: 'Return Policy', path: '/returns' },
                              { text: 'Cookie Policy', path: '/cookies' }
                            ].map(({ text, path }, index) => (
                              <li key={index}>
                                <Link 
                                  to={path}
                                  className="transition-colors duration-300 text-gray-300 hover:text-purple-500"
                                >
                                  {text}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Contact Us */}
                        <div>
                          <h4 className="font-semibold mb-4 text-lg">Contact Us</h4>
                          <ul className="space-y-2">
                            {[
                              { icon: FaEnvelope, text: 'support@pictosell.com' },
                              { icon: FaPhone, text: '+1 (123) 456-7890' },
                              { icon: FaMapMarkerAlt, text: 'Pune, Maharashtra, India' }
                            ].map(({ icon: Icon, text }, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <Icon className="text-purple-500" />
                                <span className="text-gray-300">{text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
                        <p> {new Date().getFullYear()} Pict'o sell. All rights reserved.</p>
                      </div>
                    </div>
                  </footer>
                </div>
              </Router>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;