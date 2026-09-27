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
        primary: {
          DEFAULT: "#263E32",
          container: "#446553",
          light: "#3D7A69",
          fixed: "#BCEDDC",
          "fixed-dim": "#A0D1C0",
          dark: "#0B2921",
        },
        secondary: {
          DEFAULT: "#446553",
          container: "#DCE9DF",
          fixed: "#C6EBD4",
          "fixed-dim": "#AACFB9",
          light: "#6C8F7B",
        },
        sage: {
          50: "#F4F8F5",
          100: "#E4EFE8",
          200: "#C9DFD3",
          300: "#A8C7B5",
          400: "#87B098",
          500: "#6C8F7B",
          600: "#4F725D",
        },
        surface: {
          DEFAULT: "#F8F7F4",
          lowest: "#FFFFFF",
          container: "#EDF1E9",
          "container-low": "#EAF6F0",
          "container-high": "#DBECE3",
          "container-highest": "#D5E7DD",
          tint: "#396759",
          variant: "#D5E7DD",
        },
        accent: {
          DEFAULT: "#F2C6A0",
          warm: "#E08A3C",
          amber: "#FCEEE2",
          peach: "#FFDCBF",
        },
        text: {
          primary: "#26332D",
          secondary: "#404945",
          muted: "#66736D",
          light: "#8A9690",
        },
        outline: {
          DEFAULT: "#717975",
          variant: "#C0C8C4",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(36, 51, 45, 0.05)",
        card: "0 8px 32px -16px rgba(36, 51, 45, 0.10)",
        hover: "0 8px 30px -4px rgba(36, 51, 45, 0.12)",
        nav: "0 1px 8px rgba(0, 0, 0, 0.04)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseSlow: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.08)", opacity: "0.7" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-slow": "pulseSlow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
