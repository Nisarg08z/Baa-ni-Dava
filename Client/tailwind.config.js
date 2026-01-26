/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#166534', // Green from "Dava" and cross
        secondary: '#431407', // Dark Brown from "Baa ni"
        accent: '#ea580c', // Orange from swoosh/heart
        'brand-blue': '#bae6fd', // Light blue from sari
      }
    },
  },
  plugins: [],
}