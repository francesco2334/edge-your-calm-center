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
      {/* Glass background - refined */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-2xl border-t border-border/15" />
      
      <nav className="relative flex items-center justify-around px-2 py-2 safe-area-bottom">
        {tabs.map((tab) => {
          if (tab.id === 'quickstop') {
            // Center Quick Stop button - Larger, more prominent
            return (
              <motion.button
                key={tab.id}
                onClick={onQuickStop}
                className="relative -mt-7"
                whileTap={{ scale: 0.92 }}
              >
                <div className="w-[60px] h-[60px] rounded-full bg-gradient-neon flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="text-[26px]">⚡</span>
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/70 whitespace-nowrap font-medium">
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
              className="flex flex-col items-center gap-0.5 px-4 py-2 min-w-[60px]"
              whileTap={{ scale: 0.92 }}
            >
              <span className={`text-[22px] transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-60'}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] transition-colors font-medium ${
                isActive ? 'text-primary' : 'text-muted-foreground/60'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
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
