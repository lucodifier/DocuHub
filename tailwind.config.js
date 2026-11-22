/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1d23',
          card: '#252931',
          hover: '#2d3139',
          border: '#3a3f4b',
          text: '#e4e6eb',
          muted: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
}

