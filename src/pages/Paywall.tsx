import { useNavigate } from 'react-router-dom';
import { useInAppPurchases } from '@/hooks/useInAppPurchases';
import { useToast } from '@/hooks/use-toast';
import { PaywallScreen } from '@/components/PaywallScreen';

export default function Paywall() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isRestoring, 
    isPurchasing,
    restorePurchases, 
    subscribeMonthly,
    isNative,
    monthlyProduct,
  } = useInAppPurchases();

  const handleSubscribe = async () => {
    if (!isNative) {
      toast({
        title: 'Subscriptions available on iOS',
        description: 'Download the app to subscribe.',
      });
      return;
    }

    const success = await subscribeMonthly();
    if (success) {
      toast({
        title: 'Welcome to Premium!',
        description: 'You now have full access to all features.',
      });
      navigate('/');
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
      isPurchasing={isPurchasing}
      price={monthlyProduct?.displayPrice}
    />
  );
}