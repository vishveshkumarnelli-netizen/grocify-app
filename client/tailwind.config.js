/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Outfit', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      colors: {
        forest: {
          50:  '#f0faf4',
          100: '#d8f3dc',
          200: '#b7e4c7',
          300: '#74c69d',
          400: '#52b788',
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#143829',
          800: '#0d2b20',
          900: '#081e17',
        },
        lime: {
          50:  '#f7fce8',
          100: '#eef9d2',
          200: '#d8f3a0',
          300: '#b7e063',
          400: '#a8e063',
          500: '#8bc34a',
        },
        cream: '#fefae0',
      },
      animation: {
        'float':     'float 3s ease-in-out infinite',
        'slide-in':  'slideIn .3s cubic-bezier(.4,0,.2,1)',
        'fade-in':   'fadeIn .4s ease-out',
        'pop':       'pop .4s ease-out',
        'pulse-dot': 'pulseDot 1.5s infinite',
      },
      keyframes: {
        float:    { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-10px)' } },
        slideIn:  { from: { transform:'translateX(100%)' }, to: { transform:'translateX(0)' } },
        fadeIn:   { from: { opacity:0, transform:'translateY(10px)' }, to: { opacity:1, transform:'translateY(0)' } },
        pop:      { '0%': { transform:'scale(0)' }, '80%': { transform:'scale(1.1)' }, '100%': { transform:'scale(1)' } },
        pulseDot: { '0%,100%': { opacity:1 }, '50%': { opacity:.4 } },
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,.07)',
        hover:'0 12px 32px rgba(0,0,0,.10)',
      },
    },
  },
  plugins: [],
}
