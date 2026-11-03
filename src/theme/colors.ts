export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  danger: string;
  favorite: string;
  overlay: string;
  inputPlaceholder: string;
}

export const themes: Record<ColorScheme, ThemeColors> = {
  light: {
    background: '#F7F7F5',
    surface: '#FFFFFF',
    surfaceSecondary: '#F0F0EC',
    border: '#E8E8E3',
    text: '#20201D',
    textSecondary: '#686860',
    textMuted: '#898981',
    primary: '#20201D',
    onPrimary: '#FFFFFF',
    danger: '#B34D45',
    favorite: '#A87932',
    overlay: 'rgba(0,0,0,0.35)',
    inputPlaceholder: '#A1A198',
  },
  dark: {
    background: '#111210',
    surface: '#1C1D1A',
    surfaceSecondary: '#282923',
    border: '#383A33',
    text: '#F2F2EC',
    textSecondary: '#C0C1B8',
    textMuted: '#92948A',
    primary: '#E9EAE2',
    onPrimary: '#20201D',
    danger: '#F08B80',
    favorite: '#E5B968',
    overlay: 'rgba(0,0,0,0.68)',
    inputPlaceholder: '#85877D',
  },
};
