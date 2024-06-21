// /** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // 'node_modules/flowbite-react/**/*.js' // memperbaiki jalur konten
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A1F2B",
        bg: "#FFFEFB",
        footer: "#57BA280D",
        accent: {
          1: "#F21B1B",
          2: "#57BA28",
        },
      },
      fontFamily: {
        Outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
};
