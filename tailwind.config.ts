import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        paper: "var(--paper)",
        line: "var(--line)",
        ink: "var(--ink)",
        soft: "var(--soft)",
        accent: "var(--accent)",
        accentStrong: "var(--accent-strong)",
        warm: "var(--warm)",
        danger: "var(--danger)"
      },
      boxShadow: {
        card: "0 18px 42px rgba(30, 41, 59, 0.08)",
        soft: "0 8px 24px rgba(15, 23, 42, 0.08)"
      },
      fontFamily: {
        sans: ["'Noto Sans SC'", "'Hiragino Sans'", "'Segoe UI'", "sans-serif"],
        display: ["'Averia Serif Libre'", "'Times New Roman'", "serif"]
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseRing: {
          "0%": { transform: "scale(0.95)", opacity: "0.6" },
          "100%": { transform: "scale(1.05)", opacity: "0" }
        }
      },
      animation: {
        rise: "rise 0.45s ease-out",
        pulseRing: "pulseRing 0.8s ease-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
