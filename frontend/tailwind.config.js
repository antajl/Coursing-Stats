/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'old-money': {
          50: '#f8f6f3',
          100: '#f0ebe3',
          200: '#e6dfd4',
          300: '#d9d0c3',
          400: '#c9bfb0',
          500: '#b8ada0',
          600: '#a69a8d',
          700: '#8a7f75',
          800: '#6e645c',
          900: '#524a45',
          950: '#3a3531',
        },
        'gold': {
          400: '#c9a227',
          500: '#b8860b',
          600: '#9a7200',
          700: '#7a5a00',
        },
        'navy': {
          50: '#f0f4f8',
          100: '#e1e8f0',
          200: '#c9d6e3',
          300: '#aec1d4',
          400: '#8fa8c2',
          500: '#7a9ab0',
          600: '#5a7a8f',
          700: '#4a6a7f',
          800: '#3a5a6f',
          900: '#2a4a5f',
          950: '#1a3a4f',
        },
        'forest': {
          50: '#f0f5f0',
          100: '#e0ebe0',
          200: '#c9dbc9',
          300: '#aecbae',
          400: '#8fb88f',
          500: '#7aa87a',
          600: '#5a8a5a',
          700: '#4a7a4a',
          800: '#3a6a3a',
          900: '#2a5a2a',
          950: '#1a4a1a',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
