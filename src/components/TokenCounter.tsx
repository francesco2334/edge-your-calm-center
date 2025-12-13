import { motion, AnimatePresence } from 'framer-motion';

interface TokenCounterProps {
  balance: number;
  size?: 'sm' | 'md' | 'lg';
}

export function TokenCounter({ balance, size = 'md' }: TokenCounterProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  const containerClasses = {
    sm: 'gap-2 px-3 py-1.5',
    md: 'gap-3 px-4 py-2',
    lg: 'gap-4 px-6 py-3',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center ${containerClasses[size]} rounded-2xl bg-gradient-glow border border-primary/30 dopa-glow-button`}
    >
      {/* Token orb */}
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-neon flex items-center justify-center font-bold text-primary-foreground shadow-neon`}>
        <motion.span
          key={balance}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          ⚡
        </motion.span>
      </div>
      
      {/* Balance */}
      <div className="text-left">
        <AnimatePresence mode="wait">
          <motion.p
            key={balance}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className={`font-bold text-foreground ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-base'}`}
          >
            {balance}
          </motion.p>
        </AnimatePresence>
        <p className={`text-muted-foreground ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
          {balance === 1 ? 'Token' : 'Tokens'}
        </p>
      </div>
    </motion.div>
  );
}