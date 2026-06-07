/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
    },
    extend: {
      colors: {
        paper: {
          50: '#FAF7F0',
          100: '#F5F0E6',
          200: '#EBE3D0',
          300: '#DDD0B3',
        },
        cinnabar: {
          50: '#FDF2F4',
          100: '#FBE3E7',
          500: '#D4A85C',
          600: '#C41E3A',
          700: '#A01830',
        },
        bamboo: {
          50: '#F4F6F2',
          100: '#E8EBE4',
          500: '#8B9080',
          600: '#7D8471',
          700: '#656B5B',
        },
        ink: {
          50: '#F5F5F5',
          100: '#E0E0E0',
          600: '#4A4A4A',
          700: '#2C2C2C',
          800: '#1A1A1A',
        },
        gold: {
          400: '#D4AF37',
          500: '#C9A227',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(44, 44, 44, 0.06), 0 1px 3px rgba(44, 44, 44, 0.08)',
        'card-hover': '0 8px 24px rgba(44, 44, 44, 0.12), 0 2px 8px rgba(44, 44, 44, 0.08)',
      },
      borderRadius: {
        'lg': '8px',
        'xl': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(196, 30, 58, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(196, 30, 58, 0)' },
        },
      },
    },
  },
  plugins: [],
};
