/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Poppins"', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FBF7EF',
          100: '#F5EBD8',
          200: '#EFE1C4',
        },
        honey: {
          400: '#E7A93C',
          500: '#C89B3C',
          600: '#A97F2B',
        },
        leaf: {
          500: '#5C7360',
          600: '#4B5E4E',
          700: '#39473C',
        },
        blush: {
          300: '#F1C4C0',
          400: '#E8A6A0',
          500: '#D98680',
        },
      },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(75, 94, 78, 0.25)',
      },
    },
  },
  plugins: [],
};
