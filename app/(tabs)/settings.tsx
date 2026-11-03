import { View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { useAppTheme, type ThemePreference } from '@/theme/theme-provider';

const choices: { value: ThemePreference; label: string; description: string }[] = [
  { value: 'system', label: 'System', description: 'Follow your device appearance' },
  { value: 'light', label: 'Light', description: 'Always use light appearance' },
  { value: 'dark', label: 'Dark', description: 'Always use dark appearance' },
];
export default function SettingsScreen() {
  const { colors, preference, setPreference } = useAppTheme();
  return <AppScreen style={{ padding: 24, paddingTop: 32, gap: 16 }}>
    <AppText style={{ fontSize: 24 }} weight="bold">Settings</AppText>
    <AppText tone="secondary" style={{ fontSize: 14, lineHeight: 21 }}>Customize how Writeless looks on this device.</AppText>
    <AppCard style={{ gap: 16 }}>
      <AppText weight="semibold" style={{ fontSize: 16 }}>Appearance</AppText>
      <AppText tone="secondary" style={{ fontSize: 13 }}>Theme</AppText>
      {choices.map((choice) => {
        const selected = preference === choice.value;
        return <View key={choice.value} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <AppText weight="semibold">{choice.label}</AppText>
            <AppText tone="muted" style={{ fontSize: 12 }}>{choice.description}</AppText>
          </View>
          <AppText style={{ color: selected ? colors.primary : colors.textMuted, fontSize: 20 }}>{selected ? '●' : '○'}</AppText>
          <View style={{ position: 'absolute', left: 0, right: 0, top: -8, bottom: -8 }}>
            <View pointerEvents="none" />
          </View>
          <View style={{ position: 'absolute', left: 0, right: 0, top: -8, bottom: -8 }} />
        </View>;
      })}
      {choices.map((choice) => <View key={choice.value} />)}
    </AppCard>
  </AppScreen>;
}
