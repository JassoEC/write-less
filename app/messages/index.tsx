import { StyleSheet, Text, View } from 'react-native';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your messages</Text>
      <Text style={styles.description}>
        Reusable replies will appear here. Message creation and local persistence
        are the next implementation step.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 10, padding: 24 },
  title: { color: '#20201D', fontSize: 24, fontWeight: '700' },
  description: { color: '#686860', fontSize: 15, lineHeight: 23 },
});
