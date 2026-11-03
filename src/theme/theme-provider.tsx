import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { getAppSetting, setAppSetting } from '@/infrastructure/database/app-settings';
import { themes, type ColorScheme, type ThemeColors } from './colors';

export type ThemePreference = 'system' | ColorScheme;
interface ThemeContextValue { preference: ThemePreference; scheme: ColorScheme; colors: ThemeColors; setPreference: (value: ThemePreference) => Promise<void>; }
const STORAGE_KEY = 'theme_preference';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  useEffect(() => { let active = true; void getAppSetting(STORAGE_KEY).then((value) => { if (active && (value === 'light' || value === 'dark' || value === 'system')) setPreferenceState(value); }).catch(() => undefined); return () => { active = false; }; }, []);
  const setPreference = useCallback(async (value: ThemePreference) => { await setAppSetting(STORAGE_KEY, value); setPreferenceState(value); }, []);
  const scheme: ColorScheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const value = useMemo(() => ({ preference, scheme, colors: themes[scheme], setPreference }), [preference, scheme, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used inside ThemeProvider.');
  return value;
}
