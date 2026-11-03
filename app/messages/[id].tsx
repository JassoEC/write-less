import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMessagesStore } from '@/store/messages-store';

export default function EditMessageScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const message = useMessagesStore((state) => state.messages.find((item) => item.id === id));
  const loadMessages = useMessagesStore((state) => state.loadMessages);
  const updateMessage = useMessagesStore((state) => state.updateMessage);
  const [title, setTitle] = useState(message?.title ?? '');
  const [content, setContent] = useState(message?.content ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!message) {
      void loadMessages().catch(() => {
        Alert.alert('Unable to load', 'This message could not be loaded.');
      });
    }
  }, [loadMessages, message]);

  useEffect(() => {
    if (message) {
      setTitle(message.title);
      setContent(message.content);
    }
  }, [message]);

  const save = async () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) {
      Alert.alert('Missing information', 'Add a title and message before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await updateMessage(id, cleanTitle, cleanContent);
      router.back();
    } catch {
      Alert.alert('Could not save', 'Your changes were not saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!message) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit message' }} />
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.notFound}>Message not found.</Text>
          <Pressable onPress={() => router.back()} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Go back</Text>
          </Pressable>
        </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit message' }} />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>TITLE</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Message title"
          placeholderTextColor="#A1A198"
          maxLength={80}
          style={styles.titleInput}
        />
        <Text style={styles.label}>MESSAGE</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write your reusable reply…"
          placeholderTextColor="#A1A198"
          multiline
          textAlignVertical="top"
          style={styles.contentInput}
        />
        <Pressable disabled={isSaving} onPress={() => void save()} style={[styles.saveButton, isSaving && styles.disabled]}>
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving…' : 'Save changes'}</Text>
        </Pressable>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, padding: 22 },
  label: { color: '#77776F', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 9, marginTop: 12 },
  titleInput: { backgroundColor: '#FFFFFF', borderColor: '#E2E2DC', borderRadius: 12, borderWidth: 1, color: '#20201D', fontSize: 16, padding: 15 },
  contentInput: { backgroundColor: '#FFFFFF', borderColor: '#E2E2DC', borderRadius: 12, borderWidth: 1, color: '#20201D', fontSize: 15, lineHeight: 23, minHeight: 190, padding: 15 },
  saveButton: { alignItems: 'center', backgroundColor: '#20201D', borderRadius: 13, marginTop: 26, padding: 16 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.55 },
  notFound: { color: '#686860', fontSize: 15, marginTop: 20 },
});
