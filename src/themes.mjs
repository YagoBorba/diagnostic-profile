const base = {
  dark: {
    panel: '#0f141b',
    inset: '#0a0e13',
    border: '#2a3441',
    grid: '#1a232e',
    text: '#e6edf3',
    muted: '#8b98a5',
    ok: '#56d364',
    glow: 0.45,
  },
  light: {
    panel: '#ffffff',
    inset: '#f6f8fa',
    border: '#d0d7de',
    grid: '#e6eaef',
    text: '#1f2328',
    muted: '#59636e',
    ok: '#1a7f37',
    glow: 0,
  },
};

const palettes = {
  amber: {
    dark: { accent: '#ffb547', signal: '#4fd1c5' },
    light: { accent: '#a35f00', signal: '#0b7a75' },
  },
  phosphor: {
    dark: { accent: '#3dff8f', signal: '#ffd166' },
    light: { accent: '#0f7b3f', signal: '#9a6700' },
  },
  ice: {
    dark: { accent: '#79c0ff', signal: '#f778ba' },
    light: { accent: '#0969da', signal: '#bf3989' },
  },
  ember: {
    dark: { accent: '#ff7b5c', signal: '#a5d6ff' },
    light: { accent: '#c4381b', signal: '#0550ae' },
  },
};

export const paletteNames = Object.keys(palettes);

export function resolveTheme(palette, mode) {
  const colors = palettes[palette];
  if (!colors) {
    throw new Error(`Unknown theme "${palette}". Available: ${paletteNames.join(', ')}`);
  }
  return { mode, ...base[mode], ...colors[mode] };
}

export const MONO = "ui-monospace, SFMono-Regular, 'JetBrains Mono', 'Cascadia Code', Menlo, Consolas, monospace";
export const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";
export const MONO_RATIO = 0.6;
