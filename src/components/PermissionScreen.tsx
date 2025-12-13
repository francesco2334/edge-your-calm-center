import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PermissionScreenProps {
  onStartScan: () => void;
}

export function PermissionScreen({ onStartScan }: PermissionScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-calm" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-dopa-surface border border-border/50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4 mb-12"
        >
          <p className="text-lg text-foreground leading-relaxed">
            Nothing here is a diagnosis.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            You're not broken.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This just helps us understand your current load.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="edge"
            size="lg"
            onClick={onStartScan}
            className="w-full"
          >
            Start Scan
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}