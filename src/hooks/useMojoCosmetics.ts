import { useState, useEffect, useCallback } from 'react';

export type CosmeticType = 'hat' | 'accessory' | 'aura' | 'eyes';

export interface Cosmetic {
  id: string;
  name: string;
  type: CosmeticType;
  price: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  preview: string; // CSS class or description
}

interface CosmeticsState {
  owned: string[];
  equipped: Record<CosmeticType, string | null>;
}

const COSMETICS_STORAGE_KEY = 'mojo-cosmetics';

// Available cosmetics catalog
export const COSMETICS_CATALOG: Cosmetic[] = [
  // Hats
  { id: 'hat-crown', name: 'Golden Crown', type: 'hat', price: 50, icon: '👑', rarity: 'legendary', preview: 'A majestic golden crown' },
  { id: 'hat-party', name: 'Party Hat', type: 'hat', price: 15, icon: '🎉', rarity: 'common', preview: 'Festive party vibes' },
  { id: 'hat-wizard', name: 'Wizard Hat', type: 'hat', price: 30, icon: '🧙', rarity: 'rare', preview: 'Magical wizard powers' },
  { id: 'hat-cap', name: 'Cool Cap', type: 'hat', price: 10, icon: '🧢', rarity: 'common', preview: 'Casual and chill' },
  { id: 'hat-tophat', name: 'Top Hat', type: 'hat', price: 25, icon: '🎩', rarity: 'rare', preview: 'Classy and sophisticated' },
  { id: 'hat-halo', name: 'Angel Halo', type: 'hat', price: 40, icon: '😇', rarity: 'epic', preview: 'Heavenly glow' },
  
  // Accessories
  { id: 'acc-glasses', name: 'Cool Shades', type: 'accessory', price: 20, icon: '😎', rarity: 'common', preview: 'Too cool for school' },
  { id: 'acc-bow', name: 'Cute Bow', type: 'accessory', price: 15, icon: '🎀', rarity: 'common', preview: 'Adorable pink bow' },
  { id: 'acc-monocle', name: 'Monocle', type: 'accessory', price: 35, icon: '🧐', rarity: 'rare', preview: 'Distinguished look' },
  { id: 'acc-headphones', name: 'Headphones', type: 'accessory', price: 25, icon: '🎧', rarity: 'rare', preview: 'Music lover' },
  { id: 'acc-scarf', name: 'Cozy Scarf', type: 'accessory', price: 18, icon: '🧣', rarity: 'common', preview: 'Warm and snuggly' },
  
  // Auras
  { id: 'aura-fire', name: 'Fire Aura', type: 'aura', price: 45, icon: '🔥', rarity: 'epic', preview: 'Flames of passion' },
  { id: 'aura-sparkle', name: 'Sparkle Aura', type: 'aura', price: 30, icon: '✨', rarity: 'rare', preview: 'Magical sparkles' },
  { id: 'aura-rainbow', name: 'Rainbow Aura', type: 'aura', price: 60, icon: '🌈', rarity: 'legendary', preview: 'All the colors' },
  { id: 'aura-hearts', name: 'Love Aura', type: 'aura', price: 35, icon: '💕', rarity: 'rare', preview: 'Spreading love' },
  { id: 'aura-stars', name: 'Star Aura', type: 'aura', price: 40, icon: '⭐', rarity: 'epic', preview: 'Celestial energy' },
  
  // Eyes
  { id: 'eyes-heart', name: 'Heart Eyes', type: 'eyes', price: 20, icon: '😍', rarity: 'common', preview: 'Full of love' },
  { id: 'eyes-star', name: 'Star Eyes', type: 'eyes', price: 25, icon: '🤩', rarity: 'rare', preview: 'Starstruck' },
  { id: 'eyes-laser', name: 'Laser Eyes', type: 'eyes', price: 55, icon: '🔴', rarity: 'legendary', preview: 'Pew pew!' },
  { id: 'eyes-sleepy', name: 'Sleepy Eyes', type: 'eyes', price: 15, icon: '😴', rarity: 'common', preview: 'Always tired' },
];

const DEFAULT_STATE: CosmeticsState = {
  owned: [],
  equipped: {
    hat: null,
    accessory: null,
    aura: null,
    eyes: null,
  },
};

export function useMojoCosmetics() {
  const [state, setState] = useState<CosmeticsState>(() => {
    try {
      const saved = localStorage.getItem(COSMETICS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_STATE;
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(COSMETICS_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const ownsCosmetic = useCallback((cosmeticId: string) => {
    return state.owned.includes(cosmeticId);
  }, [state.owned]);

  const purchaseCosmetic = useCallback((cosmeticId: string): boolean => {
    if (state.owned.includes(cosmeticId)) return false;
    
    setState(prev => ({
      ...prev,
      owned: [...prev.owned, cosmeticId],
    }));
    return true;
  }, [state.owned]);

  const equipCosmetic = useCallback((cosmeticId: string) => {
    const cosmetic = COSMETICS_CATALOG.find(c => c.id === cosmeticId);
    if (!cosmetic || !state.owned.includes(cosmeticId)) return;

    setState(prev => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [cosmetic.type]: cosmeticId,
      },
    }));
  }, [state.owned]);

  const unequipCosmetic = useCallback((type: CosmeticType) => {
    setState(prev => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [type]: null,
      },
    }));
  }, []);

  const getEquippedCosmetics = useCallback(() => {
    return Object.entries(state.equipped)
      .filter(([_, id]) => id !== null)
      .map(([type, id]) => ({
        type: type as CosmeticType,
        cosmetic: COSMETICS_CATALOG.find(c => c.id === id)!,
      }))
      .filter(item => item.cosmetic);
  }, [state.equipped]);

  const getCosmeticsByType = useCallback((type: CosmeticType) => {
    return COSMETICS_CATALOG.filter(c => c.type === type);
  }, []);

  return {
    owned: state.owned,
    equipped: state.equipped,
    ownsCosmetic,
    purchaseCosmetic,
    equipCosmetic,
    unequipCosmetic,
    getEquippedCosmetics,
    getCosmeticsByType,
    catalog: COSMETICS_CATALOG,
  };
}
