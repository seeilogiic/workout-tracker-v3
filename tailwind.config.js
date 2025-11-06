/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark minimalist theme - black, white, grey only
        dark: {
          bg: '#000000',
          surface: '#1a1a1a',
          border: '#333333',
        },
        light: {
          text: '#ffffff',
          muted: '#cccccc',
          subtle: '#999999',
        }
      }
    },
  },
  plugins: [],
}

