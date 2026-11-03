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

A development build is required for custom native modules. Expo Go cannot load the Android floating-panel module.

```bash
npx expo prebuild
npx expo run:android
npx expo run:ios
```

Rebuild the native application after changing native code or native configuration.

## Android floating panel

The Android-only floating panel is implemented as a local Expo module in `modules/writeless-overlay`.

- Enable or disable the panel from Settings.
- Android requires the user to grant the special "Display over other apps" permission.
- The panel can be dragged, expanded and minimized.
- Selecting a saved message copies its content to the clipboard; the panel remains open for consecutive copies.
- The panel can open the main Writeless app or be closed completely.
- A foreground-service notification indicates that the panel is active.
- The native service reads the existing `writeless.db` SQLite file in Expo SQLite's Android database directory. It does not create a second database or modify messages.

The overlay is Android-only. iOS keeps the regular in-app message workflow. A native development or production build is required; Expo Go is not supported for this feature.

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
- Android floating panel for copying saved messages over other apps.

## Product identity

- Expo slug: `writeless`
- Android application ID: `com.ecajasso.writeless`
- iOS bundle identifier: `com.ecajasso.writeless`
- URL scheme: `writeless`
