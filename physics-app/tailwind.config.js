/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'Nunito', 'sans-serif'],
      },
      colors: {
        primary: '#F59E0B',
        'primary-light': '#FBBF24',
        'primary-dark': '#D97706',
        success: '#58CC02',
        'success-shadow': '#58A700',
        danger: '#FF4B4B',
        'danger-shadow': '#EA2B2B',
        action: '#1CB0F6',
        'action-shadow': '#1899D6',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0,0,0,0.05)',
        'medium': '0 10px 30px -5px rgba(0,0,0,0.1)',
        'chunky': '0 4px 0 0 rgba(0,0,0,0.15)',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
