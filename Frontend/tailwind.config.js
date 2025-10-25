/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#fdc106',
        'primary-dark': '#e6ad05',
      },
    },
  },
  plugins: [],
};