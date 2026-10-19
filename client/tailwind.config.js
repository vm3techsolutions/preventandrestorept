/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#007791', hover: '#0094B2', 50: '#E6F4F7', 100: '#CCE9EF' },
        navy: { DEFAULT: '#001D39', 2: '#002B54', 3: '#0A3A66' },
      },
      fontFamily: {
        heading: ['"Blair ITC Std"', 'Montserrat', 'ui-sans-serif', 'sans-serif'],
        body: ['"Futura PT"', 'Jost', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: { xs: '0 1px 2px 0 rgb(0 29 57 / 0.05)' },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: { rise: 'rise .35s ease-out both' },
    },
  },
  plugins: [],
};
