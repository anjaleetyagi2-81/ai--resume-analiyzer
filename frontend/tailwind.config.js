/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#101827',
          50: '#F4F5F7',
          100: '#E4E6EB',
          200: '#C3C8D3',
          300: '#9AA2B2',
          400: '#6B7488',
          500: '#4B5468',
          600: '#343C4F',
          700: '#232939',
          800: '#171C29',
          900: '#101827',
          950: '#0A0F19',
        },
        paper: {
          DEFAULT: '#FBF8F2',
          soft: '#F4EFE4',
          card: '#FFFFFF',
        },
        highlighter: {
          DEFAULT: '#F4B740',
          soft: '#FCE4AE',
          strong: '#E29A1B',
        },
        scan: {
          DEFAULT: '#0F766E',
          soft: '#CCFBF1',
          strong: '#0B5A54',
        },
        success: {
          DEFAULT: '#15803D',
          soft: '#DCFCE7',
        },
        danger: {
          DEFAULT: '#B91C1C',
          soft: '#FEE2E2',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        dash: {
          from: { strokeDashoffset: '283' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        loadbar: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(60%)' },
          '100%': { transform: 'translateX(220%)' },
        },
      },
      animation: {
        scanline: 'scanline 2.1s linear infinite',
        fadeUp: 'fadeUp 0.5s ease-out both',
        popIn: 'popIn 0.4s ease-out both',
        loadbar: 'loadbar 1.6s ease-in-out infinite',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,39,0.04), 0 8px 24px -8px rgba(16,24,39,0.10)',
        raised: '0 2px 4px rgba(16,24,39,0.06), 0 16px 40px -12px rgba(16,24,39,0.18)',
      },
    },
  },
  plugins: [],
};
