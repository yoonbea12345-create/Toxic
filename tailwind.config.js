/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        'card-bg': '#1C1C1E',
        border: '#2C2C2E',
        'accent-red': '#FF2D55',
        'accent-purple': '#BF5AF2',
        'text-secondary': '#8E8E93',
      },
      fontFamily: {
        serif: ['"Noto Serif KR"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
