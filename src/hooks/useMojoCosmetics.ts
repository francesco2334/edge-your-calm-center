import { useState, useEffect, useCallback } from 'react';

export type CosmeticType = 'color' | 'hat' | 'face' | 'accessory';

export interface Cosmetic {
  id: string;
  name: string;
  type: CosmeticType;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

interface CosmeticsState {
  owned: string[];
  equipped: Record<CosmeticType, string | null>;
}

const COSMETICS_STORAGE_KEY = 'mojo-cosmetics';

// Available cosmetics catalog - prices start at 150
export const COSMETICS_CATALOG: Cosmetic[] = [
  // COLORS - Changes Mojo's base gradient
  { id: 'color-default', name: 'Classic Purple', type: 'color', price: 0, rarity: 'common', description: 'The original Mojo look' },
  { id: 'color-ocean', name: 'Ocean Blue', type: 'color', price: 150, rarity: 'common', description: 'Deep sea vibes' },
  { id: 'color-sunset', name: 'Sunset Orange', type: 'color', price: 150, rarity: 'common', description: 'Warm sunset glow' },
  { id: 'color-forest', name: 'Forest Green', type: 'color', price: 200, rarity: 'rare', description: 'Nature energy' },
  { id: 'color-rose', name: 'Rose Pink', type: 'color', price: 200, rarity: 'rare', description: 'Soft and sweet' },
  { id: 'color-midnight', name: 'Midnight Black', type: 'color', price: 300, rarity: 'epic', description: 'Dark and mysterious' },
  { id: 'color-gold', name: 'Golden Glow', type: 'color', price: 500, rarity: 'legendary', description: 'Pure luxury' },
  { id: 'color-rainbow', name: 'Rainbow Shift', type: 'color', price: 750, rarity: 'legendary', description: 'All the colors!' },
  
  // HATS - Actual SVG hats that sit on Mojo
  { id: 'hat-beanie', name: 'Cozy Beanie', type: 'hat', price: 150, rarity: 'common', description: 'Warm and snug' },
  { id: 'hat-cap', name: 'Baseball Cap', type: 'hat', price: 150, rarity: 'common', description: 'Classic sporty look' },
  { id: 'hat-tophat', name: 'Top Hat', type: 'hat', price: 250, rarity: 'rare', description: 'Fancy and classy' },
  { id: 'hat-wizard', name: 'Wizard Hat', type: 'hat', price: 300, rarity: 'rare', description: 'Magical powers' },
  { id: 'hat-crown', name: 'Royal Crown', type: 'hat', price: 450, rarity: 'epic', description: 'Fit for royalty' },
  { id: 'hat-halo', name: 'Angel Halo', type: 'hat', price: 400, rarity: 'epic', description: 'Heavenly glow' },
  { id: 'hat-chef', name: 'Chef Toque', type: 'hat', price: 200, rarity: 'rare', description: 'Master chef vibes' },
  { id: 'hat-pirate', name: 'Pirate Tricorn', type: 'hat', price: 350, rarity: 'epic', description: 'Arr matey!' },
  { id: 'hat-catears', name: 'Cat Ears', type: 'hat', price: 200, rarity: 'rare', description: 'Cute kitty vibes' },
  { id: 'hat-bunnyears', name: 'Bunny Ears', type: 'hat', price: 225, rarity: 'rare', description: 'Hoppy and adorable' },
  { id: 'hat-flower', name: 'Flower Crown', type: 'hat', price: 175, rarity: 'common', description: 'Spring garden beauty' },
  { id: 'hat-tiara', name: 'Princess Tiara', type: 'hat', price: 400, rarity: 'epic', description: 'Royal sparkle' },
  
  // FACE - Cute additions that work with Mojo's close-together eyes
  { id: 'face-blush', name: 'Rosy Cheeks', type: 'face', price: 175, rarity: 'common', description: 'Adorable blush' },
  { id: 'face-freckles', name: 'Cute Freckles', type: 'face', price: 175, rarity: 'common', description: 'Sprinkle of charm' },
  { id: 'face-mustache', name: 'Gentleman Stache', type: 'face', price: 150, rarity: 'common', description: 'Distinguished look' },
  { id: 'face-handlebar', name: 'Handlebar Mustache', type: 'face', price: 200, rarity: 'rare', description: 'Twirl-worthy' },
  { id: 'face-hearts', name: 'Heart Eyes', type: 'face', price: 225, rarity: 'rare', description: 'In love!' },
  { id: 'face-stars', name: 'Star Eyes', type: 'face', price: 250, rarity: 'rare', description: 'Starstruck!' },
  { id: 'face-whiskers', name: 'Cat Whiskers', type: 'face', price: 150, rarity: 'common', description: 'Meow!' },
  
  // ACCESSORIES - Items around Mojo  
  { id: 'acc-bowtie-red', name: 'Red Bow Tie', type: 'accessory', price: 150, rarity: 'common', description: 'Classic and dapper' },
  { id: 'acc-bowtie-pink', name: 'Pink Bow Tie', type: 'accessory', price: 150, rarity: 'common', description: 'Pretty in pink' },
  { id: 'acc-bowtie-blue', name: 'Blue Bow Tie', type: 'accessory', price: 150, rarity: 'common', description: 'Cool and calm' },
  { id: 'acc-bowtie-gold', name: 'Golden Bow Tie', type: 'accessory', price: 300, rarity: 'rare', description: 'Fancy formal' },
  { id: 'acc-scarf', name: 'Cozy Scarf', type: 'accessory', price: 175, rarity: 'common', description: 'Warm and stylish' },
  { id: 'acc-cape', name: 'Hero Cape', type: 'accessory', price: 300, rarity: 'epic', description: 'Super Mojo!' },
  { id: 'acc-necklace', name: 'Gold Chain', type: 'accessory', price: 250, rarity: 'rare', description: 'Bling bling' },
  { id: 'acc-pearls', name: 'Pearl Necklace', type: 'accessory', price: 275, rarity: 'rare', description: 'Elegant beauty' },
  { id: 'acc-headphones', name: 'Headphones', type: 'accessory', price: 225, rarity: 'rare', description: 'Music lover' },
  { id: 'acc-wings', name: 'Angel Wings', type: 'accessory', price: 500, rarity: 'legendary', description: 'Ethereal beauty' },
  { id: 'acc-butterflywings', name: 'Butterfly Wings', type: 'accessory', price: 400, rarity: 'epic', description: 'Flutter by!' },
  { id: 'acc-flames', name: 'Fire Aura', type: 'accessory', price: 400, rarity: 'epic', description: 'Burning passion' },
  { id: 'acc-sparkles', name: 'Sparkle Trail', type: 'accessory', price: 350, rarity: 'epic', description: 'Magical shimmer' },
  
  // EXCLUSIVE COLLECTION - Super expensive full outfits
  { id: 'outfit-jamesbond', name: 'Secret Agent', type: 'accessory', price: 2500, rarity: 'legendary', description: 'Shaken, not stirred. Full tuxedo with bow tie.' },
  { id: 'outfit-superhero', name: 'Super Mojo', type: 'accessory', price: 2500, rarity: 'legendary', description: 'Cape, mask, and lightning bolt. Save the day!' },
  { id: 'outfit-princess', name: 'Royal Princess', type: 'accessory', price: 2500, rarity: 'legendary', description: 'Tiara, dress, and wand. Fairytale dreams!' },
  { id: 'outfit-teddy', name: 'Teddy Bear', type: 'accessory', price: 2000, rarity: 'legendary', description: 'Fuzzy ears and bow. Huggable cuteness!' },
];

const DEFAULT_STATE: CosmeticsState = {
  owned: ['color-default'],
  equipped: {
    color: 'color-default',
    hat: null,
    face: null,
    accessory: null,
  },
};

export function useMojoCosmetics() {
  const [state, setState] = useState<CosmeticsState>(() => {
    try {
      const saved = localStorage.getItem(COSMETICS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure color-default is always owned
        if (!parsed.owned.includes('color-default')) {
          parsed.owned.push('color-default');
        }
        return parsed;
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
    // Don't allow unequipping color - just change to default
    if (type === 'color') {
      setState(prev => ({
        ...prev,
        equipped: {
          ...prev.equipped,
          color: 'color-default',
        },
      }));
      return;
    }
    
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
