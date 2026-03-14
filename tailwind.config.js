/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      colors: {
        green: {
          dark: '#1a5c2a',
          mid: '#2d7a3a',
          light: '#4caf65',
          pale: '#e8f5ec',
        },
        gold: {
          DEFAULT: '#c8900a',
          light: '#f5c842',
          pale: '#fff8e1',
        },
      },
    },
  },
  plugins: [],
}
