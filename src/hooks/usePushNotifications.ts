import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

/**
 * NOTIFICATION RULES (App Store Compliant)
 * 
 * Only TWO notification types are allowed:
 * 1. STREAK WARNING: User hasn't logged today, streak expires in <12 hours
 * 2. TIME EXPIRED: Purchased time session has ended
 * 
 * NO marketing notifications
 * NO engagement pings  
 * NO random reminders
 */

interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permission: 'prompt' | 'granted' | 'denied';
}

// Notification copy - non-coercive, no guilt language
const NOTIFICATION_COPY = {
  streakWarning: {
    title: "Your streak is still intact",
    body: "If today mattered, come log it.",
  },
  timeExpired: {
    title: "Your chosen time has ended",
    body: "Come back when you're ready.",
  },
};

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    permission: 'prompt',
  });

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    setState(prev => ({ ...prev, isSupported: isNative }));

    if (!isNative) return;

    // Check current permission status for push notifications
    PushNotifications.checkPermissions().then(result => {
      setState(prev => ({ 
        ...prev, 
        permission: result.receive === 'granted' ? 'granted' : result.receive === 'denied' ? 'denied' : 'prompt'
      }));
    });

    // Check local notification permissions too
    LocalNotifications.checkPermissions().then(result => {
      if (result.display === 'granted') {
        setState(prev => ({ ...prev, permission: 'granted' }));
      }
    });

    // Set up push notification listeners
    const tokenListener = PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token:', token.value);
      setState(prev => ({ ...prev, isRegistered: true, token: token.value }));
      localStorage.setItem('dopa_push_token', token.value);
    });

    const errorListener = PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
      setState(prev => ({ ...prev, isRegistered: false }));
    });

    const notificationListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
      }
    );

    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Push action performed:', action);
      }
    );

    // Set up local notification listeners
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Local notification received:', notification);
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      console.log('Local notification action:', action);
    });

    return () => {
      tokenListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      notificationListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not supported on web');
      return false;
    }

    try {
      // Request both push and local notification permissions
      const pushResult = await PushNotifications.requestPermissions();
      const localResult = await LocalNotifications.requestPermissions();
      
      if (pushResult.receive === 'granted' || localResult.display === 'granted') {
        if (pushResult.receive === 'granted') {
          await PushNotifications.register();
        }
        setState(prev => ({ ...prev, permission: 'granted' }));
        return true;
      } else {
        setState(prev => ({ ...prev, permission: 'denied' }));
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  /**
   * Schedule a TIME EXPIRED notification
   * Called when user spends tokens for screen time
   */
  const scheduleTimeExpiredNotification = useCallback(async (
    activity: string,
    expiresAt: Date
  ): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications not supported on web');
      return false;
    }

    try {
      const notificationId = Date.now();
      
      const options: ScheduleOptions = {
        notifications: [
          {
            id: notificationId,
            title: NOTIFICATION_COPY.timeExpired.title,
            body: `Your ${activity} time has ended. Come back when you're ready.`,
            schedule: { at: expiresAt },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#7C3AED',
          },
        ],
      };

      await LocalNotifications.schedule(options);
      console.log(`Scheduled time-expired notification for ${expiresAt.toISOString()}`);
      
      // Store notification ID to cancel if user exits early
      const existingIds = JSON.parse(localStorage.getItem('dopa_scheduled_notifications') || '[]');
      existingIds.push(notificationId);
      localStorage.setItem('dopa_scheduled_notifications', JSON.stringify(existingIds));
      
      return true;
    } catch (error) {
      console.error('Error scheduling time-expired notification:', error);
      return false;
    }
  }, []);

  /**
   * Cancel scheduled time-expired notification (user exited early)
   */
  const cancelTimeExpiredNotification = useCallback(async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const existingIds = JSON.parse(localStorage.getItem('dopa_scheduled_notifications') || '[]');
      if (existingIds.length > 0) {
        await LocalNotifications.cancel({ notifications: existingIds.map((id: number) => ({ id })) });
        localStorage.setItem('dopa_scheduled_notifications', '[]');
        console.log('Cancelled scheduled notifications');
      }
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }, []);

  /**
   * Schedule a STREAK WARNING notification
   * Called daily to check if user needs a reminder
   */
  const scheduleStreakWarningNotification = useCallback(async (
    hoursUntilExpiry: number = 12
  ): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications not supported on web');
      return false;
    }

    try {
      // Schedule for when streak is about to expire
      const triggerTime = new Date();
      triggerTime.setHours(triggerTime.getHours() + hoursUntilExpiry);

      // Clear any existing streak warnings first
      await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });

      const options: ScheduleOptions = {
        notifications: [
          {
            id: 1001, // Fixed ID for streak warnings
            title: NOTIFICATION_COPY.streakWarning.title,
            body: NOTIFICATION_COPY.streakWarning.body,
            schedule: { at: triggerTime },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#7C3AED',
          },
        ],
      };

      await LocalNotifications.schedule(options);
      console.log(`Scheduled streak warning for ${triggerTime.toISOString()}`);
      return true;
    } catch (error) {
      console.error('Error scheduling streak warning:', error);
      return false;
    }
  }, []);

  /**
   * Cancel streak warning (user logged their daily pull)
   */
  const cancelStreakWarning = useCallback(async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
      console.log('Cancelled streak warning');
    } catch (error) {
      console.error('Error cancelling streak warning:', error);
    }
  }, []);

  return {
    ...state,
    requestPermission,
    scheduleTimeExpiredNotification,
    cancelTimeExpiredNotification,
    scheduleStreakWarningNotification,
    cancelStreakWarning,
  };
}
