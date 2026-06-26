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
          50: '#faf7f2',
          100: '#f5efe6',
          200: '#ebe4d6',
          300: '#e0d9c6',
          400: '#d5ceb5',
          500: '#c4b8a0',
          600: '#b3a68b',
          700: '#8c7f6a',
          800: '#6b5e4f',
          900: '#4a3f35',
          950: '#2d2620',
        },
        'gold': {
          400: '#d4a853',
          500: '#c49a3c',
          600: '#a67c2e',
        },
        'steel': {
          50: '#f0f4f8',
          100: '#e1e8f0',
          200: '#c9d6e3',
          300: '#aec1d4',
          400: '#8fa8c2',
          500: '#7a9ab0',
          600: '#63849a',
          700: '#4d6a80',
          800: '#3d5466',
          900: '#2f414d',
          950: '#1e2a33',
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
