import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COSMETICS_CATALOG, type CosmeticType, type Cosmetic } from '@/hooks/useMojoCosmetics';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MojoOrb } from './MojoOrb';
import { useMojoCosmeticsContext } from '@/contexts/MojoCosmeticsContext';

interface MojoCustomizeScreenProps {
  points: number;
  onSpendPoints: (amount: number) => boolean;
  onBack: () => void;
}

const TABS: { id: CosmeticType; label: string; icon: string }[] = [
  { id: 'color', label: 'Colors', icon: '🎨' },
  { id: 'hat', label: 'Hats', icon: '🎩' },
  { id: 'face', label: 'Face', icon: '👤' },
  { id: 'accessory', label: 'Auras', icon: '✨' },
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
  const [activeTab, setActiveTab] = useState<CosmeticType>('color');
  
  // Use the shared context - this ensures changes sync across the app
  const { 
    equippedCosmetics,
    equipped, 
    ownsCosmetic, 
    purchaseCosmetic, 
    equipCosmetic, 
    unequipCosmetic,
    getEquippedCosmetics,
  } = useMojoCosmeticsContext();

  const equippedList = getEquippedCosmetics();
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

      {/* Mojo Preview - using actual MojoOrb */}
      <div className="flex flex-col items-center py-8">
        <div className="w-full flex justify-center">
          <MojoOrb 
            size="lg" 
            state="calm" 
            cosmetics={equippedCosmetics}
          />
        </div>

        {/* Equipped list */}
        {equippedList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center px-4">
            {equippedList.map(({ cosmetic }) => (
              <div 
                key={cosmetic.id}
                className="px-2 py-1 bg-primary/10 rounded-full text-xs flex items-center gap-1"
              >
                <span>{cosmetic.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 px-4 mb-4 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
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

                {/* Preview visual */}
                <div className="flex justify-center mb-2">
                  {cosmetic.type === 'color' && (
                    <div 
                      className="w-12 h-12 rounded-full"
                      style={{ 
                        background: cosmetic.id === 'color-ocean' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' :
                                   cosmetic.id === 'color-sunset' ? 'linear-gradient(135deg, #f97316, #ec4899)' :
                                   cosmetic.id === 'color-forest' ? 'linear-gradient(135deg, #10b981, #14b8a6)' :
                                   cosmetic.id === 'color-rose' ? 'linear-gradient(135deg, #f472b6, #fda4af)' :
                                   cosmetic.id === 'color-midnight' ? 'linear-gradient(135deg, #334155, #1e293b)' :
                                   cosmetic.id === 'color-gold' ? 'linear-gradient(135deg, #facc15, #f59e0b)' :
                                   cosmetic.id === 'color-rainbow' ? 'linear-gradient(135deg, #ef4444, #facc15, #3b82f6)' :
                                   'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
                      }}
                    />
                  )}
                  {cosmetic.type === 'hat' && (
                    <div className="w-12 h-12 flex items-center justify-center text-3xl">
                      {cosmetic.id.includes('crown') ? '👑' : 
                       cosmetic.id.includes('wizard') ? '🧙' :
                       cosmetic.id.includes('beanie') ? '🧢' :
                       cosmetic.id.includes('halo') ? '😇' : '🎩'}
                    </div>
                  )}
                  {cosmetic.type === 'face' && (
                    <div className="w-12 h-12 flex items-center justify-center text-3xl">
                      {cosmetic.id.includes('mustache') ? '🥸' :
                       cosmetic.id.includes('monocle') ? '🧐' :
                       cosmetic.id.includes('blush') ? '😊' :
                       cosmetic.id.includes('heart') ? '😍' : '😎'}
                    </div>
                  )}
                  {cosmetic.type === 'accessory' && (
                    <div className="w-12 h-12 flex items-center justify-center text-3xl">
                      {cosmetic.id.includes('fire') ? '🔥' :
                       cosmetic.id.includes('rainbow') ? '🌈' :
                       cosmetic.id.includes('sparkle') ? '✨' :
                       cosmetic.id.includes('galaxy') ? '🌌' : '💫'}
                    </div>
                  )}
                </div>
                
                {/* Name */}
                <h3 className="font-medium text-sm text-center mb-1">{cosmetic.name}</h3>
                
                {/* Description */}
                <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">
                  {cosmetic.description}
                </p>

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
