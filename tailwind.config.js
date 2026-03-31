/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'paymo-blue': '#0A2FA3',
        'paymo-sky': '#58C8FA',
        'paymo-dark': '#071d6b',
        'paymo-light': '#e8f4fd',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
