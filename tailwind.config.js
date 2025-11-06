// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'accent-teal': '#00A389',
          'surface-card': '#1D1D1D',
          'surface-secondary': '#2A2A2A',
          'bg-primary': '#111111',
          'text-primary': '#EEEEEE',
          'accent-red': '#EF4444', // Equivalent to Tailwind's red-500/600
          'accent-green': '#10B981', // Equivalent to Tailwind's green-500/600
        },
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }