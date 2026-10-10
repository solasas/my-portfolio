/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#faf8f5',
          accent: '#8b6f47',
          text: '#3a2e22',
          muted: '#5c4a35',
          border: '#e8e0d5',
          light: '#f0e8de',
          faded: '#8b7b68',
          dark: '#2a1f13',
          soft: '#c4a882',
          card: '#f5f0e8',
        },
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
