/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0ff',
          100: '#e0e1ff',
          200: '#c7c8fe',
          300: '#a4a3fc',
          400: '#8481f8',
          500: '#6c63f1',
          600: '#5e44e6',
          700: '#5136cb',
          800: '#422ea4',
          900: '#382b82',
          950: '#221a4c',
        },
        accent: {
          50: '#eefbf4',
          100: '#d6f5e3',
          200: '#b0eacb',
          300: '#7cd9ad',
          400: '#46c18a',
          500: '#24a670',
          600: '#17865a',
          700: '#136b4a',
          800: '#12553c',
          900: '#104633',
          950: '#08271d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shine: {
          '100%': { left: '125%' },
        },
        'gradient-x': {
          '0%, 100%': {
              'background-size': '200% 200%',
              'background-position': 'left center'
          },
          '50%': {
              'background-size': '200% 200%',
              'background-position': 'right center'
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        'fadeInUp-delayed-1': 'fadeInUp 0.6s ease-out 0.2s forwards',
        'fadeInUp-delayed-2': 'fadeInUp 0.6s ease-out 0.4s forwards',
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
        shine: 'shine 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
