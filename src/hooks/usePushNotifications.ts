import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';

interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permission: 'prompt' | 'granted' | 'denied';
}

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

    // Check current permission status
    PushNotifications.checkPermissions().then(result => {
      setState(prev => ({ 
        ...prev, 
        permission: result.receive === 'granted' ? 'granted' : result.receive === 'denied' ? 'denied' : 'prompt'
      }));
    });

    // Set up listeners
    const tokenListener = PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token:', token.value);
      setState(prev => ({ ...prev, isRegistered: true, token: token.value }));
      
      // Store token for later use (e.g., send to backend)
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
        // Handle foreground notification
      }
    );

    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Push action performed:', action);
        // Handle notification tap
      }
    );

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
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        await PushNotifications.register();
        setState(prev => ({ ...prev, permission: 'granted' }));
        return true;
      } else {
        setState(prev => ({ ...prev, permission: 'denied' }));
        return false;
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return false;
    }
  }, []);

  const scheduleLocalReminder = useCallback(async (title: string, body: string, delayMinutes: number = 60) => {
    if (!Capacitor.isNativePlatform()) return;

    // For local reminders, we'd use Local Notifications plugin
    // This is a placeholder for the concept
    console.log(`Would schedule reminder: ${title} - ${body} in ${delayMinutes} minutes`);
  }, []);

  return {
    ...state,
    requestPermission,
    scheduleLocalReminder,
  };
}
