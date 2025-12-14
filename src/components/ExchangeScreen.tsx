import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TokenCounter } from './TokenCounter';
import { FocusTimer } from './FocusTimer';
import { EarnConfirmModal } from './EarnConfirmModal';
import { EARN_OPTIONS, SPEND_OPTIONS } from '@/lib/token-data';
import { useToast } from '@/hooks/use-toast';

interface ExchangeScreenProps {
  balance: number;
  onEarn: (amount: number, reason: string) => void;
  onSpend: (amount: number, reason: string) => boolean;
  onBack: () => void;
}

type ActiveTimer = {
  minutes: number;
  tokensReward: number;
  label: string;
} | null;

type ConfirmOption = typeof EARN_OPTIONS[0] | null;

export function ExchangeScreen({ balance, onEarn, onSpend, onBack }: ExchangeScreenProps) {
  const [activeTab, setActiveTab] = useState<'earn' | 'spend'>('earn');
  const [activeTimer, setActiveTimer] = useState<ActiveTimer>(null);
  const [confirmOption, setConfirmOption] = useState<ConfirmOption>(null);
  const { toast } = useToast();

  const handleEarnClick = (option: typeof EARN_OPTIONS[0]) => {
    // Timer-based options (focus sessions)
    if (option.id === 'focus-10' || option.id === 'focus-25') {
      setActiveTimer({
        minutes: option.earnMinutes,
        tokensReward: option.tokensEarned,
        label: option.label,
      });
      return;
    }

    // Self-report options - show confirmation modal
    setConfirmOption(option);
  };

  const handleTimerComplete = () => {
    if (activeTimer) {
      onEarn(activeTimer.tokensReward, activeTimer.label);
      toast({
        title: `+${activeTimer.tokensReward} Token${activeTimer.tokensReward > 1 ? 's' : ''} earned!`,
        description: `Great focus session: ${activeTimer.label}`,
      });
      setActiveTimer(null);
    }
  };

  const handleConfirmEarn = () => {
    if (confirmOption) {
      onEarn(confirmOption.tokensEarned, confirmOption.label);
      toast({
        title: `+${confirmOption.tokensEarned} Token${confirmOption.tokensEarned > 1 ? 's' : ''}`,
        description: confirmOption.label,
      });
      setConfirmOption(null);
    }
  };

  const handleSpend = (option: typeof SPEND_OPTIONS[0]) => {
    if (balance < option.tokenCost) {
      toast({
        title: "Not enough tokens",
        description: `You need ${option.tokenCost} tokens for this.`,
        variant: "destructive",
      });
      return;
    }
    
    const success = onSpend(option.tokenCost, option.label);
    if (success) {
      toast({
        title: `${option.minutes} minutes unlocked`,
        description: `Enjoy your ${option.label.toLowerCase()}. Exit early for a refund.`,
      });
    }
  };

  // Show focus timer fullscreen
  if (activeTimer) {
    return (
      <FocusTimer
        minutes={activeTimer.minutes}
        tokensReward={activeTimer.tokensReward}
        label={activeTimer.label}
        onComplete={handleTimerComplete}
        onCancel={() => setActiveTimer(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-pulse opacity-25" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <TokenCounter balance={balance} size="sm" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">The Exchange</h1>
          <p className="text-muted-foreground">
            You're not banning dopamine. You're pricing it.
          </p>
        </motion.div>

        {/* Balance display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <TokenCounter balance={balance} size="lg" />
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 p-1.5 bg-dopa-surface rounded-xl mb-6"
        >
          {(['earn', 'spend'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'earn' ? '⚡ Earn Tokens' : '💸 Spend Tokens'}
            </button>
          ))}
        </motion.div>

        {/* Options */}
        <AnimatePresence mode="wait">
          {activeTab === 'earn' ? (
            <motion.div
              key="earn"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {EARN_OPTIONS.map((option, i) => {
                const isTimerBased = option.id === 'focus-10' || option.id === 'focus-25';
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleEarnClick(option)}
                    className="dopa-card cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">+{option.tokensEarned}</p>
                      <p className="text-xs text-muted-foreground">
                        {isTimerBased ? `${option.earnMinutes} min` : 'tokens'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="spend"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {SPEND_OPTIONS.map((option, i) => {
                const canAfford = balance >= option.tokenCost;
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSpend(option)}
                    className={`dopa-card cursor-pointer flex items-center justify-between group ${
                      !canAfford ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${canAfford ? 'text-accent' : 'text-muted-foreground'}`}>
                        -{option.tokenCost}
                      </p>
                      <p className="text-xs text-muted-foreground">{option.minutes} min</p>
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Refund hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-sm text-muted-foreground mt-6 italic"
              >
                Exit early → get a partial refund. Agency, not abstinence.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Earn Confirmation Modal */}
      {confirmOption && (
        <EarnConfirmModal
          isOpen={!!confirmOption}
          option={confirmOption}
          onConfirm={handleConfirmEarn}
          onCancel={() => setConfirmOption(null)}
        />
      )}
    </div>
  );
}
