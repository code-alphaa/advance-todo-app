/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        palette: {
          // Light: Pearl Oyster, Tawny Tan, Aged Gouda, Tree Sap, Plane Brown, Pot Black
          lightBg: '#DDD5CC',
          lightSurface: '#CDB398',
          lightBorder: '#D99847',
          lightAccent: '#D07915',
          // Dark: Background #0D0D0D, Accent 1 #00FF85, Accent 2 #1E90FF, Hover #FF0099
          darkBg: '#0D0D0D',
          darkSurface: '#161616',
          darkBorder: '#262626',
          darkAccent: '#00FF85',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'sans-serif'],
      },
      boxShadow: {
        'jira': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'jira-hover': '0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
        'jira-lift': '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
