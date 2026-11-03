import { create } from 'zustand';

import type { Message } from '@/core/messages/types/message';
import { SQLiteMessageRepository } from '@/infrastructure/database/sqlite-message-repository';

const repository = new SQLiteMessageRepository();

interface MessagesState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  loadMessages: () => Promise<void>;
  createMessage: (title: string, content: string) => Promise<void>;
  updateMessage: (id: string, title: string, content: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  loadMessages: async () => {
    set({ isLoading: true, error: null });

    try {
      const messages = await repository.getAll();
      set({ messages });
    } catch {
      set({ error: 'Unable to load your messages.' });
      throw new Error('Unable to load your messages.');
    } finally {
      set({ isLoading: false });
    }
  },

  createMessage: async (title, content) => {
    const now = Date.now();
    const current = get().messages;
    const message: Message = {
      id: createId(),
      title: title.trim(),
      content: content.trim(),
      isFavorite: false,
      position: current.length,
      createdAt: now,
      updatedAt: now,
    };

    await repository.create(message);
    set({ messages: [...current, message], error: null });
  },

  updateMessage: async (id, title, content) => {
    const message = get().messages.find((item) => item.id === id);
    if (!message) throw new Error('Message not found.');

    const updated: Message = {
      ...message,
      title: title.trim(),
      content: content.trim(),
      updatedAt: Date.now(),
    };

    await repository.update(updated);
    set({
      messages: get().messages.map((item) => (item.id === id ? updated : item)),
      error: null,
    });
  },

  deleteMessage: async (id) => {
    await repository.delete(id);
    set({ messages: get().messages.filter((item) => item.id !== id), error: null });
  },

  toggleFavorite: async (id) => {
    await repository.toggleFavorite(id);
    set({
      messages: get().messages.map((item) =>
        item.id === id
          ? { ...item, isFavorite: !item.isFavorite, updatedAt: Date.now() }
          : item,
      ),
      error: null,
    });
  },
}));
