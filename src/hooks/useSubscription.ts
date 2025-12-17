import { useState, useEffect, useCallback } from 'react';

const SUBSCRIPTION_KEY = 'dopa_subscription_state';
const TRIAL_START_KEY = 'dopa_trial_start';
const TRIAL_DAYS = 7;

export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired';

interface SubscriptionState {
  status: SubscriptionStatus;
  trialDaysRemaining: number;
  isSubscribed: boolean;
  productId: string | null;
  expiresAt: string | null;
}

// App Store Connect Product IDs (must match your ASC configuration)
export const PRODUCT_IDS = {
  MONTHLY: 'com.dopamine.app.monthly',
  LIFETIME: 'com.dopamine.app.lifetime',
  TRIAL: 'com.dopamine.app.trial',
} as const;

export function useSubscription(userId?: string | null) {
  const [state, setState] = useState<SubscriptionState>({
    status: 'none',
    trialDaysRemaining: TRIAL_DAYS,
    isSubscribed: false,
    productId: null,
    expiresAt: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Calculate trial status from stored start date
  const calculateTrialStatus = useCallback((trialStart: string | null): { status: SubscriptionStatus; daysRemaining: number } => {
    if (!trialStart) {
      return { status: 'none', daysRemaining: TRIAL_DAYS };
    }

    const startDate = new Date(trialStart);
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, TRIAL_DAYS - diffDays);

    if (daysRemaining > 0) {
      return { status: 'trial', daysRemaining };
    }
    return { status: 'expired', daysRemaining: 0 };
  }, []);

  // Load subscription state
  useEffect(() => {
    async function loadState() {
      try {
        // Check for stored subscription (from receipt validation)
        const storedSubscription = localStorage.getItem(SUBSCRIPTION_KEY);
        if (storedSubscription) {
          const parsed = JSON.parse(storedSubscription);
          if (parsed.status === 'active' || parsed.status === 'lifetime') {
            setState({
              status: 'active',
              trialDaysRemaining: 0,
              isSubscribed: true,
              productId: parsed.productId,
              expiresAt: parsed.expiresAt,
            });
            setIsLoaded(true);
            return;
          }
        }

        // Check trial status
        const trialStart = localStorage.getItem(TRIAL_START_KEY);
        const { status, daysRemaining } = calculateTrialStatus(trialStart);

        setState({
          status,
          trialDaysRemaining: daysRemaining,
          isSubscribed: status === 'active',
          productId: null,
          expiresAt: null,
        });
      } catch (error) {
        console.error('Failed to load subscription state:', error);
      }
      setIsLoaded(true);
    }

    loadState();
  }, [userId, calculateTrialStatus]);

  // Start free trial
  const startTrial = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(TRIAL_START_KEY, now);
    
    setState({
      status: 'trial',
      trialDaysRemaining: TRIAL_DAYS,
      isSubscribed: false,
      productId: PRODUCT_IDS.TRIAL,
      expiresAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    });
  }, []);

  /**
   * Purchase subscription via App Store
   * This is a placeholder that will be replaced with actual StoreKit integration
   * In production, this would:
   * 1. Call native StoreKit APIs via Capacitor plugin
   * 2. Present the Apple payment sheet
   * 3. Handle the purchase result
   * 4. Validate receipt with backend
   */
  const purchase = useCallback(async (productId: string): Promise<{ success: boolean; error?: string }> => {
    setIsPurchasing(true);

    try {
      // Check if we're in a native context
      const isNative = typeof (window as any).Capacitor !== 'undefined';

      if (!isNative) {
        // Web fallback - just show that this needs native
        console.log('StoreKit purchase requires native app context');
        
        // For development/testing, simulate a successful purchase
        if (process.env.NODE_ENV === 'development') {
          const isLifetime = productId === PRODUCT_IDS.LIFETIME;
          
          localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({
            status: isLifetime ? 'lifetime' : 'active',
            productId,
            expiresAt: isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            purchasedAt: new Date().toISOString(),
          }));

          setState({
            status: 'active',
            trialDaysRemaining: 0,
            isSubscribed: true,
            productId,
            expiresAt: null,
          });

          return { success: true };
        }

        return { 
          success: false, 
          error: 'In-app purchases require the native iOS app. Please download from the App Store.' 
        };
      }

      // Native StoreKit integration would go here
      // Using @capacitor-community/in-app-purchases or similar
      
      // Placeholder for actual implementation:
      // const { InAppPurchase2 } = await import('@capacitor-community/in-app-purchases');
      // const products = await InAppPurchase2.getProducts([productId]);
      // const result = await InAppPurchase2.purchase(productId);
      // ... handle result, validate receipt, update state

      return { success: false, error: 'StoreKit not configured' };
    } catch (error) {
      console.error('Purchase failed:', error);
      return { success: false, error: 'Purchase failed. Please try again.' };
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  /**
   * Restore previous purchases
   * Used when user reinstalls or switches devices
   */
  const restorePurchases = useCallback(async (): Promise<{ success: boolean; restored: boolean; error?: string }> => {
    setIsPurchasing(true);

    try {
      const isNative = typeof (window as any).Capacitor !== 'undefined';

      if (!isNative) {
        // Check localStorage for any stored subscription
        const storedSubscription = localStorage.getItem(SUBSCRIPTION_KEY);
        if (storedSubscription) {
          const parsed = JSON.parse(storedSubscription);
          if (parsed.status === 'active' || parsed.status === 'lifetime') {
            setState({
              status: 'active',
              trialDaysRemaining: 0,
              isSubscribed: true,
              productId: parsed.productId,
              expiresAt: parsed.expiresAt,
            });
            return { success: true, restored: true };
          }
        }
        return { success: true, restored: false };
      }

      // Native restore would go here
      // const { InAppPurchase2 } = await import('@capacitor-community/in-app-purchases');
      // const result = await InAppPurchase2.restorePurchases();
      // ... validate receipts, update state

      return { success: true, restored: false };
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, restored: false, error: 'Restore failed. Please try again.' };
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  return {
    ...state,
    isLoaded,
    isPurchasing,
    startTrial,
    purchase,
    restorePurchases,
    PRODUCT_IDS,
  };
}
