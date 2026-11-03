import type { Message } from '@/core/messages/types/message';
import type { MessageRepository } from '@/core/messages/repositories/message-repository';

import { getDatabase } from './database';

interface MessageRow {
  id: string;
  title: string;
  content: string;
  is_favorite: number;
  position: number;
  created_at: number;
  updated_at: number;
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    isFavorite: row.is_favorite === 1,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SQLiteMessageRepository implements MessageRepository {
  async getAll(): Promise<Message[]> {
    const database = await getDatabase();
    const rows = await database.getAllAsync<MessageRow>(
      'SELECT * FROM messages ORDER BY position ASC, created_at DESC;',
    );

    return rows.map(toMessage);
  }

  async getById(id: Message['id']): Promise<Message | null> {
    const database = await getDatabase();
    const row = await database.getFirstAsync<MessageRow>(
      'SELECT * FROM messages WHERE id = ?;',
      id,
    );

    return row ? toMessage(row) : null;
  }

  async create(message: Message): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO messages
        (id, title, content, is_favorite, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      message.id,
      message.title,
      message.content,
      message.isFavorite ? 1 : 0,
      message.position,
      message.createdAt,
      message.updatedAt,
    );
  }

  async update(message: Message): Promise<void> {
    const database = await getDatabase();
    const result = await database.runAsync(
      `UPDATE messages
       SET title = ?, content = ?, is_favorite = ?, position = ?, updated_at = ?
       WHERE id = ?;`,
      message.title,
      message.content,
      message.isFavorite ? 1 : 0,
      message.position,
      message.updatedAt,
      message.id,
    );

    if (result.changes === 0) {
      throw new Error('Message not found.');
    }
  }

  async delete(id: Message['id']): Promise<void> {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM messages WHERE id = ?;', id);
  }

  async toggleFavorite(id: Message['id']): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE messages
       SET is_favorite = CASE is_favorite WHEN 1 THEN 0 ELSE 1 END,
           updated_at = ?
       WHERE id = ?;`,
      Date.now(),
      id,
    );
  }

  async reorder(orderedIds: Message['id'][]): Promise<void> {
    const database = await getDatabase();

    await database.withTransactionAsync(async () => {
      for (const [position, id] of orderedIds.entries()) {
        await database.runAsync(
          'UPDATE messages SET position = ? WHERE id = ?;',
          position,
          id,
        );
      }
    });
  }
}
