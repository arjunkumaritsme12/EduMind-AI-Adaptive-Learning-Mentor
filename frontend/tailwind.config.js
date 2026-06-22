/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0A0A0F',
        glassBg: 'rgba(255, 255, 255, 0.05)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        neonPurple: '#6C63FF',
        neonCyan: '#00D4FF',
        neonGreen: '#00FF88',
        neonAmber: '#FFB800',
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0B0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        purpleGlow: '0 0 20px rgba(108, 99, 255, 0.15)',
        cyanGlow: '0 0 20px rgba(0, 212, 255, 0.15)',
        greenGlow: '0 0 20px rgba(0, 255, 136, 0.15)',
      }
    },
  },
  plugins: [],
}
