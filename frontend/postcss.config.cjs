module.exports = {
  plugins: [
    // use the new Tailwind PostCSS bridge package
    require('@tailwindcss/postcss')(),
    // autoprefixer (keeps compatibility)
    require('autoprefixer'),
  ],
}
