/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#030712',
          surface: 'rgba(15, 23, 42, 0.7)',
          'surface-hover': 'rgba(30, 41, 59, 0.9)',
          'surface-active': 'rgba(51, 65, 85, 0.95)',
        },
        text: {
          primary: '#ffffff',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        accent: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          glow: 'rgba(59, 130, 246, 0.4)',
        },
        danger: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        glass: {
          border: 'rgba(255, 255, 255, 0.05)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'volumetric': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      maxWidth: {
        'container': '1400px',
      },
      transitionProperty: {
        'fast': '150ms cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
