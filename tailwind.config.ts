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
        sage: {
          50: "#f4f9f6",
          100: "#dceee4",
          200: "#b9dcc8",
          300: "#8bc4a4",
          400: "#57a67a",
          500: "#358a5e",
          600: "#276e4b",
          700: "#21583e",
          800: "#1d4734",
          900: "#193b2c",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        lift: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 12px 24px -8px rgb(53 138 94 / 0.12)",
      },
      transitionDuration: {
        viz: "700ms",
      },
      keyframes: {
        "voice-bar": {
          "0%, 100%": { transform: "scaleY(0.22)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        "voice-bar": "voice-bar 0.52s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
