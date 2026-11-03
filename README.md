# Writeless

**Reusable messages, less typing.**

Writeless is a cross-platform mobile application for managing reusable text messages and making repetitive conversations faster.

Users can create, title, edit, favorite, reorder, search, and copy predefined messages. Android additionally offers a floating bubble and compact overlay panel, allowing quick access without switching away from the app currently in use.

## Project identity

| Property | Value |
|---|---|
| Product name | Writeless |
| Repository | [JassoEC/write-less](https://github.com/JassoEC/write-less) |
| Expo slug | `writeless` |
| Android application ID | `com.ecajasso.writeless` |
| iOS bundle identifier | `com.ecajasso.writeless` |
| URL scheme | `writeless` |
| Initial version | `1.0.0` |

## Product goals

- Reduce repetitive typing in messaging applications.
- Make frequently used messages easy to find and reuse.
- Minimize context switching, especially on Android.
- Keep message management simple and intuitive.
- Work offline without requiring accounts or a backend.

## Features

### Shared Android and iOS application

- Create, edit, and delete messages.
- Give each message a descriptive title.
- Mark messages as favorites.
- Reorder messages with drag and drop.
- Copy message content to the system clipboard.
- Persist messages locally and work offline.

### Android enhancement: floating panel

Android will provide an optional floating experience:

- A draggable floating bubble.
- A compact panel showing saved messages.
- One-tap message copying.
- A visual copy confirmation.
- Operation independently of the main React Native activity.

The overlay requires the user's explicit Android overlay permission. It does not need to inspect or integrate with other messaging applications; the user pastes copied text where needed.

### iOS

The initial iOS release uses the standard React Native application for message management and copying. An equivalent always-on-top floating window is not part of the initial iOS scope. Alternative access mechanisms may be evaluated later.

## Technology stack

| Layer | Technology |
|---|---|
| Mobile framework | React Native |
| Development platform | Expo |
| Native module integration | Expo Modules API |
| Language | TypeScript |
| Android native implementation | Kotlin |
| Local database | SQLite |
| Database integration | Expo SQLite |
| State management | Zustand |
| Navigation | Expo Router |
| Gestures | React Native Gesture Handler |
| Animations | React Native Reanimated |
| Clipboard | Expo Clipboard; Android ClipboardManager in the native overlay |

Use Expo SDK-compatible package versions through `npx expo install`.

## Architecture

The shared application owns message management and local persistence. Platform-specific adapters expose capabilities that differ by operating system.

```text
Writeless
├── Shared React Native application
│   ├── Message management
│   ├── Favorites and ordering
│   ├── Search
│   ├── Clipboard
│   └── Local persistence
├── Android
│   └── Local Expo module (Kotlin)
│       ├── FloatingPanelModule
│       ├── FloatingService
│       ├── FloatingWindowManager
│       ├── FloatingBubbleView
│       ├── FloatingPanelView
│       └── Clipboard integration
└── iOS
    └── Standard React Native experience
```

The Android overlay must not depend on the main React Native activity remaining mounted. It will read the same local message data through a defined storage contract. SQLite schema ownership and migrations must be coordinated so the native service and React Native application use a consistent database.

## Initial data model

```typescript
interface Message {
  id: string;
  title: string;
  content: string;
  isFavorite: boolean;
  position: number;
  createdAt: number;
  updatedAt: number;
}
```

The initial model intentionally excludes categories, accounts, cloud synchronization, and backend services. These can be reconsidered only if validation demonstrates a need.

## Repository structure

```text
write-less/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── messages/
│   └── settings/
├── src/
│   ├── core/
│   │   └── messages/
│   ├── features/
│   │   └── messages/
│   ├── infrastructure/
│   │   ├── database/
│   │   └── clipboard/
│   ├── platform/
│   │   └── floating-panel/
│   ├── store/
│   └── shared/
├── modules/
│   └── floating-panel/
│       ├── src/
│       ├── android/
│       └── expo-module.config.json
├── app.json
├── package.json
└── tsconfig.json
```

The local Expo module lives in `modules/floating-panel`. Its TypeScript API should be isolated behind platform-specific entry points so iOS never attempts to load Android-only native code.

## Development requirements

- Node.js 22 LTS
- Yarn 3
- Expo tooling
- Android Studio and Android SDK
- A JDK version compatible with the selected Expo SDK / Android Gradle Plugin
- Xcode for native iOS builds (macOS)

## Getting started

Create the Expo application:

```bash
yarn create expo-app writeless
cd writeless
```

Install Expo-compatible dependencies:

```bash
npx expo install \
  expo-sqlite \
  expo-clipboard \
  react-native-gesture-handler \
  react-native-reanimated
```

Install state management:

```bash
yarn add zustand
```

Generate the local Android Expo module:

```bash
yarn create expo-module --local --platform android
```

Use `floating-panel` as the module name.

Generate native projects and run Android:

```bash
npx expo prebuild
npx expo run:android
```

Start the development server:

```bash
npx expo start --dev-client
```

> **Native build note:** Expo Go cannot load this custom Kotlin module. Use a development build. Rebuild the native application after changing Kotlin or native configuration. Be cautious with `npx expo prebuild --clean` after making manual changes to generated native projects.

## Development roadmap

### Phase 1 — Shared application foundation

- [ ] Initialize Expo project and TypeScript.
- [ ] Configure Expo Router.
- [ ] Configure SQLite and migrations.
- [ ] Implement message CRUD.
- [ ] Implement favorites.
- [ ] Implement drag-and-drop ordering.
- [ ] Implement clipboard integration.
- [ ] Verify Android and iOS builds.

### Phase 2 — Android native module

- [ ] Generate and register the local Expo module.
- [ ] Expose a typed TypeScript API.
- [ ] Implement overlay permission handling.
- [ ] Implement the Android floating service.
- [ ] Implement draggable bubble and persisted position.
- [ ] Implement compact panel UI.

### Phase 3 — Overlay integration

- [ ] Define and implement shared SQLite access.
- [ ] Read messages from the native panel.
- [ ] Copy selected messages to clipboard.
- [ ] Show copy confirmation.
- [ ] Refresh panel data after message changes.
- [ ] Handle service and activity lifecycle correctly.

### Phase 4 — Validation

- [ ] Test on physical Android devices.
- [ ] Test with WhatsApp, Facebook Messenger, and Facebook.
- [ ] Validate behavior when the main activity is closed.
- [ ] Test process termination and device restart behavior.
- [ ] Validate offline operation.
- [ ] Test the shared application on iOS.

## Product principles

1. **Local-first:** messages remain on the device in the MVP.
2. **Simple:** focus on reusable text, not CRM workflows.
3. **Fast:** selecting and copying a message should take minimal interaction.
4. **Cross-platform:** shared product functionality works on Android and iOS.
5. **Native where necessary:** platform-specific behavior belongs in native modules.
6. **Independent Android overlay:** the floating experience must not require the main React Native activity to remain open.

## MVP non-goals

The initial MVP does not include authentication, a backend, cloud synchronization, customer management, messaging API integrations, or automatic message sending.

---

**Writeless — Spend less time typing repetitive messages.**
