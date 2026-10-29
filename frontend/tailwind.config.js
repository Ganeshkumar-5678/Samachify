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
          DEFAULT: '#123D30',
          dark: '#0B251D',
          light: '#1B5443',
          muted: '#266A55'
        },
        cream: {
          DEFAULT: '#F5E9D6',
          light: '#FBF6EE',
          surface: '#FAF4EA',
          border: '#E8D8BF',
        },
        spice: {
          DEFAULT: '#E88A43',
          hover: '#D6762F',
          light: '#FDF1E8'
        },
        sage: {
          DEFAULT: '#DCE9DC',
          dark: '#A9C6A9',
          light: '#EDF5ED'
        },
        deep: {
          DEFAULT: '#173A31',
          muted: '#4A6B63',
          subtle: '#6B8780'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Manrope', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(18, 61, 48, 0.06), 0 2px 6px -1px rgba(18, 61, 48, 0.04)',
        'card': '0 10px 30px -4px rgba(18, 61, 48, 0.08), 0 4px 10px -2px rgba(18, 61, 48, 0.04)',
        'pill': '0 2px 10px rgba(18, 61, 48, 0.06)',
      }
    },
  },
  plugins: [],
}
