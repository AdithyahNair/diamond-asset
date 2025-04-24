/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3BA7DB',
        'primary-dark': '#2980B9',
        secondary: '#13111C',
        accent: '#3BA7DB',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'pulse-glow 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(59, 167, 219, 0.5)',
      },
    },
  },
  plugins: [],
};