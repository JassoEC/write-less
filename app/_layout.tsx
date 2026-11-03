import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F7F7F5' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="messages/new" options={{ title: 'New message', presentation: 'modal' }} />
        <Stack.Screen name="messages/[id]" options={{ title: 'Edit message', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
