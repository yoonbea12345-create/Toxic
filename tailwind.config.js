/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:           '#0D0D0D',
        'card-bg':    '#161616',
        border:       '#222222',
        'accent-red': '#FF2D55',
        'accent-purple': '#BF5AF2',
        'text-secondary': '#888888',
      },
      fontFamily: {
        display: ['"Black Han Sans"', 'sans-serif'],
        serif:   ['"Noto Serif KR"', 'serif'],
        sans:    ['"Noto Sans KR"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
