/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fbf8f1',
          100: '#f5ece1',
          200: '#ead8c7',
          300: '#dfb9aa',
          400: '#d78f86',
          500: '#bd5357',
          600: '#a8343d',
          700: '#82252d',
          800: '#5f1d24',
          900: '#2b1715',
        },
        blush: {
          50: '#fff8f5',
          100: '#fdebe7',
          200: '#f7d9d6',
          300: '#efb9b2',
        },
        gold: {
          100: '#f3ead5',
          500: '#b8934f',
          700: '#7a5c27',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(95, 29, 36, 0.12)',
        input: '0 12px 28px rgba(43, 23, 21, 0.08)',
        button: '0 16px 28px rgba(168, 52, 61, 0.28)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'shadow-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.78)', opacity: '0.48' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'shadow-pulse': 'shadow-pulse 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
