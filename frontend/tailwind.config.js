/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System — Medora AI
        primary: {
          50:  "#ecfeff",
          100: "#cffaf2",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#0891B2",  // Cyan-600
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          DEFAULT: "#0891B2",
          foreground: "#ffffff",
        },
        accent: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#059669",  // Emerald-600
          600: "#047857",
          700: "#065f46",
          DEFAULT: "#059669",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#EF4444",
          foreground: "#ffffff",
        },
        // Semantic colors
        background: "#ECFEFF",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#0891B2",
        foreground: "#111827",
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        // Urgency level colors
        urgency: {
          low:       "#10B981",
          medium:    "#F59E0B",
          high:      "#F97316",
          emergency: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        sm:   "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        md:   "0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        lg:   "0 8px 24px 0 rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.04)",
        xl:   "0 20px 40px 0 rgb(0 0 0 / 0.12), 0 8px 16px -8px rgb(0 0 0 / 0.06)",
        glow: "0 0 30px -5px rgba(79, 110, 247, 0.4)",
      },
      animation: {
        "fade-in":     "fadeIn 0.3s ease-out",
        "slide-up":    "slideUp 0.4s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "pulse-soft":  "pulseSoft 2s ease-in-out infinite",
        "spin-slow":   "spin 3s linear infinite",
        "bounce-soft": "bounceSoft 1.4s ease-in-out infinite",
        "text-shine":  "textShine 6s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
        bounceSoft: {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%":           { transform: "scale(1.0)" },
        },
        textShine: {
          "0%": { "background-position": "0% 50%" },
          "100%": { "background-position": "200% 50%" },
        },
      },
    },
  },
  plugins: [],
};
