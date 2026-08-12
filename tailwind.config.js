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
        limby: {
          neon: "#9CFF00",
          "neon-hover": "#8BE600",
          "neon-glow": "rgba(156, 255, 0, 0.25)",
          bg: "#0A0A0A",
          darker: "#050505",
          card: "#161616",
          panel: "#1F1F1F",
          border: "#2A2A2A",
          muted: "#64748B",
          text: "#E5E7EB"
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Cairo', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(156, 255, 0, 0.3)',
        'neon-strong': '0 0 35px rgba(156, 255, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
