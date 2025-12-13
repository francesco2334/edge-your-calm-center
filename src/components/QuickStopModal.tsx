import { motion, AnimatePresence } from 'framer-motion';

interface QuickStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: 'pause' | 'breathing' | 'name' | 'prediction') => void;
  onLogPull?: () => void;
}

const QUICK_TOOLS = [
  { 
    id: 'pause' as const, 
    label: 'The Standoff', 
    desc: '20-60 seconds',
    icon: '⏸️',
    gradient: 'from-violet-500/25 via-purple-600/15 to-transparent',
  },
  { 
    id: 'breathing' as const, 
    label: 'Sync', 
    desc: '90 seconds to calm',
    icon: '🫁',
    gradient: 'from-teal-500/25 via-cyan-600/15 to-transparent',
  },
  { 
    id: 'name' as const, 
    label: 'Name It', 
    desc: 'Label the feeling',
    icon: '📍',
    gradient: 'from-rose-500/25 via-pink-600/15 to-transparent',
  },
  { 
    id: 'prediction' as const, 
    label: 'The Bluff', 
    desc: 'Predict vs reality',
    icon: '🎯',
    gradient: 'from-amber-500/25 via-orange-600/15 to-transparent',
  },
];

export function QuickStopModal({ isOpen, onClose, onSelectTool, onLogPull }: QuickStopModalProps) {
  const handleSelect = (tool: typeof QUICK_TOOLS[number]['id']) => {
    onSelectTool(tool);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - dark, blurred */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
          />
          
          {/* Modal - centered, clean */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-x-5 top-1/2 -translate-y-1/2 z-50 bg-card rounded-[28px] border border-border/20 overflow-hidden shadow-2xl shadow-primary/10"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[22px] font-bold text-foreground">
                    Quick Stop
                  </h2>
                  <p className="text-[14px] text-muted-foreground/70 mt-0.5 font-medium">
                    Interrupt the pull in seconds
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>
              
              {/* Tools grid - 2x2, large touch targets */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {QUICK_TOOLS.map((tool, i) => (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSelect(tool.id)}
                    className={`p-4 rounded-[18px] bg-gradient-to-br ${tool.gradient} border border-border/20 hover:border-primary/30 active:scale-[0.97] transition-all text-left`}
                  >
                    <span className="text-[36px] mb-2.5 block">{tool.icon}</span>
                    <p className="text-[15px] font-semibold text-foreground">{tool.label}</p>
                    <p className="text-[12px] text-muted-foreground/70 mt-0.5 font-medium">{tool.desc}</p>
                  </motion.button>
                ))}
              </div>

              {/* Log Pull option */}
              {onLogPull && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    onLogPull();
                    onClose();
                  }}
                  className="w-full p-4 rounded-[16px] bg-muted/30 border border-border/15 hover:bg-muted/40 active:scale-[0.98] transition-all text-center"
                >
                  <span className="text-[14px] font-semibold text-muted-foreground">
                    📝 Log today's pull
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}