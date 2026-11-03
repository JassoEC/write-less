import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useAppTheme } from '@/theme/theme-provider';
import { LanguageProvider, useLanguage } from '@/i18n/language-provider';

function RootNavigator() {
  const { colors, scheme } = useAppTheme();
  const { t } = useLanguage();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{
        headerBackTitle: t('goBack'),
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="messages/new" options={{ title: t('newMessage'), presentation: 'modal' }} />
        <Stack.Screen name="messages/[id]" options={{ title: t('editMessage'), presentation: 'modal' }} />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  return <SafeAreaProvider><ThemeProvider><LanguageProvider><RootNavigator /></LanguageProvider></ThemeProvider></SafeAreaProvider>;
}
