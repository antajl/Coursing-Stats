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
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
