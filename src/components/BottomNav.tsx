import { motion } from 'framer-motion';

type NavTab = 'home' | 'exchange' | 'quickstop' | 'games' | 'insights';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickStop: () => void;
}

const tabs: { id: NavTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Feed', icon: '🏠' },
  { id: 'exchange', label: 'Exchange', icon: '⚡' },
  { id: 'quickstop', label: '', icon: '' }, // Center button placeholder
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'insights', label: 'Insights', icon: '📊' },
];

export function BottomNav({ activeTab, onTabChange, onQuickStop }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/20" />
      
      <nav className="relative flex items-center justify-around px-2 py-3 safe-area-bottom">
        {tabs.map((tab) => {
          if (tab.id === 'quickstop') {
            // Center Quick Stop button
            return (
              <motion.button
                key={tab.id}
                onClick={onQuickStop}
                className="relative -mt-8"
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-neon flex items-center justify-center shadow-neon">
                  <span className="text-2xl">⚡</span>
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
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
              className="flex flex-col items-center gap-1 px-4 py-1"
              whileTap={{ scale: 0.95 }}
            >
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] transition-colors ${
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
