/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f3eee3',
        ink: '#14110f',
        amber: '#ffb62e',
        moss: '#2f6b4f',
        coral: '#ff6b4a',
        sky: '#9ad1d4',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        brut: '6px 6px 0 0 #14110f',
        'brut-sm': '3px 3px 0 0 #14110f',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: { marquee: 'marquee 28s linear infinite' },
    },
  },
  plugins: [],
};
