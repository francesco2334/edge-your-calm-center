import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * StoreKit 2 Integration via Capacitor
 * 
 * This hook provides the TypeScript interface for native StoreKit purchases.
 * The actual native implementation must be done in your Xcode project.
 * 
 * NATIVE SETUP REQUIRED:
 * 1. Add StoreKit capability in Xcode
 * 2. Configure products in App Store Connect
 * 3. Create Products.storekit for testing
 * 4. Implement native Swift code (see below)
 */

// Product IDs - must match App Store Connect
export const PRODUCT_IDS = {
  MONTHLY: 'com.dopamine.app.premium.monthly',
} as const;

export interface PurchaseState {
  isSubscribed: boolean;
  activeProduct: string | null;
  expirationDate: Date | null;
  isInTrial: boolean;
}

export interface Product {
  id: string;
  displayName: string;
  displayPrice: string;
  description: string;
}

// Native bridge interface - implement in Swift
interface NativeStoreKit {
  getProducts(productIds: string[]): Promise<Product[]>;
  purchase(productId: string): Promise<{ success: boolean; transactionId?: string }>;
  restorePurchases(): Promise<{ restored: boolean; products: string[] }>;
  checkEntitlements(): Promise<PurchaseState>;
}

// Mock for web/development
const mockStoreKit: NativeStoreKit = {
  async getProducts() {
    return [{
      id: PRODUCT_IDS.MONTHLY,
      displayName: 'Premium Monthly',
      displayPrice: '£7.99',
      description: 'Full access to all features',
    }];
  },
  async purchase() {
    console.log('[StoreKit Mock] Purchase would happen natively');
    return { success: false };
  },
  async restorePurchases() {
    console.log('[StoreKit Mock] Restore would happen natively');
    return { restored: false, products: [] };
  },
  async checkEntitlements() {
    return {
      isSubscribed: false,
      activeProduct: null,
      expirationDate: null,
      isInTrial: false,
    };
  },
};

// Get native bridge or mock
function getStoreKit(): NativeStoreKit {
  if (Capacitor.isNativePlatform() && (window as any).NativeStoreKit) {
    return (window as any).NativeStoreKit;
  }
  return mockStoreKit;
}

export function useInAppPurchases() {
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    isSubscribed: false,
    activeProduct: null,
    expirationDate: null,
    isInTrial: false,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Check entitlements on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const storeKit = getStoreKit();
        const [entitlements, fetchedProducts] = await Promise.all([
          storeKit.checkEntitlements(),
          storeKit.getProducts([PRODUCT_IDS.MONTHLY]),
        ]);
        setPurchaseState(entitlements);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('[StoreKit] Error checking status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  // Purchase a product
  const purchase = useCallback(async (productId: string): Promise<boolean> => {
    if (!isNative) {
      console.log('[StoreKit] Purchases only available on native');
      return false;
    }

    setIsPurchasing(true);
    try {
      const storeKit = getStoreKit();
      const result = await storeKit.purchase(productId);
      
      if (result.success) {
        // Refresh entitlements after purchase
        const entitlements = await storeKit.checkEntitlements();
        setPurchaseState(entitlements);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[StoreKit] Purchase error:', error);
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [isNative]);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      console.log('[StoreKit] Restore only available on native');
      return false;
    }

    setIsRestoring(true);
    try {
      const storeKit = getStoreKit();
      const result = await storeKit.restorePurchases();
      
      if (result.restored) {
        const entitlements = await storeKit.checkEntitlements();
        setPurchaseState(entitlements);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[StoreKit] Restore error:', error);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [isNative]);

  // Subscribe to monthly plan (convenience method)
  const subscribeMonthly = useCallback(() => {
    return purchase(PRODUCT_IDS.MONTHLY);
  }, [purchase]);

  return {
    // State
    purchaseState,
    products,
    isLoading,
    isPurchasing,
    isRestoring,
    isNative,
    
    // Actions
    purchase,
    restorePurchases,
    subscribeMonthly,
    
    // Helpers
    isSubscribed: purchaseState.isSubscribed,
    monthlyProduct: products.find(p => p.id === PRODUCT_IDS.MONTHLY),
  };
}

/**
 * NATIVE SWIFT IMPLEMENTATION
 * Add this to your iOS project's AppDelegate or a dedicated StoreKit manager:
 * 
 * ```swift
 * import StoreKit
 * import WebKit
 * 
 * @MainActor
 * class StoreKitManager: ObservableObject {
 *     static let shared = StoreKitManager()
 *     
 *     private var products: [Product] = []
 *     private var updateListenerTask: Task<Void, Error>?
 *     
 *     init() {
 *         updateListenerTask = listenForTransactions()
 *     }
 *     
 *     func listenForTransactions() -> Task<Void, Error> {
 *         return Task.detached {
 *             for await result in Transaction.updates {
 *                 guard case .verified(let transaction) = result else { continue }
 *                 await transaction.finish()
 *             }
 *         }
 *     }
 *     
 *     func getProducts(ids: [String]) async throws -> [Product] {
 *         products = try await Product.products(for: Set(ids))
 *         return products
 *     }
 *     
 *     func purchase(_ product: Product) async throws -> Transaction? {
 *         let result = try await product.purchase()
 *         switch result {
 *         case .success(let verification):
 *             guard case .verified(let transaction) = verification else { return nil }
 *             await transaction.finish()
 *             return transaction
 *         case .pending, .userCancelled:
 *             return nil
 *         @unknown default:
 *             return nil
 *         }
 *     }
 *     
 *     func checkEntitlements() async -> Bool {
 *         for await result in Transaction.currentEntitlements {
 *             guard case .verified(_) = result else { continue }
 *             return true
 *         }
 *         return false
 *     }
 *     
 *     func restorePurchases() async throws {
 *         try await AppStore.sync()
 *     }
 * }
 * ```
 * 
 * Then expose to WebView via JavaScript bridge:
 * ```swift
 * webView.evaluateJavaScript("""
 *     window.NativeStoreKit = {
 *         getProducts: (ids) => webkit.messageHandlers.storekit.postMessage({action: 'getProducts', ids}),
 *         purchase: (id) => webkit.messageHandlers.storekit.postMessage({action: 'purchase', id}),
 *         restorePurchases: () => webkit.messageHandlers.storekit.postMessage({action: 'restore'}),
 *         checkEntitlements: () => webkit.messageHandlers.storekit.postMessage({action: 'check'})
 *     };
 * """)
 * ```
 */
