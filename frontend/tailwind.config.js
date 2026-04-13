/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['Chivo', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#0055FF', hover: '#0043CC' },
        warning: '#FFB020',
        success: '#00C48C',
        critical: '#FF3B30',
        surface: { light: '#FFFFFF', dark: '#141414' },
        bg: { light: '#F9FAFB', dark: '#0A0A0A' },
      },
    },
  },
  plugins: [],
};
