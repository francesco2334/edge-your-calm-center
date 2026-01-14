import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Product IDs - configure these in App Store Connect
export const PRODUCT_IDS = {
  monthly: 'dopamine_monthly',
  yearly: 'dopamine_yearly',
  lifetime: 'dopamine_lifetime',
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

interface Product {
  identifier: string;
  title: string;
  description: string;
  priceString: string;
  price: number;
}

interface PurchaseState {
  isSubscribed: boolean;
  activeProduct: string | null;
  expirationDate: Date | null;
}

export function useInAppPurchases() {
  const [isReady, setIsReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    isSubscribed: false,
    activeProduct: null,
    expirationDate: null,
  });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Initialize RevenueCat
  useEffect(() => {
    async function initPurchases() {
      if (!isNative) {
        // In web, assume no subscription (or check via backend)
        setIsReady(true);
        return;
      }

      try {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        
        // Configure with your RevenueCat API key
        // You'll need to set this up in RevenueCat dashboard
        const apiKey = Capacitor.getPlatform() === 'ios' 
          ? 'appl_YOUR_REVENUECAT_IOS_API_KEY' // Replace with your key
          : 'goog_YOUR_REVENUECAT_ANDROID_API_KEY'; // Replace with your key
        
        await Purchases.configure({ apiKey });
        
        // Get available products
        const offerings = await Purchases.getOfferings();
        if (offerings.current?.availablePackages) {
          const availableProducts = offerings.current.availablePackages.map(pkg => ({
            identifier: pkg.product.identifier,
            title: pkg.product.title,
            description: pkg.product.description,
            priceString: pkg.product.priceString,
            price: pkg.product.price,
          }));
          setProducts(availableProducts);
        }
        
        // Check current subscription status
        await checkSubscriptionStatus();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize purchases:', error);
        setIsReady(true);
      }
    }

    initPurchases();
  }, [isNative]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!isNative) return;

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const customerInfo = await Purchases.getCustomerInfo();
      
      const activeSubscriptions = customerInfo.customerInfo.activeSubscriptions;
      const isSubscribed = activeSubscriptions.length > 0;
      
      // Get entitlements for more details
      const entitlements = customerInfo.customerInfo.entitlements.active;
      const premiumEntitlement = entitlements['premium'] || entitlements['pro'];
      
      setPurchaseState({
        isSubscribed,
        activeProduct: activeSubscriptions[0] || null,
        expirationDate: premiumEntitlement?.expirationDate 
          ? new Date(premiumEntitlement.expirationDate) 
          : null,
      });
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  }, [isNative]);

  const purchase = useCallback(async (productId: ProductId): Promise<boolean> => {
    if (!isNative) {
      console.log('Purchases only available on native platforms');
      return false;
    }

    setIsPurchasing(true);
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      
      // Get the package for this product
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        p => p.product.identifier === productId
      );
      
      if (!pkg) {
        throw new Error('Product not found');
      }

      // Make the purchase
      const result = await Purchases.purchasePackage({ aPackage: pkg });
      
      // Update subscription state
      const activeSubscriptions = result.customerInfo.activeSubscriptions;
      setPurchaseState({
        isSubscribed: activeSubscriptions.length > 0,
        activeProduct: activeSubscriptions[0] || null,
        expirationDate: null, // Update from entitlements if needed
      });
      
      return true;
    } catch (error: any) {
      // User cancelled or error
      if (error.code !== 'PURCHASE_CANCELLED') {
        console.error('Purchase failed:', error);
      }
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [isNative]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      console.log('Restore only available on native platforms');
      return false;
    }

    setIsRestoring(true);
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const customerInfo = await Purchases.restorePurchases();
      
      const activeSubscriptions = customerInfo.customerInfo.activeSubscriptions;
      const isSubscribed = activeSubscriptions.length > 0;
      
      setPurchaseState({
        isSubscribed,
        activeProduct: activeSubscriptions[0] || null,
        expirationDate: null,
      });
      
      return isSubscribed;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [isNative]);

  // Identify user for cross-device sync
  const identifyUser = useCallback(async (userId: string) => {
    if (!isNative) return;

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      await Purchases.logIn({ appUserID: userId });
      await checkSubscriptionStatus();
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }, [isNative, checkSubscriptionStatus]);

  return {
    isReady,
    isNative,
    products,
    purchaseState,
    isPurchasing,
    isRestoring,
    purchase,
    restorePurchases,
    identifyUser,
    checkSubscriptionStatus,
    PRODUCT_IDS,
  };
}
