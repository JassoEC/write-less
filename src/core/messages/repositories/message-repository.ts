import type { Message } from '../types/message';

export interface MessageRepository {
  getAll(): Promise<Message[]>;
  getById(id: Message['id']): Promise<Message | null>;
  create(message: Message): Promise<void>;
  update(message: Message): Promise<void>;
  delete(id: Message['id']): Promise<void>;
  toggleFavorite(id: Message['id']): Promise<void>;
  reorder(orderedIds: Message['id'][]): Promise<void>;
}
