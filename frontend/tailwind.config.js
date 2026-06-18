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
    },
  },
  plugins: [],
};
