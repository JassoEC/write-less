import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useAppTheme } from '@/theme/theme-provider';

function RootNavigator() {
  const { colors, scheme } = useAppTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{
        headerBackTitle: 'Back',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="messages/new" options={{ title: 'New message', presentation: 'modal' }} />
        <Stack.Screen name="messages/[id]" options={{ title: 'Edit message', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  return <SafeAreaProvider><ThemeProvider><RootNavigator /></ThemeProvider></SafeAreaProvider>;
}
