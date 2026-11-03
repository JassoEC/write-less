import * as SQLite from 'expo-sqlite';

import { DATABASE_NAME, DATABASE_VERSION, MIGRATIONS } from './schema';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = initializeDatabase().catch((error: unknown) => {
      databasePromise = undefined;
      throw error;
    });
  }

  return databasePromise;
}

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await database.execAsync('PRAGMA journal_mode = WAL;');
  await database.execAsync('PRAGMA foreign_keys = ON;');

  let currentVersion = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;',
  );

  const version = currentVersion?.user_version ?? 0;

  if (version > DATABASE_VERSION) {
    throw new Error(
      `Database version ${version} is newer than supported version ${DATABASE_VERSION}.`,
    );
  }

  for (let nextVersion = version + 1; nextVersion <= DATABASE_VERSION; nextVersion += 1) {
    const migration = MIGRATIONS[nextVersion];

    if (!migration) {
      throw new Error(`Missing database migration for version ${nextVersion}.`);
    }

    await database.withTransactionAsync(async () => {
      await database.execAsync(migration);
      await database.execAsync(`PRAGMA user_version = ${nextVersion};`);
    });

    currentVersion = { user_version: nextVersion };
  }

  return database;
}
