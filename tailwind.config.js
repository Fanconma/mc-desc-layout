/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b0d10',
          900: '#101318',
          850: '#14181f',
          800: '#191e26',
          750: '#1f242e',
          700: '#262c38',
          600: '#333b4a',
          500: '#4a5468',
          400: '#6b7689',
          300: '#98a2b3',
          200: '#c3cad6',
          100: '#e6eaf0',
        },
        mc: {
          grass: '#7bd14a',
          emerald: '#1bd96a',
          diamond: '#4ce3d0',
          gold: '#f9c846',
          redstone: '#ff5b5b',
          lapis: '#4d7cff',
          amethyst: '#b47cff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 40px -12px rgba(0,0,0,0.7)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: { 'fade-up': 'fade-up .18s ease-out' },
    },
  },
  plugins: [],
}
