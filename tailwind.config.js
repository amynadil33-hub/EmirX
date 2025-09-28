/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'dhivehi': ['MV Waheed', 'Faruma', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'maldives': {
          blue: '#0EA5E9',
          coral: '#F97316',
          sand: '#FEF3C7',
          ocean: '#0C4A6E',
        }
      }
    },
  },
  plugins: [],
}