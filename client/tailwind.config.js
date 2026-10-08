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
          lightBg: '#FFFAF3',
          lightSurface: '#FFF2DB',
          lightBorder: '#FFE5BF',
          lightAccent: '#F62440',
          darkBg: '#131313',
          darkSurface: '#262625',
          darkBorder: '#4B4A48',
          darkAccent: '#EFD395',
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
