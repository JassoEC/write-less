import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { copyText } from '@/infrastructure/clipboard/clipboard';
import { useMessagesStore } from '@/store/messages-store';

export default function MessagesScreen() {
  const router = useRouter();
  const messages = useMessagesStore((state) => state.messages);
  const isLoading = useMessagesStore((state) => state.isLoading);
  const loadMessages = useMessagesStore((state) => state.loadMessages);
  const deleteMessage = useMessagesStore((state) => state.deleteMessage);
  const toggleFavorite = useMessagesStore((state) => state.toggleFavorite);

  useFocusEffect(
    useCallback(() => {
      void loadMessages().catch(() => {
        Alert.alert('Something went wrong', 'Your messages could not be loaded.');
      });
    }, [loadMessages]),
  );

  const handleCopy = async (content: string) => {
    try {
      await copyText(content);
      Alert.alert('Copied', 'Message copied to your clipboard.');
    } catch {
      Alert.alert('Copy failed', 'Please try again.');
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

  const favorites = messages.filter((message) => message.isFavorite);
  const regularMessages = messages.filter((message) => !message.isFavorite);
  const orderedMessages = [...favorites, ...regularMessages];

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View>
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

      {isLoading && messages.length === 0 ? (
        <Text style={styles.helper}>Loading messages…</Text>
      ) : orderedMessages.length === 0 ? (
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
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {favorites.length > 0 && <Text style={styles.sectionLabel}>FAVORITES</Text>}
          {orderedMessages.map((message) => (
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
                  style={styles.messageText}
                  onPress={() => router.push({ pathname: '/messages/[id]', params: { id: message.id } })}
                >
                  <Text style={styles.messageTitle}>{message.title}</Text>
                  <Text style={styles.messagePreview} numberOfLines={2}>
                    {message.content}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.cardActions}>
                <Pressable onPress={() => void handleCopy(message.content)} style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>Copy message</Text>
                </Pressable>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  title: { color: '#20201D', fontSize: 26, fontWeight: '700', letterSpacing: -0.7 },
  subtitle: { color: '#77776F', fontSize: 13, marginTop: 4 },
  addButton: { backgroundColor: '#20201D', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  helper: { color: '#77776F', paddingVertical: 20 },
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 80 },
  emptyTitle: { color: '#20201D', fontSize: 20, fontWeight: '700' },
  emptyDescription: { color: '#77776F', fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  emptyButton: { backgroundColor: '#20201D', borderRadius: 12, marginTop: 22, paddingHorizontal: 20, paddingVertical: 13 },
  emptyButtonText: { color: '#FFFFFF', fontWeight: '600' },
  list: { gap: 12, paddingBottom: 32 },
  sectionLabel: { color: '#898981', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 2, marginTop: 2 },
  messageCard: { backgroundColor: '#FFFFFF', borderColor: '#E8E8E3', borderRadius: 16, borderWidth: 1, padding: 16 },
  cardHeading: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  favoriteButton: { paddingTop: 1 },
  favoriteIcon: { color: '#A87932', fontSize: 22 },
  messageText: { flex: 1, gap: 5 },
  messageTitle: { color: '#20201D', fontSize: 16, fontWeight: '700' },
  messagePreview: { color: '#77776F', fontSize: 13, lineHeight: 19 },
  cardActions: { alignItems: 'center', borderTopColor: '#EEEEEA', borderTopWidth: 1, flexDirection: 'row', gap: 18, marginTop: 14, paddingTop: 12 },
  copyButton: { backgroundColor: '#F0F0EC', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8 },
  copyButtonText: { color: '#20201D', fontSize: 12, fontWeight: '700' },
  textAction: { paddingVertical: 8 },
  textActionText: { color: '#686860', fontSize: 12, fontWeight: '600' },
  deleteText: { color: '#B34D45', fontSize: 12, fontWeight: '600' },
});
