import { StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.description}>
        App preferences and Android floating-panel controls will live here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 10, padding: 24 },
  title: { color: '#20201D', fontSize: 24, fontWeight: '700' },
  description: { color: '#686860', fontSize: 15, lineHeight: 23 },
});
