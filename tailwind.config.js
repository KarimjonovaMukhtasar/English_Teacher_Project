const brand = {
  50: '#ECFEFF',
  100: '#CFFAFE',
  200: '#A5F3FC',
  300: '#67E8F9',
  400: '#22D3EE',
  500: '#06B6D4',
  600: '#0891B2',
  700: '#0E7490',
  800: '#155E75',
  900: '#164E63',
  950: '#083344',
};

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand,
        surface: {
          canvas: 'var(--color-surface-canvas)',
          base: 'var(--color-surface-base)',
          card: 'var(--color-surface-card)',
          inset: 'var(--color-surface-inset)',
          border: 'var(--color-surface-border)',
          'border-strong': 'var(--color-surface-border-strong)',
        },
        ink: {
          primary: 'var(--color-ink-primary)',
          secondary: 'var(--color-ink-secondary)',
          muted: 'var(--color-ink-muted)',
          inverse: 'var(--color-ink-inverse)',
        },
        clinical: {
          grammar: {
            text: 'var(--color-grammar-text)',
            bg: 'var(--color-grammar-bg)',
            border: 'var(--color-grammar-border)',
          },
          vocab: {
            text: 'var(--color-vocab-text)',
            bg: 'var(--color-vocab-bg)',
            border: 'var(--color-vocab-border)',
          },
          diagnostic: {
            text: 'var(--color-diagnostic-text)',
            bg: 'var(--color-diagnostic-bg)',
            border: 'var(--color-diagnostic-border)',
          },
          alert: {
            text: 'var(--color-alert-text)',
            bg: 'var(--color-alert-bg)',
            border: 'var(--color-alert-border)',
          },
          anatomy: {
            text: 'var(--color-anatomy-text)',
            bg: 'var(--color-anatomy-bg)',
            border: 'var(--color-anatomy-border)',
          },
        },
      }
    },
  },
  plugins: [],
}
