/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
      },
      colors: {
        primary: '#F59E0B',
        success: '#58CC02',
        'success-shadow': '#58A700',
        danger: '#FF4B4B',
        'danger-shadow': '#EA2B2B',
        action: '#1CB0F6',
        'action-shadow': '#1899D6',
      }
    },
  },
  plugins: [],
}
