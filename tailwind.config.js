/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          dark: '#031e14',   // Fond ultra sombre forestier
          deep: '#062c1d',   // Vert forêt principal
          accent: '#0f5135', // Vert de surbrillance
        },
        luxury: {
          slate: '#0f172a',  // Ardoise chic
          gold: '#d9a74a',   // Or pour l'identité "Aigle Royal"
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}