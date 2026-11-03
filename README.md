# Writeless

**Reusable messages, less typing.**

Writeless is a cross-platform mobile application for managing reusable text messages and making repetitive conversations faster.

## Development

### Requirements

- Node.js 22.13 or newer (Node 22 LTS recommended)
- Yarn
- Android Studio and Android SDK for Android development
- Xcode for iOS development (macOS)

### Install dependencies

```bash
yarn install
```

### Run the app

```bash
yarn start
yarn android
yarn ios
```

Writeless uses Expo Router for file-based navigation. Route files live in `app/`.

### Native development

A development build is required for custom native modules. Expo Go cannot load the future local Kotlin floating-panel module.

```bash
npx expo prebuild
npx expo run:android
npx expo run:ios
```

Rebuild the native application after changing native code or native configuration.

## Architecture

- `app/`: Expo Router routes, tab navigation and layouts.
- `src/core/`: domain types and repository contracts.
- `src/features/`: product feature UI and application logic.
- `src/infrastructure/`: SQLite and platform service implementations.
- `src/platform/`: platform-specific adapters.
- `src/store/`: Zustand state.
- `src/shared/`: shared UI and utilities.
- `modules/`: local Expo native modules.

The MVP is local-first. Messages are stored on-device; no account, backend, or cloud sync is required.

## Implemented

- Create, edit and delete reusable messages.
- Search messages by title.
- Copy message content to the system clipboard.
- Optionally dismiss copy confirmations permanently.
- Mark messages as favorites.
- Bottom-tab navigation for Messages and Settings.
- Persist messages and app preferences in SQLite across app restarts.
- Version the SQLite schema with `PRAGMA user_version`.

## Product identity

- Expo slug: `writeless`
- Android application ID: `com.ecajasso.writeless`
- iOS bundle identifier: `com.ecajasso.writeless`
- URL scheme: `writeless`
