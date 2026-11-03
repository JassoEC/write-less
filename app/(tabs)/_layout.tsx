import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/theme-provider';
import { useLanguage } from '@/i18n/language-provider';

function TabIcon({ name, color }: { name: 'messages' | 'settings'; color: string }) {
  return <Text style={{ color, fontSize: 21, lineHeight: 24 }}>{name === 'messages' ? '▤' : '⚙'}</Text>;
}
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: colors.text,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 62 + insets.bottom, paddingTop: 7, paddingBottom: Math.max(7, insets.bottom) },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  }}>
    <Tabs.Screen name="index" options={{ title: t('messages'), tabBarLabel: t('messages'), tabBarIcon: ({ color }) => <TabIcon name="messages" color={color} /> }} />
    <Tabs.Screen name="settings" options={{ title: t('settings'), tabBarLabel: t('settings'), tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} /> }} />
  </Tabs>;
}
