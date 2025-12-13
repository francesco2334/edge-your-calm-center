import { motion, AnimatePresence } from 'framer-motion';

interface ChargeCounterProps {
  balance: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ChargeCounter({ balance, size = 'md' }: ChargeCounterProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  };

  const containerClasses = {
    sm: 'gap-2 px-3 py-1.5',
    md: 'gap-3 px-4 py-2',
    lg: 'gap-4 px-5 py-3',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center ${containerClasses[size]} rounded-2xl bg-gradient-glow border border-primary/30`}
    >
      {/* Charge orb */}
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
            className={`font-bold text-foreground ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'}`}
          >
            {balance}
          </motion.p>
        </AnimatePresence>
        <p className={`text-muted-foreground ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
          Charge
        </p>
      </div>
    </motion.div>
  );
}
