export const AXI_THEME = {
  colors: {
    black: '#000000',
    white: '#FFFFFF',
  },
  border: {
    width: 3,
    style: 'solid' as const,
    radius: 0,
  },
  shadow: {
    offset: 8,
  },
  grid: 8,
  typography: {
    display: {
      fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
      fontWeight: 900,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.6em',
    },
    mono: {
      fontFamily: "'Courier New', 'Consolas', monospace",
    },
  },
} as const;
