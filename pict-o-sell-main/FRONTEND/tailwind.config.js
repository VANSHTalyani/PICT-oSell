/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // This is the primary-500 color referenced in index.css
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      backgroundColor: {
        'dark-primary': '#0f172a',
        'dark-secondary': '#1e293b',
        'dark-tertiary': '#334155',
      },
      textColor: {
        'dark-primary': '#f8fafc',
        'dark-secondary': '#cbd5e1',
        'dark-muted': '#94a3b8',
      },
      borderColor: {
        'dark-border': '#334155',
        'dark-border-light': '#1e293b',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
