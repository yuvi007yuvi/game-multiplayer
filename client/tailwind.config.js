/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          light: '#134e38',
          DEFAULT: '#0d3829',
          dark: '#082218',
          border: '#1b5941'
        },
        casino: {
          charcoal: '#0b0f14',
          surface: '#141c24',
          elevated: '#1e2936',
          border: '#2a3749'
        },
        gold: {
          light: '#fef08a',
          DEFAULT: '#eab308',
          metallic: '#d4af37',
          dark: '#ca8a04'
        },
        ivory: {
          DEFAULT: '#faf8f5',
          dark: '#f0ece1',
          shadow: '#e3dcce'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'Merriweather', 'serif']
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.35)',
        'card-hover': '0 12px 28px rgba(0, 0, 0, 0.5), 0 0 16px rgba(234, 179, 8, 0.4)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.4)',
        'table': 'inset 0 0 80px rgba(0, 0, 0, 0.8), 0 10px 40px rgba(0, 0, 0, 0.7)'
      }
    },
  },
  plugins: [],
}
