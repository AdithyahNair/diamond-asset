export const colors = {
  // Primary Colors
  navy: {
    900: "#1a2332", // Primary deep navy
    800: "#243044",
    700: "#2d3d56",
    600: "#374a69",
  },
  gold: {
    400: "#c9a96e", // Primary gold/brass
    500: "#b69659",
    300: "#d4b785",
    200: "#e0c69c",
  },
  // Text Colors
  text: {
    primary: "#2c2c2c",
    light: "rgba(255, 255, 255, 0.9)",
    muted: "rgba(255, 255, 255, 0.6)",
    subtle: "rgba(255, 255, 255, 0.4)",
  },
};

export const typography = {
  // Font Families
  fontFamily: {
    serif: '"Playfair Display", serif',
    sans: '"Inter", sans-serif',
  },
  // Font Sizes
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
};

// Shared Component Styles
export const components = {
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  section: "py-16 md:py-24",

  // Button Variants
  button: {
    primary: `
      bg-gold-400 text-navy-900 
      px-8 py-4 rounded-full 
      font-medium transition-all duration-300
      hover:bg-gold-500 hover:transform hover:translate-y-[-2px]
      focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2
    `,
    secondary: `
      border-2 border-gold-400 text-gold-400
      px-8 py-4 rounded-full
      font-medium transition-all duration-300
      hover:bg-gold-400/10
      focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2
    `,
  },

  // Card Styles
  card: `
    bg-navy-800/50 rounded-2xl
    border border-gold-400/10
    p-8 transition-all duration-300
    hover:border-gold-400/30
    hover:transform hover:translate-y-[-4px]
  `,

  // Input Styles
  input: `
    w-full px-4 py-3
    bg-white/5 border border-white/10 rounded-lg
    text-white placeholder-white/40
    focus:outline-none focus:border-gold-400/50
    transition-all duration-300
  `,

  // Animation Variants
  animation: {
    fadeUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.6 },
    },
  },

  // Gradient Backgrounds
  gradients: {
    primary: "bg-gradient-to-b from-navy-900 to-navy-800",
    overlay: "bg-gradient-to-t from-navy-900/90 to-navy-900/50",
    subtle: "bg-gradient-to-r from-gold-400/5 via-gold-400/10 to-gold-400/5",
  },
};

// Shared Layout Styles
export const layout = {
  grid: {
    primary: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8",
    secondary: "grid grid-cols-1 md:grid-cols-2 gap-8",
  },
  spacing: {
    section: "space-y-16 md:space-y-24",
    content: "space-y-8",
  },
};

// Shared Effects
export const effects = {
  shadow: {
    sm: "shadow-sm shadow-gold-400/10",
    md: "shadow-md shadow-gold-400/10",
    lg: "shadow-lg shadow-gold-400/10",
  },
  glassmorphism: "backdrop-blur-md bg-white/5",
  textGradient:
    "bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-gold-300",
};
