/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pernod Ricard Brand Colors
        'pr-blue-light': '#79ACD2',
        'pr-blue-dark': '#002957',
        'pr-blue-medium': '#123F75',
        'pr-white': '#ffffff',
        'pr-black': '#000000',
        
        // Application specific colors using brand palette
        'chat-bg': '#f8fafb',
        'chat-dark': '#002957',
        'chat-input': '#123F75',
        'chat-border': '#79ACD2',
        'sidebar-bg': '#f8fafb',
        'thinking-bg': '#f0f6fc',
        'accent-primary': '#79ACD2',
        'accent-secondary': '#123F75',
        'text-primary': '#002957',
        'text-secondary': '#123F75',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
} 