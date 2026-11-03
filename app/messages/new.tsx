import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMessagesStore } from '@/store/messages-store';
import { useLanguage } from '@/i18n/language-provider';

export default function NewMessageScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const createMessage = useMessagesStore((state) => state.createMessage);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) {
      Alert.alert(t('missingInfo'), t('addTitleAndMessage'));
      return;
    }

    setIsSaving(true);
    try {
      await createMessage(cleanTitle, cleanContent);
      router.back();
    } catch {
      Alert.alert(t('couldNotSave'), t('saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('newMessage') }} />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView style={styles.formScroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Text style={styles.label}>{t('title')}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('deliveryPlaceholder')}
          placeholderTextColor="#A1A198"
          maxLength={80}
          returnKeyType="next"
          style={styles.titleInput}
        />
        <Text style={styles.label}>{t('message')}</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder={t('messagePlaceholder')}
          placeholderTextColor="#A1A198"
          multiline
          textAlignVertical="top"
          style={styles.contentInput}
        />
        <Text style={styles.hint}>{t('localHint')}</Text>
        <Pressable disabled={isSaving} onPress={() => void save()} style={[styles.saveButton, isSaving && styles.disabled]}>
          <Text style={styles.saveButtonText}>{isSaving ? t('saving') : t('saveMessage')}</Text>
        </Pressable>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  formScroll: { flex: 1 },
  container: { flexGrow: 1, padding: 22, paddingBottom: 40 },
  label: { color: '#77776F', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 9, marginTop: 12 },
  titleInput: { backgroundColor: '#FFFFFF', borderColor: '#E2E2DC', borderRadius: 12, borderWidth: 1, color: '#20201D', fontSize: 16, padding: 15 },
  contentInput: { backgroundColor: '#FFFFFF', borderColor: '#E2E2DC', borderRadius: 12, borderWidth: 1, color: '#20201D', fontSize: 15, lineHeight: 23, minHeight: 190, padding: 15 },
  hint: { color: '#898981', fontSize: 12, marginTop: 12 },
  saveButton: { alignItems: 'center', backgroundColor: '#20201D', borderRadius: 13, marginTop: 26, padding: 16 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.55 },
});
