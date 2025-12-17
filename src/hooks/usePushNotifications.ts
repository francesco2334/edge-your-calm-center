import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

/**
 * NOTIFICATION RULES (App Store Compliant)
 * 
 * Allowed notification types:
 * 1. STREAK WARNING: User hasn't logged today, streak expires in <12 hours
 * 2. TIME EXPIRED: Purchased time session has ended - encourage earning more
 * 3. TROPHY PROGRESS: Close to earning a new trophy milestone
 * 4. DAILY REMINDER: Optional morning reminder to log activity
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

// Notification copy - encouraging but non-coercive
const NOTIFICATION_COPY = {
  streakWarning: {
    title: "Your streak is still intact",
    body: "If today mattered, come log it.",
  },
  timeExpired: {
    title: "Time's up!",
    body: "Your scroll time ended. Come back to earn more time.",
  },
  timeExpiredEarn: {
    title: "Ready for more?",
    body: "Play a game or read some cards to unlock more scroll time.",
  },
  trophyClose: {
    title: "Trophy incoming! 🏆",
    body: "You're just {days} days away from your next trophy.",
  },
  trophyEarned: {
    title: "Trophy Unlocked! 🎉",
    body: "You earned the {trophy} trophy! Keep going.",
  },
  dailyReminder: {
    title: "New day, new opportunity",
    body: "Log your daily pull to keep your streak alive.",
  },
};

// Notification IDs
const NOTIFICATION_IDS = {
  streakWarning: 1001,
  dailyReminder: 1002,
  trophyProgress: 1003,
  trophyEarned: 1004,
  timeExpiredBase: 2000, // Time expired uses dynamic IDs starting from this
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
   * Schedule a TIME EXPIRED notification with call-to-action to earn more
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
      const notificationId = NOTIFICATION_IDS.timeExpiredBase + Date.now() % 1000;
      
      // Schedule main time expired notification
      const options: ScheduleOptions = {
        notifications: [
          {
            id: notificationId,
            title: NOTIFICATION_COPY.timeExpired.title,
            body: `Your ${activity} time ended. Come back to earn more!`,
            schedule: { at: expiresAt },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#7C3AED',
            extra: { type: 'time-expired', action: 'earn-more' },
          },
        ],
      };

      await LocalNotifications.schedule(options);
      
      // Schedule follow-up notification 5 minutes later encouraging to earn more
      const followUpTime = new Date(expiresAt.getTime() + 5 * 60 * 1000);
      const followUpOptions: ScheduleOptions = {
        notifications: [
          {
            id: notificationId + 1,
            title: NOTIFICATION_COPY.timeExpiredEarn.title,
            body: NOTIFICATION_COPY.timeExpiredEarn.body,
            schedule: { at: followUpTime },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#7C3AED',
            extra: { type: 'earn-prompt' },
          },
        ],
      };
      
      await LocalNotifications.schedule(followUpOptions);
      console.log(`Scheduled time-expired notifications for ${expiresAt.toISOString()}`);
      
      // Store notification IDs to cancel if user exits early
      const existingIds = JSON.parse(localStorage.getItem('dopa_scheduled_notifications') || '[]');
      existingIds.push(notificationId, notificationId + 1);
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
      await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS.streakWarning }] });

      const options: ScheduleOptions = {
        notifications: [
          {
            id: NOTIFICATION_IDS.streakWarning,
            title: NOTIFICATION_COPY.streakWarning.title,
            body: NOTIFICATION_COPY.streakWarning.body,
            schedule: { at: triggerTime },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#7C3AED',
            extra: { type: 'streak-warning' },
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
      await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS.streakWarning }] });
      console.log('Cancelled streak warning');
    } catch (error) {
      console.error('Error cancelling streak warning:', error);
    }
  }, []);

  /**
   * Schedule TROPHY PROGRESS notification
   * Called when user is close to earning a new trophy
   */
  const scheduleTrophyProgressNotification = useCallback(async (
    daysRemaining: number,
    trophyName: string
  ): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications not supported on web');
      return false;
    }

    // Only notify when very close (within 7 days)
    if (daysRemaining > 7) return false;

    try {
      // Schedule for tomorrow morning at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      // Clear any existing trophy progress notifications
      await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS.trophyProgress }] });

      const body = NOTIFICATION_COPY.trophyClose.body.replace('{days}', String(daysRemaining));

      const options: ScheduleOptions = {
        notifications: [
          {
            id: NOTIFICATION_IDS.trophyProgress,
            title: NOTIFICATION_COPY.trophyClose.title,
            body,
            schedule: { at: tomorrow },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#FFD700',
            extra: { type: 'trophy-progress', trophy: trophyName },
          },
        ],
      };

      await LocalNotifications.schedule(options);
      console.log(`Scheduled trophy progress notification: ${daysRemaining} days to ${trophyName}`);
      return true;
    } catch (error) {
      console.error('Error scheduling trophy progress notification:', error);
      return false;
    }
  }, []);

  /**
   * Send immediate TROPHY EARNED notification
   */
  const sendTrophyEarnedNotification = useCallback(async (
    trophyName: string,
    trophyIcon: string
  ): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications not supported on web');
      return false;
    }

    try {
      const body = NOTIFICATION_COPY.trophyEarned.body.replace('{trophy}', trophyName);

      const options: ScheduleOptions = {
        notifications: [
          {
            id: NOTIFICATION_IDS.trophyEarned,
            title: `${trophyIcon} ${NOTIFICATION_COPY.trophyEarned.title}`,
            body,
            schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#FFD700',
            extra: { type: 'trophy-earned', trophy: trophyName },
          },
        ],
      };

      await LocalNotifications.schedule(options);
      console.log(`Sent trophy earned notification: ${trophyName}`);
      return true;
    } catch (error) {
      console.error('Error sending trophy earned notification:', error);
      return false;
    }
  }, []);

  /**
   * Schedule DAILY REMINDER notification
   * Called to remind users to log their daily activity
   */
  const scheduleDailyReminderNotification = useCallback(async (
    hour: number = 20 // Default 8 PM
  ): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Local notifications not supported on web');
      return false;
    }

    try {
      // Schedule for today at specified hour, or tomorrow if past that time
      const reminderTime = new Date();
      reminderTime.setHours(hour, 0, 0, 0);
      
      if (reminderTime <= new Date()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      // Clear any existing daily reminders
      await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS.dailyReminder }] });

      const options: ScheduleOptions = {
        notifications: [
          {
            id: NOTIFICATION_IDS.dailyReminder,
            title: NOTIFICATION_COPY.dailyReminder.title,
            body: NOTIFICATION_COPY.dailyReminder.body,
            schedule: { at: reminderTime },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#7C3AED',
            extra: { type: 'daily-reminder' },
          },
        ],
      };

      await LocalNotifications.schedule(options);
      console.log(`Scheduled daily reminder for ${reminderTime.toISOString()}`);
      return true;
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      return false;
    }
  }, []);

  /**
   * Cancel daily reminder (user already logged today)
   */
  const cancelDailyReminder = useCallback(async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS.dailyReminder }] });
      console.log('Cancelled daily reminder');
    } catch (error) {
      console.error('Error cancelling daily reminder:', error);
    }
  }, []);

  return {
    ...state,
    requestPermission,
    // Time management
    scheduleTimeExpiredNotification,
    cancelTimeExpiredNotification,
    // Streak management
    scheduleStreakWarningNotification,
    cancelStreakWarning,
    // Trophy progress
    scheduleTrophyProgressNotification,
    sendTrophyEarnedNotification,
    // Daily reminders
    scheduleDailyReminderNotification,
    cancelDailyReminder,
  };
}
