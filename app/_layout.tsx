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
        <Stack.Screen name="index" options={{ title: 'Writeless' }} />
        <Stack.Screen name="messages/index" options={{ title: 'Messages' }} />
        <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
      </Stack>
    </>
  );
}
