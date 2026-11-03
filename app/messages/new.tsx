import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { useMessagesStore } from '@/store/messages-store';

export default function NewMessageScreen() {
  const router = useRouter();
  const createMessage = useMessagesStore((state) => state.createMessage);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) {
      Alert.alert('Missing information', 'Add a title and message before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await createMessage(cleanTitle, cleanContent);
      router.back();
    } catch {
      Alert.alert('Could not save', 'Your message was not saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New message' }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>TITLE</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Delivery information"
          placeholderTextColor="#A1A198"
          maxLength={80}
          returnKeyType="next"
          style={styles.titleInput}
        />
        <Text style={styles.label}>MESSAGE</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write the reply you want to reuse…"
          placeholderTextColor="#A1A198"
          multiline
          textAlignVertical="top"
          style={styles.contentInput}
        />
        <Text style={styles.hint}>Your message is saved only on this device.</Text>
        <Pressable disabled={isSaving} onPress={() => void save()} style={[styles.saveButton, isSaving && styles.disabled]}>
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving…' : 'Save message'}</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 22 },
  label: { color: '#77776F', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 9, marginTop: 12 },
  titleInput: { backgroundColor: '#FFFFFF', borderColor: '#E2E2DC', borderRadius: 12, borderWidth: 1, color: '#20201D', fontSize: 16, padding: 15 },
  contentInput: { backgroundColor: '#FFFFFF', borderColor: '#E2E2DC', borderRadius: 12, borderWidth: 1, color: '#20201D', fontSize: 15, lineHeight: 23, minHeight: 190, padding: 15 },
  hint: { color: '#898981', fontSize: 12, marginTop: 12 },
  saveButton: { alignItems: 'center', backgroundColor: '#20201D', borderRadius: 13, marginTop: 26, padding: 16 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.55 },
});
