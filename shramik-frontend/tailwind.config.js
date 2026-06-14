/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#030712", // deepest background
          900: "#0f172a", // card backgrounds
          850: "#14213d", // intermediate panel — distinct from 800
          800: "#1e293b", // borders and dividers
          700: "#334155", // muted containers
          600: "#475569", // disabled states
        },
        emerald: {
          500: "#10b981",
          400: "#34d399",
          350: "#6ee7b7",
        },
        indigo: {
          650: "#4338ca", // deeper accent for sidebar active states
          600: "#4f46e5",
          500: "#6366f1",
          400: "#818cf8",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "Plus Jakarta Sans",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem", // 16px
        "3xl": "1.25rem", // 20px
      },
      backgroundImage: {
        "gradient-premium":
          "linear-gradient(135deg, #0f172a 0%, #1a1f35 50%, #0f172a 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        slideUp: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        slideIn: "slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
