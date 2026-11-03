import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { copyText } from '@/infrastructure/clipboard/clipboard';
import { getAppSetting, setAppSetting } from '@/infrastructure/database/app-settings';
import { useMessagesStore } from '@/store/messages-store';

const HIDE_COPY_CONFIRMATION_KEY = 'hide_copy_confirmation';

export default function MessagesScreen() {
  const router = useRouter();
  const messages = useMessagesStore((state) => state.messages);
  const isLoading = useMessagesStore((state) => state.isLoading);
  const loadMessages = useMessagesStore((state) => state.loadMessages);
  const deleteMessage = useMessagesStore((state) => state.deleteMessage);
  const toggleFavorite = useMessagesStore((state) => state.toggleFavorite);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(true);
  const [copyConfirmationVisible, setCopyConfirmationVisible] = useState(false);
  const [doNotShowCopyConfirmation, setDoNotShowCopyConfirmation] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void loadMessages().catch(() => {
        Alert.alert('Something went wrong', 'Your messages could not be loaded.');
      });
    }, [loadMessages]),
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let isMounted = true;
    void getAppSetting(HIDE_COPY_CONFIRMATION_KEY)
      .then((value) => {
        if (isMounted) setShowCopyConfirmation(value !== 'true');
      })
      .catch(() => {
        if (isMounted) setShowCopyConfirmation(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMessages = useMemo(() => {
    const query = debouncedSearch.trim().toLocaleLowerCase();
    const matching = messages.filter((message) =>
      message.title.toLocaleLowerCase().includes(query),
    );
    const favorites = matching.filter((message) => message.isFavorite);
    const regularMessages = matching.filter((message) => !message.isFavorite);

    return { favorites, ordered: [...favorites, ...regularMessages] };
  }, [messages, debouncedSearch]);

  const handleCopy = async (content: string) => {
    try {
      await copyText(content);
      if (showCopyConfirmation) {
        setDoNotShowCopyConfirmation(false);
        setCopyConfirmationVisible(true);
      }
    } catch {
      Alert.alert('Copy failed', 'Please try again.');
    }
  };

  const dismissCopyConfirmation = async () => {
    setCopyConfirmationVisible(false);
    if (doNotShowCopyConfirmation) {
      try {
        await setAppSetting(HIDE_COPY_CONFIRMATION_KEY, 'true');
        setShowCopyConfirmation(false);
      } catch {
        Alert.alert('Preference not saved', 'The confirmation will continue to appear next time.');
      }
    }
  };

  const confirmDelete = (id: string, title: string) => {
    Alert.alert('Delete message?', `"${title}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteMessage(id).catch(() =>
            Alert.alert('Delete failed', 'Please try again.'),
          );
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.title}>Your messages</Text>
          <Text style={styles.subtitle}>
            {messages.length === 1 ? '1 saved reply' : `${messages.length} saved replies`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/messages/new')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by title"
          placeholderTextColor="#A1A198"
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={styles.searchInput}
          accessibilityLabel="Search messages by title"
        />
      </View>

      {isLoading && messages.length === 0 ? (
        <Text style={styles.helper}>Loading messages…</Text>
      ) : messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyDescription}>
            Create your first reusable reply and keep it ready to copy.
          </Text>
          <Pressable
            onPress={() => router.push('/messages/new')}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Create a message</Text>
          </Pressable>
        </View>
      ) : filteredMessages.ordered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No matching messages</Text>
          <Text style={styles.emptyDescription}>Try another title or clear your search.</Text>
          <Pressable onPress={() => setSearch('')} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Clear search</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {filteredMessages.favorites.length > 0 && (
            <Text style={styles.sectionLabel}>FAVORITES</Text>
          )}
          {filteredMessages.ordered.map((message) => (
            <View key={message.id} style={styles.messageCard}>
              <View style={styles.cardHeading}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={message.isFavorite ? 'Remove favorite' : 'Add favorite'}
                  onPress={() => {
                    void toggleFavorite(message.id).catch(() =>
                      Alert.alert('Update failed', 'The favorite status could not be changed.'),
                    );
                  }}
                  hitSlop={8}
                  style={styles.favoriteButton}
                >
                  <Text style={styles.favoriteIcon}>{message.isFavorite ? '★' : '☆'}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Copy message: ${message.title}`}
                  onPress={() => void handleCopy(message.content)}
                  style={styles.messageText}
                >
                  <Text style={styles.messageTitle}>{message.title}</Text>
                  <Text style={styles.messagePreview} numberOfLines={1}>
                    {message.content}
                  </Text>
                </Pressable>
                <Text style={styles.copyIcon} accessible={false}>⧉</Text>
              </View>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => router.push({ pathname: '/messages/[id]', params: { id: message.id } })}
                  style={styles.textAction}
                >
                  <Text style={styles.textActionText}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => confirmDelete(message.id, message.title)} style={styles.textAction}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        animationType="fade"
        transparent
        visible={copyConfirmationVisible}
        onRequestClose={() => void dismissCopyConfirmation()}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>Copied to clipboard</Text>
            <Text style={styles.confirmationDescription}>
              Your message is ready to paste in the conversation.
            </Text>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: doNotShowCopyConfirmation }}
              onPress={() => setDoNotShowCopyConfirmation((value) => !value)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, doNotShowCopyConfirmation && styles.checkboxChecked]}>
                {doNotShowCopyConfirmation && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Don't show this again</Text>
            </Pressable>
            <Pressable onPress={() => void dismissCopyConfirmation()} style={styles.confirmationButton}>
              <Text style={styles.confirmationButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  headingText: { flex: 1 },
  title: { color: '#20201D', fontSize: 26, fontWeight: '700', letterSpacing: -0.7 },
  subtitle: { color: '#77776F', fontSize: 13, marginTop: 4 },
  addButton: { backgroundColor: '#20201D', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  searchContainer: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E2E2DC', borderRadius: 12, borderWidth: 1, flexDirection: 'row', marginBottom: 18, paddingHorizontal: 13 },
  searchIcon: { color: '#898981', fontSize: 24, marginRight: 8 },
  searchInput: { color: '#20201D', flex: 1, fontSize: 15, paddingVertical: 13 },
  helper: { color: '#77776F', paddingVertical: 20 },
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 80 },
  emptyTitle: { color: '#20201D', fontSize: 20, fontWeight: '700' },
  emptyDescription: { color: '#77776F', fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  emptyButton: { backgroundColor: '#20201D', borderRadius: 12, marginTop: 22, paddingHorizontal: 20, paddingVertical: 13 },
  emptyButtonText: { color: '#FFFFFF', fontWeight: '600' },
  list: { gap: 12, paddingBottom: 24 },
  sectionLabel: { color: '#898981', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 2, marginTop: 2 },
  messageCard: { backgroundColor: '#FFFFFF', borderColor: '#E8E8E3', borderRadius: 16, borderWidth: 1, padding: 16 },
  cardHeading: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  favoriteButton: { paddingTop: 1 },
  favoriteIcon: { color: '#A87932', fontSize: 22 },
  messageText: { flex: 1, gap: 5 },
  messageTitle: { color: '#20201D', fontSize: 16, fontWeight: '700' },
  messagePreview: { color: '#77776F', fontSize: 13, lineHeight: 19 },
  cardActions: { alignItems: 'center', flexDirection: 'row', gap: 18, justifyContent: 'flex-end', marginTop: 6 },
  copyIcon: { color: '#898981', fontSize: 20, paddingLeft: 8 },
  textAction: { paddingVertical: 8 },
  textActionText: { color: '#686860', fontSize: 12, fontWeight: '600' },
  deleteText: { color: '#B34D45', fontSize: 12, fontWeight: '600' },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', flex: 1, justifyContent: 'center', padding: 28 },
  confirmationCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22, width: '100%' },
  confirmationTitle: { color: '#20201D', fontSize: 19, fontWeight: '700' },
  confirmationDescription: { color: '#686860', fontSize: 14, lineHeight: 21, marginTop: 7 },
  checkboxRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 22 },
  checkbox: { alignItems: 'center', borderColor: '#B9B9B0', borderRadius: 5, borderWidth: 1, height: 21, justifyContent: 'center', width: 21 },
  checkboxChecked: { backgroundColor: '#20201D', borderColor: '#20201D' },
  checkboxTick: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  checkboxLabel: { color: '#45453F', fontSize: 14 },
  confirmationButton: { alignItems: 'center', backgroundColor: '#20201D', borderRadius: 12, marginTop: 22, padding: 14 },
  confirmationButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
