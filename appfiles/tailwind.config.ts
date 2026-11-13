import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#19231f",
        muted: "#718079",
        line: "#e8ede9",
        green: { 50: "#eff8f2", 100: "#dcefe1", 500: "#36945b", 600: "#287b49", 700: "#21613b" },
        canvas: "#f7f9f7",
      },
      boxShadow: { card: "0 8px 28px rgba(29, 48, 37, 0.055)", float: "0 20px 60px rgba(29, 48, 37, 0.12)" },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
