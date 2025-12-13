import { motion, AnimatePresence } from 'framer-motion';

interface QuickStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: 'pause' | 'breathing' | 'name' | 'prediction') => void;
}

const QUICK_TOOLS = [
  { 
    id: 'pause' as const, 
    label: 'The Standoff', 
    desc: 'Hold for 20-60 seconds',
    icon: '⏸️',
    gradient: 'from-violet-500/20 to-purple-600/20',
  },
  { 
    id: 'breathing' as const, 
    label: 'Sync Reset', 
    desc: '90 seconds to calm',
    icon: '🫁',
    gradient: 'from-teal-500/20 to-cyan-600/20',
  },
  { 
    id: 'name' as const, 
    label: 'Name It', 
    desc: 'Label the feeling',
    icon: '📍',
    gradient: 'from-rose-500/20 to-pink-600/20',
  },
  { 
    id: 'prediction' as const, 
    label: 'The Bluff', 
    desc: 'Predict vs reality',
    icon: '🎯',
    gradient: 'from-amber-500/20 to-orange-600/20',
  },
];

export function QuickStopModal({ isOpen, onClose, onSelectTool }: QuickStopModalProps) {
  const handleSelect = (tool: typeof QUICK_TOOLS[number]['id']) => {
    onSelectTool(tool);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-card rounded-3xl border border-border/30 overflow-hidden shadow-neon"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Quick Stop
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Interrupt the pull in seconds
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Tools grid */}
              <div className="grid grid-cols-2 gap-3">
                {QUICK_TOOLS.map((tool, i) => (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSelect(tool.id)}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${tool.gradient} border border-border/30 hover:border-primary/40 transition-all text-left`}
                  >
                    <span className="text-3xl mb-2 block">{tool.icon}</span>
                    <p className="text-sm font-medium text-foreground">{tool.label}</p>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
