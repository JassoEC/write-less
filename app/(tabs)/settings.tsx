import { useEffect, useState } from 'react';
import { AppState, Pressable, ScrollView, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { useAppTheme, type ThemePreference } from '@/theme/theme-provider';
import { useLanguage, type AppLanguage } from '@/i18n/language-provider';
import {
  hasOverlayPermission,
  isOverlayRunning,
  isOverlaySupported,
  openOverlayPermissionSettings,
  startOverlay,
  stopOverlay,
} from '@/infrastructure/overlay/overlay';

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const overlaySupported = isOverlaySupported();
  const [overlayPermission, setOverlayPermission] = useState(false);
  const [overlayRunning, setOverlayRunning] = useState(false);

  useEffect(() => {
    if (!overlaySupported) return;

    const refreshOverlayState = () => {
      const permission = hasOverlayPermission();
      setOverlayPermission(permission);
      setOverlayRunning(permission && isOverlayRunning());
    };

    refreshOverlayState();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshOverlayState();
    });

    return () => subscription.remove();
  }, [overlaySupported]);

  const handleOverlayPress = () => {
    if (!overlayPermission) {
      openOverlayPermissionSettings();
      return;
    }

    if (overlayRunning) {
      stopOverlay();
      setOverlayRunning(false);
      return;
    }

    startOverlay({
      openApp: t('overlayOpenApp'),
      minimize: t('overlayMinimize'),
      close: t('overlayClose'),
      empty: t('overlayEmpty'),
      copied: t('overlayCopied'),
    });
    setOverlayRunning(true);
  };

  const themeChoices: { value: ThemePreference; label: string; description: string }[] = [
    { value: 'system', label: t('system'), description: t('followDevice') },
    { value: 'light', label: t('light'), description: t('alwaysLight') },
    { value: 'dark', label: t('dark'), description: t('alwaysDark') },
  ];
  const languageChoices: { value: AppLanguage; label: string }[] = [
    { value: 'es', label: t('spanish') },
    { value: 'en', label: t('english') },
  ];

  return <AppScreen>
    <ScrollView
      contentContainerStyle={{ padding: 24, paddingTop: 32, paddingBottom: 40, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
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
    {overlaySupported ? <AppCard style={{ gap: 8 }}>
      <AppText weight="semibold" style={{ fontSize: 16 }}>{t('overlayTitle')}</AppText>
      <AppText tone="secondary" style={{ fontSize: 13, lineHeight: 20 }}>{t('overlayDescription')}</AppText>
      <AppText tone="muted" style={{ fontSize: 12 }}>
        {overlayPermission ? t('overlayPermissionGranted') : t('overlayPermissionNeeded')}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={handleOverlayPress}
        style={{ alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13 }}
      >
        <AppText weight="semibold" style={{ color: '#FFFFFF' }}>
          {overlayPermission && overlayRunning ? t('overlayDisable') : t('overlayEnable')}
        </AppText>
      </Pressable>
    </AppCard> : null}
    </ScrollView>
  </AppScreen>;
}
