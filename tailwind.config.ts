import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        base: {
          blue: "#0052FF",
          "blue-light": "#3b7dff",
          "blue-dark": "#0041cc",
        },
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
          4: "var(--surface-4)",
        },
        accent: {
          cyan: "#06b6d4",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 82, 255, 0.3), 0 0 40px rgba(0, 82, 255, 0.1)",
        "glow-lg": "0 0 40px rgba(0, 82, 255, 0.4), 0 0 80px rgba(0, 82, 255, 0.2)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
      backgroundImage: {
        "gradient-base": "linear-gradient(135deg, #0052FF 0%, #7c3aed 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh": `
          radial-gradient(at 40% 20%, rgba(0, 82, 255, 0.15) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(124, 58, 237, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(6, 182, 212, 0.1) 0px, transparent 50%),
          radial-gradient(at 80% 50%, rgba(16, 185, 129, 0.05) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(244, 63, 94, 0.05) 0px, transparent 50%)
        `,
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in-down": "fadeInDown 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "slide-in-left": "slideInLeft 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 82, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 82, 255, 0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
