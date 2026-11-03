import { Pressable, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { useAppTheme, type ThemePreference } from '@/theme/theme-provider';
import { useLanguage, type AppLanguage } from '@/i18n/language-provider';

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const themeChoices: { value: ThemePreference; label: string; description: string }[] = [
    { value: 'system', label: t('system'), description: t('followDevice') },
    { value: 'light', label: t('light'), description: t('alwaysLight') },
    { value: 'dark', label: t('dark'), description: t('alwaysDark') },
  ];
  const languageChoices: { value: AppLanguage; label: string }[] = [
    { value: 'es', label: t('spanish') },
    { value: 'en', label: t('english') },
  ];

  return <AppScreen style={{ padding: 24, paddingTop: 32, gap: 16 }}>
    <AppText style={{ fontSize: 24 }} weight="bold">{t('settings')}</AppText>
    <AppText tone="secondary" style={{ fontSize: 14, lineHeight: 21 }}>{t('customize')}</AppText>
    <AppCard style={{ gap: 8 }}>
      <AppText weight="semibold" style={{ fontSize: 16 }}>{t('appearance')}</AppText>
      <AppText tone="secondary" style={{ fontSize: 13 }}>{t('theme')}</AppText>
      {themeChoices.map((choice) => {
        const selected = preference === choice.value;
        return <Pressable key={choice.value} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => void setPreference(choice.value)} style={{ alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 12, paddingVertical: 10 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <AppText weight="semibold">{choice.label}</AppText>
            <AppText tone="muted" style={{ fontSize: 12 }}>{choice.description}</AppText>
          </View>
          <AppText style={{ color: selected ? colors.primary : colors.textMuted, fontSize: 20 }}>{selected ? '●' : '○'}</AppText>
        </Pressable>;
      })}
    </AppCard>
    <AppCard style={{ gap: 8 }}>
      <AppText weight="semibold" style={{ fontSize: 16 }}>{t('language')}</AppText>
      {languageChoices.map((choice) => {
        const selected = language === choice.value;
        return <Pressable key={choice.value} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => void setLanguage(choice.value)} style={{ alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 12, paddingVertical: 10 }}>
          <AppText weight="semibold" style={{ flex: 1 }}>{choice.label}</AppText>
          <AppText style={{ color: selected ? colors.primary : colors.textMuted, fontSize: 20 }}>{selected ? '●' : '○'}</AppText>
        </Pressable>;
      })}
    </AppCard>
  </AppScreen>;
}
