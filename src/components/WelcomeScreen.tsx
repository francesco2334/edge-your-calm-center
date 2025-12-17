import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-12 relative overflow-hidden safe-area-inset">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-calm" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-pulse opacity-40" />
      
      {/* Spacer to center content */}
      <div className="flex-1 min-h-[60px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 text-center max-w-md mx-auto"
      >
        {/* Logo - Orb */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-20 h-20 mx-auto dopa-orb" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-muted-foreground text-sm uppercase tracking-widest mb-4"
        >
          Dopa<span className="text-primary font-semibold">MINE</span>
        </motion.p>

        {/* Main message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-4"
        >
          Your attention is being mined.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg text-muted-foreground leading-relaxed mb-8"
        >
          DopaMINE helps you understand the pull — and choose again.
        </motion.p>
      </motion.div>

      {/* Spacer to push CTA to bottom */}
      <div className="flex-1 min-h-[40px]" />

      {/* CTA - Fixed at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="relative z-10 space-y-4 max-w-md mx-auto w-full"
      >
        <Button
          variant="edge"
          size="lg"
          onClick={onContinue}
          className="w-full"
        >
          Continue
        </Button>
        
        <button className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
          Why DopaMINE works
        </button>
      </motion.div>
    </div>
  );
}
