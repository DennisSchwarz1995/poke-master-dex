/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      keyframes: {
        marquee: {
          '0%': { transform: 'translate(0)' },
          '100%': { transform: 'translate(-100%)' },
        },
        'marquee-copy': {
          '0%': { transform: 'translate(100%)' },
          '100%': { transform: 'translate(0)' },
        },
        'marquee-rev': {
          '0%': { transform: 'translate(-100%)' },
          '100%': { transform: 'translate(0)' },
        },
        'marquee-rev-copy': {
          '0%': { transform: 'translate(0)' },
          '100%': { transform: 'translate(100%)' },
        },
      },
      animation: {
        marquee: 'marquee 90s linear infinite',
        'marquee-copy': 'marquee-copy 90s linear infinite',
        'marquee-rev': 'marquee-rev 90s linear infinite',
        'marquee-rev-copy': 'marquee-rev-copy 90s linear infinite',
      },
    },
  },
  plugins: [],
};
