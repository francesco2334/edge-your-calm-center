import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const useHaptics = () => {
  // Light tap feedback - for button taps, selections
  const tapLight = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Silently fail on web or unsupported devices
    }
  };

  // Medium tap feedback - for phase changes, important transitions
  const tapMedium = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Silently fail
    }
  };

  // Heavy tap feedback - for major events
  const tapHeavy = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      // Silently fail
    }
  };

  // Success notification - for wins, achievements
  const notifySuccess = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      // Silently fail
    }
  };

  // Warning notification - for missed targets, near-fails
  const notifyWarning = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {
      // Silently fail
    }
  };

  // Error notification - for failures
  const notifyError = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {
      // Silently fail
    }
  };

  // Selection changed - ultra-light for scrolling/picking
  const selectionChanged = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch (e) {
      // Silently fail
    }
  };

  return {
    tapLight,
    tapMedium,
    tapHeavy,
    notifySuccess,
    notifyWarning,
    notifyError,
    selectionChanged,
  };
};

// Standalone functions for use outside React components
export const haptics = {
  tapLight: async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
  },
  tapMedium: async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {}
  },
  tapHeavy: async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {}
  },
  notifySuccess: async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {}
  },
  notifyWarning: async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {}
  },
  notifyError: async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {}
  },
  selectionChanged: async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch (e) {}
  },
};
