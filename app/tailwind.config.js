/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#e8d08a',
          400: '#d4b96a',
          500: '#c9a84c',
          600: '#b8922e',
          700: '#9a7820',
        },
        surface: {
          900: '#0f0a05',
          800: '#1a1008',
          700: '#251810',
          600: '#352415',
          500: '#4a3420',
        },
        saffron: {
          400: '#e8790a',
          600: '#c8600a',
          700: '#a04d08',
        },
        cream: '#f0e6d3',
        muted: '#8a7560',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Gentium Plus', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
