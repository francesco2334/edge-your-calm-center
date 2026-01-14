import { useNavigate } from 'react-router-dom';
import { useInAppPurchases } from '@/hooks/useInAppPurchases';
import { useToast } from '@/hooks/use-toast';
import { PaywallScreen } from '@/components/PaywallScreen';

export default function Paywall() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isRestoring, restorePurchases, isNative } = useInAppPurchases();

  const handleSubscribe = () => {
    if (isNative) {
      // Native StoreKit purchase will be triggered here
      // Implement in Xcode with Product.products(for:) and product.purchase()
      toast({
        title: 'Opening App Store...',
        description: 'Complete your purchase in the App Store.',
      });
    } else {
      toast({
        title: 'Subscriptions available on iOS',
        description: 'Download the app to subscribe.',
      });
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      toast({
        title: 'Purchases restored',
        description: 'Your subscription has been restored.',
      });
      navigate('/');
    } else {
      toast({
        title: 'No purchases found',
        description: 'No previous purchases were found.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PaywallScreen
      onClose={() => navigate(-1)}
      onSubscribe={handleSubscribe}
      onRestore={handleRestore}
      isRestoring={isRestoring}
    />
  );
}
