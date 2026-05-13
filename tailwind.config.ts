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
          DEFAULT: "#003087",
          foreground: "#ffffff",
          muted: "#1e4a9e",
        },
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.72)",
          solid: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glass: "0 10px 40px rgba(15, 23, 42, 0.10), inset 0 1px 0 rgba(255,255,255,0.65)",
        card: "0 10px 30px rgba(15, 23, 42, 0.10)",
        premium:
          "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 28px rgba(15, 23, 42, 0.07)",
        premiumLg:
          "0 1px 3px rgba(15, 23, 42, 0.05), 0 16px 48px rgba(15, 23, 42, 0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
