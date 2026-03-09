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
          50: "#f0f4f8",
          100: "#e1eaf1",
          200: "#c3d5e3",
          300: "#a5bfd5",
          400: "#87aac7",
          500: "#6995b9", // Main dark blue
          600: "#4a6fa3",
          700: "#34498d",
          800: "#1e2d5a",
          900: "#0d1929",
        },
      },
    },
  },
  plugins: [],
};
export default config;
