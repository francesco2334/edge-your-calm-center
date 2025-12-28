import { motion } from 'framer-motion';
import { FLOW_STAGES, type FlowStage } from '@/lib/credit-data';

interface FlowNavProps {
  activeStage: FlowStage;
  onStageChange: (stage: FlowStage) => void;
  hasLoggedToday?: boolean;
}

export function FlowNav({ activeStage, onStageChange, hasLoggedToday }: FlowNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl border-t border-border/10" />
      
      <nav className="relative flex items-center justify-around px-3 py-2.5 safe-area-bottom">
        {FLOW_STAGES.map((stage) => {
          const isActive = activeStage === stage.id;
          const isReset = stage.id === 'reset';
          
          // Reset is the center, primary action
          if (isReset) {
            return (
              <motion.button
                key={stage.id}
                onClick={() => onStageChange(stage.id)}
                className="relative -mt-6"
                whileTap={{ scale: 0.92 }}
              >
                {/* Outer glow ring */}
                <div className={`absolute inset-0 rounded-full blur-xl scale-150 ${
                  isActive ? 'bg-primary/30' : 'bg-primary/10'
                }`} />
                
                {/* Main button - always prominent */}
                <div className={`relative w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-xl border ${
                  isActive 
                    ? 'bg-gradient-neon shadow-primary/40 border-primary/40'
                    : 'bg-gradient-to-br from-primary/80 to-primary shadow-primary/20 border-primary/30'
                }`}>
                  <span className="text-[26px]">{stage.icon}</span>
                </div>
                
                {/* Label */}
                <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap font-bold tracking-wide ${
                  isActive ? 'text-primary' : 'text-foreground/70'
                }`}>
                  {stage.label}
                </span>
              </motion.button>
            );
          }
          
          // Show checkmark on Log if logged today
          const showCheck = stage.id === 'log' && hasLoggedToday;
          
          return (
            <motion.button
              key={stage.id}
              onClick={() => onStageChange(stage.id)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 min-w-[64px]"
              whileTap={{ scale: 0.92 }}
            >
              {/* Icon */}
              <div className="relative">
                <span className={`text-[24px] transition-all duration-200 ${
                  isActive ? 'scale-110' : 'opacity-50 scale-95'
                }`}>
                  {stage.icon}
                </span>
                
                {/* Checkmark badge */}
                {showCheck && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
                  >
                    <span className="text-[10px] text-white">✓</span>
                  </motion.div>
                )}
              </div>
              
              {/* Label */}
              <span className={`text-[10px] font-semibold transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground/50'
              }`}>
                {stage.label}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeFlowIndicator"
                  className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
