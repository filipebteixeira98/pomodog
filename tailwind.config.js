/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#F8F7F2",
        surface: "#FFFEFA",
        ink: "#343C32",
        muted: "#73796D",
        line: "#E7E8DE",
        soft: "#EEF0E6",
      },
      fontFamily: {
        sans: ["Poppins_400Regular"],
        "poppins-medium": ["Poppins_500Medium"],
        "poppins-semibold": ["Poppins_600SemiBold"],
      },
    },
  },
  plugins: [],
};
