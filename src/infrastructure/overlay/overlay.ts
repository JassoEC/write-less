import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

type OverlayLabels = {
  openApp: string;
  minimize: string;
  close: string;
  empty: string;
  copied: string;
};

type OverlayNativeModule = {
  hasPermission(): boolean;
  isRunning(): boolean;
  openPermissionSettings(): void;
  start(labels: OverlayLabels): void;
  stop(): void;
};

const nativeModule =
  Platform.OS === 'android'
    ? requireNativeModule<OverlayNativeModule>('WritelessOverlay')
    : null;

export function isOverlaySupported(): boolean {
  return Platform.OS === 'android';
}

export function isOverlayRunning(): boolean {
  return nativeModule?.isRunning() ?? false;
}

export function hasOverlayPermission(): boolean {
  return nativeModule?.hasPermission() ?? false;
}

export function openOverlayPermissionSettings(): void {
  nativeModule?.openPermissionSettings();
}

export function startOverlay(labels: OverlayLabels): void {
  nativeModule?.start(labels);
}

export function stopOverlay(): void {
  nativeModule?.stop();
}
