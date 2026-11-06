/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#070709',
          card: '#0c0c10',
          modal: '#121216',
          field: '#181820',
        }
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.25)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.35)',
        'glow-amber': '0 0 12px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
