// Defines the tailwind CSS config file
// Specifies paths for where tailwind should look for classes to generate its styles
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // Specifies potential customisation options
  theme: {
    extend: {},
  },
  plugins: [], // Plugins are handled in postcss.config.js
}