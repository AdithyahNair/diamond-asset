/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#1a2332",
          800: "#243044",
          700: "#2d3d56",
          600: "#374a69",
        },
        gold: {
          500: "#b69659",
          400: "#c9a96e",
          300: "#d4b785",
          200: "#e0c69c",
        },
        primary: "#3BA7DB",
        "primary-dark": "#2980B9",
        secondary: "#13111C",
        accent: "#3BA7DB",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
        float: "float 6s ease-in-out infinite",
        glow: "pulse-glow 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      boxShadow: {
        glow: "0 0 15px rgba(59, 167, 219, 0.5)",
      },
    },
  },
  plugins: [],
};
