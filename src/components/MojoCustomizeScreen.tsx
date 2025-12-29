import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMojoCosmetics, COSMETICS_CATALOG, type CosmeticType, type Cosmetic } from '@/hooks/useMojoCosmetics';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MojoCustomizeScreenProps {
  points: number;
  onSpendPoints: (amount: number) => boolean;
  onBack: () => void;
}

const TABS: { id: CosmeticType; label: string; icon: string }[] = [
  { id: 'hat', label: 'Hats', icon: '🎩' },
  { id: 'accessory', label: 'Accessories', icon: '🎀' },
  { id: 'aura', label: 'Auras', icon: '✨' },
  { id: 'eyes', label: 'Eyes', icon: '👀' },
];

const rarityColors: Record<string, string> = {
  common: 'border-muted-foreground/30 bg-muted/30',
  rare: 'border-blue-500/50 bg-blue-500/10',
  epic: 'border-purple-500/50 bg-purple-500/10',
  legendary: 'border-amber-500/50 bg-amber-500/10',
};

const rarityGlow: Record<string, string> = {
  common: '',
  rare: 'shadow-[0_0_15px_hsl(var(--primary)/0.2)]',
  epic: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
  legendary: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]',
};

export function MojoCustomizeScreen({ points, onSpendPoints, onBack }: MojoCustomizeScreenProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CosmeticType>('hat');
  const { 
    owned, 
    equipped, 
    ownsCosmetic, 
    purchaseCosmetic, 
    equipCosmetic, 
    unequipCosmetic,
    getEquippedCosmetics,
  } = useMojoCosmetics();

  const equippedCosmetics = getEquippedCosmetics();
  const currentItems = COSMETICS_CATALOG.filter(c => c.type === activeTab);

  const handlePurchase = (cosmetic: Cosmetic) => {
    if (points < cosmetic.price) {
      toast({
        title: "Not enough points",
        description: `You need ${cosmetic.price - points} more points.`,
        variant: "destructive",
      });
      return;
    }

    if (onSpendPoints(cosmetic.price)) {
      purchaseCosmetic(cosmetic.id);
      toast({
        title: "Purchased!",
        description: `${cosmetic.name} is now yours!`,
      });
    }
  };

  const handleEquip = (cosmetic: Cosmetic) => {
    if (equipped[cosmetic.type] === cosmetic.id) {
      unequipCosmetic(cosmetic.type);
      toast({ title: `Unequipped ${cosmetic.name}` });
    } else {
      equipCosmetic(cosmetic.id);
      toast({ title: `Equipped ${cosmetic.name}` });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 safe-area-inset">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Customize Mojo</h1>
          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{points}</span>
          </div>
        </div>
      </div>

      {/* Mojo Preview */}
      <div className="flex flex-col items-center py-8">
        <div className="relative">
          {/* Base Mojo */}
          <motion.div 
            className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/75 via-primary/55 to-accent/45 relative"
            style={{ boxShadow: '0 0 40px hsl(var(--primary) / 0.3)' }}
            animate={{ 
              y: [0, -5, 0],
              scale: [1, 1.03, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Eyes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-6" style={{ marginTop: '-5%' }}>
                {equipped.eyes ? (
                  <span className="text-3xl">{COSMETICS_CATALOG.find(c => c.id === equipped.eyes)?.icon}</span>
                ) : (
                  <>
                    <div className="w-4 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                    <div className="w-4 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  </>
                )}
              </div>
            </div>

            {/* Hat */}
            <AnimatePresence>
              {equipped.hat && (
                <motion.div 
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                >
                  {COSMETICS_CATALOG.find(c => c.id === equipped.hat)?.icon}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Accessory */}
            <AnimatePresence>
              {equipped.accessory && (
                <motion.div 
                  className="absolute -right-2 top-1/4 text-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  {COSMETICS_CATALOG.find(c => c.id === equipped.accessory)?.icon}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Aura */}
          <AnimatePresence>
            {equipped.aura && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <motion.span 
                  className="text-5xl"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  {COSMETICS_CATALOG.find(c => c.id === equipped.aura)?.icon}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Equipped list */}
        {equippedCosmetics.length > 0 && (
          <div className="flex gap-2 mt-4">
            {equippedCosmetics.map(({ cosmetic }) => (
              <div 
                key={cosmetic.id}
                className="px-2 py-1 bg-primary/10 rounded-full text-xs flex items-center gap-1"
              >
                <span>{cosmetic.icon}</span>
                <span>{cosmetic.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 px-4 mb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-3 px-4">
        <AnimatePresence mode="popLayout">
          {currentItems.map((cosmetic, index) => {
            const isOwned = ownsCosmetic(cosmetic.id);
            const isEquipped = equipped[cosmetic.type] === cosmetic.id;

            return (
              <motion.div
                key={cosmetic.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative p-4 rounded-2xl border-2 transition-all",
                  rarityColors[cosmetic.rarity],
                  rarityGlow[cosmetic.rarity],
                  isEquipped && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                {/* Rarity badge */}
                <div className={cn(
                  "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold",
                  cosmetic.rarity === 'legendary' && "bg-amber-500/20 text-amber-500",
                  cosmetic.rarity === 'epic' && "bg-purple-500/20 text-purple-500",
                  cosmetic.rarity === 'rare' && "bg-blue-500/20 text-blue-500",
                  cosmetic.rarity === 'common' && "bg-muted text-muted-foreground"
                )}>
                  {cosmetic.rarity}
                </div>

                {/* Icon */}
                <div className="text-4xl text-center mb-2">{cosmetic.icon}</div>
                
                {/* Name */}
                <h3 className="font-medium text-sm text-center mb-1">{cosmetic.name}</h3>
                
                {/* Preview text */}
                <p className="text-xs text-muted-foreground text-center mb-3">{cosmetic.preview}</p>

                {/* Action button */}
                {isOwned ? (
                  <Button
                    size="sm"
                    variant={isEquipped ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleEquip(cosmetic)}
                  >
                    {isEquipped ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Equipped
                      </>
                    ) : (
                      "Equip"
                    )}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => handlePurchase(cosmetic)}
                    disabled={points < cosmetic.price}
                  >
                    {points < cosmetic.price ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        {cosmetic.price} pts
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-1" />
                        {cosmetic.price} pts
                      </>
                    )}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
