/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gta-green': '#00B034',
        'gta-blue': '#0072B1',
        'gta-yellow': '#FABD02',
        'gta-orange': '#F58519',
        'gta-purple': '#9349AD',
        'gta-red': '#ED1A22',
      },
      fontFamily: {
        'pricedown': ['Pricedown', 'Impact', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
