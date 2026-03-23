/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Dijital Mor Karargah - Feminist Activism Colors
        purple: {
          DEFAULT: '#632F86',
          50: '#f5f3f7',
          100: '#ede5f0',
          200: '#d4c5e0',
          300: '#bb9fd0',
          400: '#9f6fbd',
          500: '#8346a8',
          600: '#632F86',
          700: '#4a2363',
          800: '#351840',
          900: '#1f0e23',
        },
        // Vurgu Kırmızısı - Activism Red
        red: {
          DEFAULT: '#DA291C',
          50: '#fff5f4',
          100: '#fde8e5',
          200: '#fbccc2',
          300: '#f8ad9e',
          400: '#f27663',
          500: '#ed4e2f',
          600: '#DA291C',
          700: '#b81d12',
          800: '#97180f',
          900: '#5c0d08',
        },
        // Neutral colors
        slate: {
          light: '#f8f9fa',
          dark: '#1a1a1a',
        },
      },
      fontFamily: {
        // For headers - bold feminist message
        'display': ['Poppins', 'sans-serif'],
        // For body - readable and accessible
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xl': ['1.5rem', '2rem'],
        '3xl': ['1.875rem', '2.25rem'],
        '4xl': ['2.25rem', '2.5rem'],
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeIn: 'fadeIn 0.5s ease-in',
        slideUp: 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};