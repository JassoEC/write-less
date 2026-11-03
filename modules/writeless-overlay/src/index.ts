import { requireNativeModule } from 'expo-modules-core';

type OverlayLabels = {
  openApp: string;
  minimize: string;
  close: string;
  empty: string;
  copied: string;
};

type WritelessOverlayNativeModule = {
  hasPermission(): boolean;
  isRunning(): boolean;
  openPermissionSettings(): void;
  start(labels: OverlayLabels): void;
  stop(): void;
};

export default requireNativeModule<WritelessOverlayNativeModule>('WritelessOverlay');
