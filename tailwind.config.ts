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
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          "monospace",
        ],
      },
      boxShadow: {
        glass: "0 10px 40px rgba(15, 23, 42, 0.10), inset 0 1px 0 rgba(255,255,255,0.65)",
        card: "0 10px 30px rgba(15, 23, 42, 0.10)",
        premium:
          "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 28px rgba(15, 23, 42, 0.07)",
        premiumLg:
          "0 1px 3px rgba(15, 23, 42, 0.05), 0 16px 48px rgba(15, 23, 42, 0.08)",
        /** Refined depth for hover / elevated cards (charcoal-tinted). */
        nexaFloat:
          "0 0 0 1px rgba(15, 23, 42, 0.045), 0 2px 6px rgba(15, 23, 42, 0.04), 0 14px 40px -12px rgba(15, 23, 42, 0.11), inset 0 1px 0 rgba(255,255,255,0.88)",
        nexaHeader:
          "inset 0 1px 0 rgba(255,255,255,0.82), 0 1px 2px rgba(15, 23, 42, 0.04), 0 14px 44px -18px rgba(15, 23, 42, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        nexa: "200ms",
        "nexa-slow": "320ms",
      },
      transitionTimingFunction: {
        nexa: "cubic-bezier(0.4, 0, 0.2, 1)",
        "nexa-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
