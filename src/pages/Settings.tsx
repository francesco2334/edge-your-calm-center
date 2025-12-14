import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, LogOut, Shield, FileText, ChevronRight, Mail, Bell, BellOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrial } from '@/hooks/useTrial';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';
import { MojoOrb } from '@/components/MojoOrb';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, signOut } = useAuth();
  const { daysRemaining, isActive: trialActive, hasAccepted: trialAccepted } = useTrial(user?.id);
  const { isSupported: pushSupported, permission, requestPermission } = usePushNotifications();

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

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
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

        {/* Trial Status */}
        {trialAccepted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="mb-6"
          >
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Subscription
            </h2>
            <div className="bg-muted/30 rounded-2xl border border-border/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {trialActive ? 'Free Trial' : 'Trial Expired'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {trialActive ? `${daysRemaining} days remaining` : 'Upgrade to continue'}
                  </p>
                </div>
                {!trialActive && (
                  <button
                    onClick={() => toast({ title: 'Coming soon', description: 'Premium subscriptions launching soon!' })}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Legal Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
