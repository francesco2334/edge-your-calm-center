import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChargeCounter } from './ChargeCounter';
import { EARN_OPTIONS, ALLOCATION_OPTIONS, type AllocationSession } from '@/lib/charge-data';
import { useToast } from '@/hooks/use-toast';
import { MojoOrb } from './MojoOrb';

interface AllocateScreenProps {
  balance: number;
  activeSession: AllocationSession | null;
  onEarn: (amount: number, reason: string) => void;
  onAllocate: (amount: number, activity: string, minutes: number) => boolean;
  onCompleteSession: (outcome: 'stayed' | 'over' | 'early') => void;
  onBack: () => void;
}

export function AllocateScreen({ 
  balance, 
  activeSession,
  onEarn, 
  onAllocate, 
  onCompleteSession,
  onBack 
}: AllocateScreenProps) {
  const [view, setView] = useState<'main' | 'earn' | 'allocate' | 'active' | 'checkin'>(
    activeSession ? 'active' : 'main'
  );
  const [selectedActivity, setSelectedActivity] = useState<typeof ALLOCATION_OPTIONS[0] | null>(null);
  const [chargeAmount, setChargeAmount] = useState(1);
  const { toast } = useToast();

  const handleEarn = (option: typeof EARN_OPTIONS[0]) => {
    onEarn(option.charge, option.label);
    toast({
      title: `+${option.charge} Charge`,
      description: option.label,
    });
  };

  const handleSelectActivity = (activity: typeof ALLOCATION_OPTIONS[0]) => {
    setSelectedActivity(activity);
    setChargeAmount(1);
    setView('allocate');
  };

  const handleConfirmAllocation = () => {
    if (!selectedActivity) return;
    
    const minutes = chargeAmount * selectedActivity.minutesPerUnit;
    const totalCost = chargeAmount * selectedActivity.chargePerUnit;
    
    if (balance < totalCost) {
      toast({
        title: "Not enough Charge",
        description: `You need ${totalCost} Charge for this.`,
        variant: "destructive",
      });
      return;
    }
    
    const success = onAllocate(totalCost, selectedActivity.label, minutes);
    if (success) {
      toast({
        title: `${minutes} minutes planned`,
        description: `Mojo will check in when you're done.`,
      });
      setView('active');
    }
  };

  const handleCheckIn = (outcome: 'stayed' | 'over' | 'early') => {
    onCompleteSession(outcome);
    const messages = {
      stayed: { title: '+1 Charge', desc: 'You kept your word to yourself.' },
      over: { title: 'Logged', desc: 'No penalty. Just data.' },
      early: { title: '+2 Charge', desc: 'That takes real control.' },
    };
    toast({
      title: messages[outcome].title,
      description: messages[outcome].desc,
    });
    setView('main');
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-pulse opacity-20" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button 
            onClick={view === 'main' || view === 'active' ? onBack : () => setView('main')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {view === 'main' || view === 'active' ? 'Back' : 'Cancel'}
          </button>
          <ChargeCounter balance={balance} size="sm" />
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Main View */}
          {view === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Title */}
              <div className="text-center mb-8">
                <div className="w-full flex justify-center mb-4">
                  <MojoOrb state="calm" size="lg" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">The Exchange</h1>
                <p className="text-muted-foreground">
                  You're not banning dopamine. You're pricing it.
                </p>
              </div>

              {/* Main actions */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('earn')}
                  className="dopa-card text-center py-8 hover:border-primary/50 transition-all"
                >
                  <span className="text-4xl mb-3 block">⚡</span>
                  <p className="font-semibold text-foreground">Earn Charge</p>
                  <p className="text-xs text-muted-foreground mt-1">Build your balance</p>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('allocate')}
                  className="dopa-card text-center py-8 hover:border-primary/50 transition-all"
                >
                  <span className="text-4xl mb-3 block">🎯</span>
                  <p className="font-semibold text-foreground">Allocate</p>
                  <p className="text-xs text-muted-foreground mt-1">Plan before acting</p>
                </motion.button>
              </div>

              {/* Current balance display */}
              <div className="flex justify-center">
                <ChargeCounter balance={balance} size="lg" />
              </div>
            </motion.div>
          )}

          {/* Earn View */}
          {view === 'earn' && (
            <motion.div
              key="earn"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Earn Charge</h2>
              <p className="text-muted-foreground mb-6">Complete actions to build your balance.</p>

              <div className="space-y-3">
                {EARN_OPTIONS.map((option, i) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleEarn(option)}
                    className="dopa-card cursor-pointer flex items-center justify-between group hover:border-primary/40"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">+{option.charge}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Allocate Activity Selection */}
          {view === 'allocate' && !selectedActivity && (
            <motion.div
              key="allocate-select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">What are you about to do?</h2>
              <p className="text-muted-foreground mb-6">Allocate Charge before high-stim activity.</p>

              <div className="space-y-3">
                {ALLOCATION_OPTIONS.map((option, i) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSelectActivity(option)}
                    className="dopa-card cursor-pointer flex items-center justify-between group hover:border-primary/40"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {option.chargePerUnit} = {option.minutesPerUnit}min
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Allocate Amount Selection */}
          {view === 'allocate' && selectedActivity && (
            <motion.div
              key="allocate-amount"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button 
                onClick={() => setSelectedActivity(null)}
                className="text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                ← Change activity
              </button>

              <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">{selectedActivity.icon}</span>
                <h2 className="text-2xl font-bold text-foreground mb-2">{selectedActivity.label}</h2>
                <p className="text-muted-foreground">How much Charge will you allocate?</p>
              </div>

              {/* Amount selector */}
              <div className="dopa-card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setChargeAmount(Math.max(1, chargeAmount - 1))}
                    className="w-12 h-12 rounded-full bg-dopa-surface border border-border/30 text-foreground text-xl font-bold hover:border-primary/40"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{chargeAmount * selectedActivity.chargePerUnit}</p>
                    <p className="text-sm text-muted-foreground">Charge</p>
                  </div>
                  <button
                    onClick={() => setChargeAmount(chargeAmount + 1)}
                    className="w-12 h-12 rounded-full bg-dopa-surface border border-border/30 text-foreground text-xl font-bold hover:border-primary/40"
                  >
                    +
                  </button>
                </div>

                <div className="text-center py-4 bg-dopa-surface rounded-xl">
                  <p className="text-sm text-muted-foreground">That's about</p>
                  <p className="text-2xl font-bold text-foreground">
                    {chargeAmount * selectedActivity.minutesPerUnit} minutes
                  </p>
                </div>
              </div>

              {/* Mojo question */}
              <div className="dopa-card mb-6 border-primary/30">
                <div className="flex items-start gap-3">
                  <MojoOrb state="calm" size="sm" />
                  <div>
                    <p className="text-foreground font-medium">
                      High-intensity input costs energy.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Want me to check in after {chargeAmount * selectedActivity.minutesPerUnit} minutes?
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirm button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmAllocation}
                disabled={balance < chargeAmount * selectedActivity.chargePerUnit}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  balance >= chargeAmount * selectedActivity.chargePerUnit
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {balance >= chargeAmount * selectedActivity.chargePerUnit
                  ? `Allocate ${chargeAmount * selectedActivity.chargePerUnit} Charge`
                  : `Need ${chargeAmount * selectedActivity.chargePerUnit - balance} more Charge`
                }
              </motion.button>
            </motion.div>
          )}

          {/* Active Session View */}
          {view === 'active' && activeSession && (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="w-full flex justify-center mb-6">
                <MojoOrb state="regulating" size="lg" />
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">Session Active</h2>
              <p className="text-muted-foreground mb-8">
                {activeSession.suggestedMinutes} minutes of {activeSession.activity}
              </p>

              <div className="dopa-card mb-8">
                <p className="text-5xl font-bold text-primary mb-2">
                  {activeSession.chargeAllocated}
                </p>
                <p className="text-sm text-muted-foreground">Charge allocated</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('checkin')}
                className="w-full py-4 rounded-xl font-semibold bg-primary text-primary-foreground shadow-glow"
              >
                I'm Done
              </motion.button>
            </motion.div>
          )}

          {/* Check-in View */}
          {view === 'checkin' && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <div className="w-full flex justify-center mb-4">
                  <MojoOrb state="calm" size="lg" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Quick Check-in</h2>
                <p className="text-muted-foreground">
                  Did you stay within what you planned?
                </p>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCheckIn('stayed')}
                  className="w-full dopa-card py-5 text-left hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-emerald-400">
                        Stayed within
                      </p>
                      <p className="text-sm text-muted-foreground">I kept my word</p>
                    </div>
                    <span className="text-emerald-400 font-bold">+1</span>
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCheckIn('early')}
                  className="w-full dopa-card py-5 text-left hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary">
                        Exited early
                      </p>
                      <p className="text-sm text-muted-foreground">I left before time was up</p>
                    </div>
                    <span className="text-primary font-bold">+2</span>
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCheckIn('over')}
                  className="w-full dopa-card py-5 text-left hover:border-amber-500/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-amber-400">
                        Went over
                      </p>
                      <p className="text-sm text-muted-foreground">No penalty, just data</p>
                    </div>
                    <span className="text-muted-foreground">—</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
