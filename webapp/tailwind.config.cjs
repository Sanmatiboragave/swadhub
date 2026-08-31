module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        zest: {
          50: '#eef9f3',
          100: '#d5f0e3',
          200: '#aee1c9',
          300: '#79cbaa',
          400: '#45af87',
          500: '#0d8a5b',
          600: '#08724c',
          700: '#075b3e',
          800: '#074933',
          900: '#063c2b',
        },
        citrus: {
          400: '#f0b429',
          500: '#e8a317',
          600: '#c9840d',
        },
        ink: {
          700: '#2a3a33',
          800: '#1a2a23',
          900: '#14221c',
        },
        flame: '#e85d4c',
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        body: ['Figtree', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        lift: '0 12px 28px rgba(13, 138, 91, 0.18), 0 4px 8px rgba(20, 34, 28, 0.08)',
        float: '0 25px 50px -12px rgba(20, 34, 28, 0.28)',
        plate: '0 30px 60px -20px rgba(13, 138, 91, 0.35), 0 10px 20px -8px rgba(20, 34, 28, 0.15)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-18px) rotate(2deg)' },
        },
        floatySlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(3deg)' },
          '50%': { transform: 'translateY(-12px) rotate(-1deg)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.85)', opacity: '0.55' },
          '100%': { transform: 'scale(1.35)', opacity: '0' },
        },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        floatySlow: 'floatySlow 7s ease-in-out infinite',
        spinSlow: 'spinSlow 28s linear infinite',
        riseIn: 'riseIn 0.6s ease-out both',
        pulseRing: 'pulseRing 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}
