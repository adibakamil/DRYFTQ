/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF5A1F', // decorative / graphics / large display only
          action: '#CC4310', // text-bearing orange: 4.8:1 with white (WCAG AA)
          'action-hover': '#B93C0A', // 5.65:1 with white
          tint: '#FFF4ED',
          ink: '#12161B',
          dark: '#15191D',
          slate: '#1E242B',
          console: '#031B30',
          panel: '#07243E',
          line: '#0d3459',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        pop: '0 18px 45px -18px rgb(18 22 27 / 0.35)',
        card: '0 1px 2px rgb(18 22 27 / 0.05), 0 8px 24px -16px rgb(18 22 27 / 0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.3s ease both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};
