export const AXI_THEME = {
  colors: {
    navy: '#020617',
    slate900: '#0f172a',
    slate800: '#1e293b',
    slate700: '#334155',
    slate600: '#475569',
    slate400: '#94a3b8',
    slate200: '#e2e8f0',
    slate50: '#f8fafc',
    cyan: '#06b6d4',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    emerald: '#10b981',
    rose: '#f43f5e',
    amber: '#f59e0b',
    glass: 'rgba(15, 23, 42, 0.8)',
    glassStrong: 'rgba(15, 23, 42, 0.95)',
    glassBorder: 'rgba(148, 163, 184, 0.1)',
    glassBorderHover: 'rgba(148, 163, 184, 0.2)',
  },
  gradients: {
    accent: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    accentAlt: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    surface: 'linear-gradient(180deg, #0f172a, #020617)',
  },
  shadows: {
    glow: '0 0 20px rgba(6, 182, 212, 0.15)',
    glowStrong: '0 0 40px rgba(6, 182, 212, 0.25)',
    window: '0 8px 32px rgba(0, 0, 0, 0.4)',
    windowFocused: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(6, 182, 212, 0.3)',
    elevated: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    window: 12,
  },
  typography: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  },
} as const;

export const APP_RESOURCE_COSTS: Record<string, { ramMB: number; cpuBase: number }> = {
  terminal: { ramMB: 64, cpuBase: 2 },
  editor: { ramMB: 128, cpuBase: 3 },
  canvas: { ramMB: 256, cpuBase: 5 },
  navigator: { ramMB: 512, cpuBase: 8 },
  files: { ramMB: 96, cpuBase: 2 },
  taskmanager: { ramMB: 48, cpuBase: 1 },
  settings: { ramMB: 64, cpuBase: 1 },
};

export const SYSTEM_LIMITS = {
  totalRAM: 8192,
  maxCPU: 100,
} as const;
