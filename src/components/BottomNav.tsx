import { motion } from 'framer-motion';

type NavTab = 'home' | 'learn' | 'quickstop' | 'games' | 'insights';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickStop: () => void;
}

const tabs: { id: NavTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'learn', label: 'Learn', icon: '🧠' },
  { id: 'quickstop', label: '', icon: '' }, // Center button placeholder
  { id: 'games', label: 'Arcade', icon: '🎮' },
  { id: 'insights', label: 'Insights', icon: '📊' },
];

export function BottomNav({ activeTab, onTabChange, onQuickStop }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glass background - luxury feel */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl border-t border-border/10" />
      
      <nav className="relative flex items-center justify-around px-3 py-2.5 safe-area-bottom">
        {tabs.map((tab) => {
          if (tab.id === 'quickstop') {
            // CENTER QUICK STOP - Larger, prominent, the primary interrupt
            return (
              <motion.button
                key={tab.id}
                onClick={onQuickStop}
                className="relative -mt-8"
                whileTap={{ scale: 0.92 }}
              >
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150" />
                
                {/* Main button */}
                <div className="relative w-[64px] h-[64px] rounded-full bg-gradient-neon flex items-center justify-center shadow-xl shadow-primary/30 border border-primary/30">
                  <span className="text-[28px]">⚡</span>
                </div>
                
                {/* Label */}
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60 whitespace-nowrap font-semibold tracking-wide">
                  Quick Stop
                </span>
              </motion.button>
            );
          }

          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 min-w-[64px]"
              whileTap={{ scale: 0.92 }}
            >
              {/* Icon - larger than default */}
              <span className={`text-[24px] transition-all duration-200 ${
                isActive ? 'scale-110' : 'opacity-50 scale-95'
              }`}>
                {tab.icon}
              </span>
              
              {/* Label */}
              <span className={`text-[10px] font-semibold transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground/50'
              }`}>
                {tab.label}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
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