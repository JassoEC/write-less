export const DATABASE_NAME = 'writeless.db';

export const INITIAL_SCHEMA = `
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS messages_position_idx
    ON messages(position);

  CREATE INDEX IF NOT EXISTS messages_favorite_idx
    ON messages(is_favorite);
`;
