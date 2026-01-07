/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#BB8C4B",
        secondary: "#777777",
        light: "#DDDDDD",
        white: "#FFFFFF",
        dark: "#303133",
        darker: "#222227",
        muted: "#999999",
      },
    },
  },
  plugins: [],
};
