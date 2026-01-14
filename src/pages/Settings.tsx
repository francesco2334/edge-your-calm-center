import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, LogOut, Shield, FileText, ChevronRight, Mail, Bell, BellOff, Download, RotateCcw, Crown, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInAppPurchases } from '@/hooks/useInAppPurchases';
import { useTrial } from '@/hooks/useTrial';
import { useOnboarding } from '@/hooks/useOnboarding';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';
import { MojoOrb } from '@/components/MojoOrb';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, signOut } = useAuth();
  
  const { isSupported: pushSupported, permission, requestPermission } = usePushNotifications();
  const { purchaseState, isRestoring, restorePurchases, isNative } = useInAppPurchases();
  const { isTrialActive, daysRemaining } = useTrial();
  const [isExporting, setIsExporting] = useState(false);

  const handleRestorePurchases = async () => {
    const restored = await restorePurchases();
    if (restored) {
      toast({
        title: 'Purchases restored',
        description: 'Your subscription has been restored successfully.'
      });
    } else {
      toast({
        title: 'No purchases found',
        description: 'No previous purchases were found for this account.',
        variant: 'destructive'
      });
    }
  };

  const handleExportData = () => {
    setIsExporting(true);
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: user?.id || 'anonymous',
        email: user?.email || null,
        data: {
          tokenEconomy: JSON.parse(localStorage.getItem('dopamine_token_economy') || '{}'),
          dailyQuestions: JSON.parse(localStorage.getItem('daily_question_data') || '{}'),
          learnProgress: JSON.parse(localStorage.getItem('learn_progress') || '{}'),
          progressActivities: JSON.parse(localStorage.getItem('progress_activities') || '[]'),
          weeklyReflections: JSON.parse(localStorage.getItem('progress_weekly_reflections') || '[]'),
          monthlySummaries: JSON.parse(localStorage.getItem('progress_monthly_summaries') || '[]'),
          trophies: JSON.parse(localStorage.getItem('progress_trophies') || '[]'),
          monthlyNotes: JSON.parse(localStorage.getItem('progress_monthly_notes') || '[]'),
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dopamine-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data exported',
        description: 'Your data has been downloaded as JSON'
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export your data',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'See you soon'
      });
      navigate('/');
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: 'Notifications enabled',
        description: "We'll send you helpful reminders"
      });
    } else {
      toast({
        title: 'Notifications blocked',
        description: 'You can enable them in your device settings',
        variant: 'destructive'
      });
    }
  };

  const { resetOnboarding } = useOnboarding(user?.id);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetOnboarding = async () => {
    setIsResetting(true);
    try {
      await resetOnboarding();
      toast({
        title: 'Onboarding reset',
        description: 'Restart the app to go through onboarding again'
      });
    } catch (error) {
      toast({
        title: 'Reset failed',
        description: 'Could not reset onboarding',
        variant: 'destructive'
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8 safe-area-inset">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 pt-safe-top"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <h1 className="text-2xl font-bold text-foreground mb-8">Settings</h1>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/30">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              {isAuthenticated ? (
                <span className="text-xl font-semibold text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              {isAuthenticated ? (
                <>
                  <p className="font-medium text-foreground">
                    {user?.user_metadata?.username || 'DopaMINE User'}
                  </p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground">Not signed in</p>
                  <p className="text-sm text-muted-foreground">Sign in to save your progress</p>
                </>
              )}
            </div>
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </motion.div>

        {/* Account Section */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Account
            </h2>
            <div className="bg-muted/30 rounded-2xl border border-border/30 overflow-hidden">
              <div className="flex items-center gap-4 p-4 border-b border-border/20">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-4 p-4 w-full hover:bg-muted/50 transition-colors"
              >
                <LogOut className="w-5 h-5 text-destructive" />
                <span className="text-sm font-medium text-destructive">Sign out</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Notifications Section */}
        {pushSupported && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Notifications
            </h2>
            <div className="bg-muted/30 rounded-2xl border border-border/30 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {permission === 'granted' ? (
                  <Bell className="w-5 h-5 text-primary" />
                ) : (
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {permission === 'granted' ? 'Enabled' : 'Get daily reminders'}
                  </p>
                </div>
                <Switch
                  checked={permission === 'granted'}
                  onCheckedChange={handleEnableNotifications}
                  disabled={permission === 'denied'}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Subscription Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-6"
        >
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Subscription
          </h2>
          <div className="bg-muted/30 rounded-2xl border border-border/30 overflow-hidden">
            <div className="flex items-center gap-4 p-4 border-b border-border/20">
              {isTrialActive ? (
                <Clock className="w-5 h-5 text-primary" />
              ) : (
                <Crown className={`w-5 h-5 ${purchaseState.isSubscribed ? 'text-amber-500' : 'text-muted-foreground'}`} />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {purchaseState.isSubscribed 
                    ? 'Premium Active' 
                    : isTrialActive 
                      ? 'Free Trial' 
                      : 'Free'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {purchaseState.isSubscribed 
                    ? purchaseState.expirationDate 
                      ? `Renews ${purchaseState.expirationDate.toLocaleDateString()}`
                      : 'Lifetime access'
                    : isTrialActive
                      ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                      : 'Upgrade for full access'}
                </p>
              </div>
              {!purchaseState.isSubscribed && (
                <Link
                  to="/subscribe"
                  className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Upgrade
                </Link>
              )}
            </div>
            {isNative && (
              <button
                onClick={handleRestorePurchases}
                disabled={isRestoring}
                className="flex items-center gap-4 p-4 w-full hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-primary ${isRestoring ? 'animate-spin' : ''}`} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">Restore Purchases</p>
                  <p className="text-xs text-muted-foreground">Recover previous subscriptions</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Data Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Your Data
          </h2>
          <div className="bg-muted/30 rounded-2xl border border-border/30 overflow-hidden">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center gap-4 p-4 w-full hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5 text-primary" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Export Data</p>
                <p className="text-xs text-muted-foreground">Download usage stats & activity history</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Legal Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mb-6"
        >
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Legal
          </h2>
          <div className="bg-muted/30 rounded-2xl border border-border/30 overflow-hidden">
            <Link
              to="/privacy"
              className="flex items-center gap-4 p-4 border-b border-border/20 hover:bg-muted/50 transition-colors"
            >
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-foreground">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link
              to="/terms"
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-foreground">Terms of Service</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </motion.div>

        {/* Developer/Debug Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mb-6"
        >
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Developer
          </h2>
          <div className="bg-muted/30 rounded-2xl border border-border/30 overflow-hidden">
            <button
              onClick={handleResetOnboarding}
              disabled={isResetting}
              className="flex items-center gap-4 p-4 w-full hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-5 h-5 text-amber-500 ${isResetting ? 'animate-spin' : ''}`} />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Reset Onboarding</p>
                <p className="text-xs text-muted-foreground">Go through setup again</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            About
          </h2>
          <div className="bg-muted/30 rounded-2xl border border-border/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <MojoOrb state="calm" size="sm" />
              <div>
                <p className="text-sm font-medium text-foreground">DopaMINE</p>
                <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A behavioral awareness and self-regulation app. Mojo is your AI companion for building 
              healthier attention patterns—not a therapist or medical service.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
