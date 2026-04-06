/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Outfit', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
      },
      colors: {
        forest: {
          50:'#f0faf4', 100:'#d8f3dc', 200:'#b7e4c7',
          300:'#74c69d', 400:'#52b788', 500:'#2d6a4f',
          600:'#1b4332', 700:'#143829', 800:'#0d2b20',
        },
        cream: '#fefae0',
        lime:  { 100:'#d8f3dc', 200:'#b7e4c7', 300:'#a8e063', 400:'#8bc34a' },
      },
      boxShadow: {
        card:  '0 2px 12px rgba(0,0,0,.06)',
        panel: '0 4px 24px rgba(0,0,0,.08)',
      },
    },
  },
  plugins: [],
}
