import * as SQLite from 'expo-sqlite';

import { DATABASE_NAME, INITIAL_SCHEMA } from './schema';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = initializeDatabase();
  }

  return databasePromise;
}

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await database.execAsync('PRAGMA journal_mode = WAL;');
  await database.execAsync('PRAGMA foreign_keys = ON;');
  await database.execAsync(INITIAL_SCHEMA);

  return database;
}
