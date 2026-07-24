/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      margin: {
        100: '80rem',
      },
      colors: {
        blue: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#025AA2',
          600: '#0D47A1',
          700: '#0B3E8C',
          800: '#0A2B6B',
          900: '#002D6C',
        },
      },
    },
  },
  plugins: [],
};
