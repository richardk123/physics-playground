const withMT = require("@material-tailwind/react/utils/withMT");

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep space background
        physics: {
          bg: "#0f172a", // Slate 900
          surface: "#1e293b", // Slate 800
          primary: "#06b6d4", // Cyan 500
          secondary: "#8b5cf6", // Violet 500
          accent: "#f43f5e", // Rose 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
})