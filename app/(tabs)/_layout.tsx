import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#20201D',
      tabBarInactiveTintColor: '#898981',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E8E8E3',
        height: 62 + insets.bottom,
        paddingTop: 7,
        paddingBottom: Math.max(7, insets.bottom),
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Messages', tabBarLabel: 'Messages' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarLabel: 'Settings' }} />
    </Tabs>
  );
}
