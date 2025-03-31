import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if dark mode is stored in localStorage or use system preference
  const getInitialTheme = () => {
    // First check if we have a saved preference
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    }
    
    // Then check for system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Default to light mode
    return false;
  };

  const [darkMode, setDarkMode] = useState(getInitialTheme);
  const [themeLoaded, setThemeLoaded] = useState(false);

  // Initialize theme on first render to prevent flash of wrong theme
  useEffect(() => {
    setThemeLoaded(true);
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        // Only update if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
          setDarkMode(e.matches);
        }
      };
      
      // Add listener for theme changes
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
      
      // Cleanup
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          // Fallback for older browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, []);

  // Apply theme changes to document and localStorage - simplified approach
  useEffect(() => {
    if (darkMode) {
      // Apply dark mode
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#f8fafc';
      localStorage.setItem('theme', 'dark');
      
      // Apply dark mode to app root for better specificity
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.classList.add('dark-mode');
      }
      
      console.log('Dark mode applied');
    } else {
      // Remove dark mode
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      localStorage.setItem('theme', 'light');
      
      // Remove dark mode from app root
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.classList.remove('dark-mode');
      }
      
      console.log('Light mode applied');
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
