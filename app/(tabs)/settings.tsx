import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.description}>
        App preferences and Android floating-panel controls will live here.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 10, padding: 24, paddingTop: 32 },
  title: { color: '#20201D', fontSize: 24, fontWeight: '700' },
  description: { color: '#686860', fontSize: 15, lineHeight: 23 },
});
