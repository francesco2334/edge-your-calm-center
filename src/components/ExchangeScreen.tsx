import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExchangeScreenProps {
  tokens: number;
  minutesPerToken: number;
  onSpendTokens: (tokens: number, activity: string) => void;
  onBack: () => void;
}

const SPEND_OPTIONS = [
  { id: 'scroll-10', label: '10 min Scroll', icon: '📱', tokenCost: 1, minutes: 10, description: 'TikTok, Instagram, etc.' },
  { id: 'scroll-30', label: '30 min Scroll', icon: '📲', tokenCost: 3, minutes: 30, description: 'Extended session' },
  { id: 'gaming-30', label: '30 min Gaming', icon: '🎮', tokenCost: 3, minutes: 30, description: 'Video games' },
  { id: 'free-60', label: '1hr Free Flow', icon: '🌊', tokenCost: 6, minutes: 60, description: 'No limits for an hour' },
];

export function ExchangeScreen({ tokens, minutesPerToken, onSpendTokens, onBack }: ExchangeScreenProps) {
  const { toast } = useToast();

  const handleSpend = (option: typeof SPEND_OPTIONS[0]) => {
    if (tokens < option.tokenCost) {
      toast({
        title: "Not enough tokens",
        description: `You need ${option.tokenCost} tokens. Earn more by logging daily or learning.`,
        variant: "destructive",
      });
      return;
    }
    
    onSpendTokens(option.tokenCost, option.label);
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
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          {/* Token display */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/25">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-lg font-bold text-amber-500">{tokens}</span>
          </div>
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
            1 token = {minutesPerToken} minutes. You choose when.
          </p>
        </motion.div>

        {/* Balance display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex flex-col items-center gap-2 px-8 py-6 rounded-2xl bg-card/50 border border-border/20">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-amber-500" />
              <span className="text-5xl font-bold text-foreground">{tokens}</span>
            </div>
            <span className="text-sm text-muted-foreground">tokens available</span>
          </div>
        </motion.div>

        {/* How to earn more */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6 p-4 rounded-xl bg-muted/30 border border-border/15"
        >
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-semibold text-foreground">Earn tokens:</span> Log daily (+3) • Learn 5 cards (+1) • Complete games (+1)
          </p>
        </motion.div>

        {/* Spend Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Spend tokens on time
          </h2>
          
          {SPEND_OPTIONS.map((option, i) => {
            const canAfford = tokens >= option.tokenCost;
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => handleSpend(option)}
                disabled={!canAfford}
                className={`w-full p-4 rounded-2xl border transition-all text-left ${
                  canAfford 
                    ? 'bg-card/50 border-border/20 hover:border-primary/30 hover:bg-card/70 active:scale-[0.98]' 
                    : 'bg-muted/20 border-border/10 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <span className="text-lg font-bold">-{option.tokenCost}</span>
                      <Coins className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{option.minutes} min</span>
                    </div>
                  </div>
                </div>
              </motion.button>
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
