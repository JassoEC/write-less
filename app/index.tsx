import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>WRITLESS</Text>
        <Text style={styles.title}>Less typing.{ '\n' }More conversation.</Text>
        <Text style={styles.description}>
          Keep your most-used replies ready to copy whenever you need them.
        </Text>
      </View>

      <View style={styles.actions}>
        <Link href="/messages" style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Open messages</Text>
        </Link>
        <Link href="/settings" style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Settings</Text>
        </Link>
      </View>
      <Text style={styles.footer}>Your messages stay on this device.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 32,
  },
  hero: { gap: 16 },
  eyebrow: {
    color: '#77776F',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
  },
  title: {
    color: '#20201D',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1.8,
    lineHeight: 48,
  },
  description: {
    color: '#686860',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 310,
  },
  actions: { gap: 12 },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#20201D',
    borderRadius: 14,
    padding: 17,
  },
  primaryActionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryAction: {
    alignItems: 'center',
    borderColor: '#DADAD4',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  secondaryActionText: { color: '#20201D', fontSize: 16, fontWeight: '600' },
  footer: { color: '#898981', fontSize: 12, textAlign: 'center' },
});
