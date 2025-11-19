/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#08bdbf",
          dark: "#0aa8b0"
        }
      }
    }
  },
  plugins: []
}
