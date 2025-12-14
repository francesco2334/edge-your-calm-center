import { motion } from 'framer-motion';
import { TokenCounter } from './TokenCounter';
import { SPEND_OPTIONS } from '@/lib/token-data';
import { useToast } from '@/hooks/use-toast';

interface ExchangeScreenProps {
  balance: number;
  onEarn: (amount: number, reason: string) => void;
  onSpend: (amount: number, reason: string) => boolean;
  onBack: () => void;
}

export function ExchangeScreen({ balance, onSpend, onBack }: ExchangeScreenProps) {
  const { toast } = useToast();

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
            You're not banning dopamine. You're choosing when to allow it.
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

        {/* Spend Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {SPEND_OPTIONS.map((option, i) => {
            const canAfford = balance >= option.tokenCost;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
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
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-6 italic"
          >
            Exit early → get a partial refund. Agency, not abstinence.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
