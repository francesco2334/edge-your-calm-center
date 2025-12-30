import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

// Available cosmetics catalog - prices x3
export const COSMETICS_CATALOG: Cosmetic[] = [
  // COLORS - Changes Mojo's base gradient
  { id: 'color-default', name: 'Classic Purple', type: 'color', price: 0, rarity: 'common', description: 'The original Mojo look' },
  { id: 'color-ocean', name: 'Ocean Blue', type: 'color', price: 450, rarity: 'common', description: 'Deep sea vibes' },
  { id: 'color-sunset', name: 'Sunset Orange', type: 'color', price: 450, rarity: 'common', description: 'Warm sunset glow' },
  { id: 'color-forest', name: 'Forest Green', type: 'color', price: 600, rarity: 'rare', description: 'Nature energy' },
  { id: 'color-rose', name: 'Rose Pink', type: 'color', price: 600, rarity: 'rare', description: 'Soft and sweet' },
  { id: 'color-midnight', name: 'Midnight Black', type: 'color', price: 900, rarity: 'epic', description: 'Dark and mysterious' },
  { id: 'color-gold', name: 'Golden Glow', type: 'color', price: 1500, rarity: 'legendary', description: 'Pure luxury' },
  
  // HATS - Simple SVG hats
  { id: 'hat-beanie', name: 'Cozy Beanie', type: 'hat', price: 450, rarity: 'common', description: 'Warm and snug' },
  { id: 'hat-cap', name: 'Baseball Cap', type: 'hat', price: 450, rarity: 'common', description: 'Classic sporty look' },
  { id: 'hat-tophat', name: 'Top Hat', type: 'hat', price: 750, rarity: 'rare', description: 'Fancy and classy' },
  { id: 'hat-crown', name: 'Royal Crown', type: 'hat', price: 1350, rarity: 'epic', description: 'Fit for royalty' },
  { id: 'hat-chef', name: 'Chef Toque', type: 'hat', price: 600, rarity: 'rare', description: 'Master chef vibes' },
  { id: 'hat-pirate', name: 'Pirate Tricorn', type: 'hat', price: 1050, rarity: 'epic', description: 'Arr matey!' },
  { id: 'hat-catears', name: 'Cat Ears', type: 'hat', price: 600, rarity: 'rare', description: 'Cute kitty vibes' },
  { id: 'hat-bunnyears', name: 'Bunny Ears', type: 'hat', price: 675, rarity: 'rare', description: 'Hoppy and adorable' },
  { id: 'hat-flower', name: 'Flower Crown', type: 'hat', price: 525, rarity: 'common', description: 'Spring garden beauty' },
  { id: 'hat-tiara', name: 'Princess Tiara', type: 'hat', price: 1200, rarity: 'epic', description: 'Royal sparkle' },
  
  // FACE - Simple face additions
  { id: 'face-blush', name: 'Rosy Cheeks', type: 'face', price: 525, rarity: 'common', description: 'Adorable blush' },
  { id: 'face-freckles', name: 'Cute Freckles', type: 'face', price: 525, rarity: 'common', description: 'Sprinkle of charm' },
  { id: 'face-whiskers', name: 'Cat Whiskers', type: 'face', price: 450, rarity: 'common', description: 'Meow!' },
  { id: 'face-hearts', name: 'Heart Eyes', type: 'face', price: 675, rarity: 'rare', description: 'In love!' },
  { id: 'face-stars', name: 'Star Eyes', type: 'face', price: 750, rarity: 'rare', description: 'Starstruck!' },
  
  // ACCESSORIES - Simple items around Mojo
  { id: 'acc-bowtie-red', name: 'Red Bow Tie', type: 'accessory', price: 450, rarity: 'common', description: 'Classic and dapper' },
  { id: 'acc-bowtie-pink', name: 'Pink Bow Tie', type: 'accessory', price: 450, rarity: 'common', description: 'Pretty in pink' },
  { id: 'acc-bowtie-blue', name: 'Blue Bow Tie', type: 'accessory', price: 450, rarity: 'common', description: 'Cool and calm' },
  { id: 'acc-bowtie-gold', name: 'Golden Bow Tie', type: 'accessory', price: 900, rarity: 'rare', description: 'Fancy formal' },
  { id: 'acc-scarf', name: 'Cozy Scarf', type: 'accessory', price: 525, rarity: 'common', description: 'Warm and stylish' },
  { id: 'acc-necklace', name: 'Gold Chain', type: 'accessory', price: 750, rarity: 'rare', description: 'Bling bling' },
  { id: 'acc-pearls', name: 'Pearl Necklace', type: 'accessory', price: 825, rarity: 'rare', description: 'Elegant beauty' },
  
  // EXCLUSIVE COLLECTION - Premium outfits
  { id: 'outfit-jamesbond', name: 'Secret Agent', type: 'accessory', price: 7500, rarity: 'legendary', description: 'Shaken, not stirred. Full tuxedo with martini and pistol.' },
  { id: 'outfit-princess', name: 'Royal Princess', type: 'accessory', price: 7500, rarity: 'legendary', description: 'Tiara, dress, and wand. Fairytale dreams!' },
  { id: 'outfit-teddy', name: 'Teddy Bear', type: 'accessory', price: 6000, rarity: 'legendary', description: 'Fuzzy ears and bow. Huggable cuteness!' },
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
  const { user } = useAuth();
  const [state, setState] = useState<CosmeticsState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false);

  // Load from database on mount if user is logged in
  useEffect(() => {
    const loadFromDatabase = async () => {
      // First try localStorage as fallback
      let localState: CosmeticsState | null = null;
      try {
        const saved = localStorage.getItem(COSMETICS_STORAGE_KEY);
        if (saved) {
          localState = JSON.parse(saved);
          if (localState && !localState.owned?.includes('color-default')) {
            localState.owned = localState.owned || [];
            localState.owned.push('color-default');
          }
        }
      } catch {}

      if (!user) {
        // No user - use localStorage or default
        if (localState) {
          setState(localState);
        }
        setIsLoaded(true);
        setHasLoadedFromDb(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('mojo_cosmetics')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading cosmetics:', error);
          if (localState) setState(localState);
          setIsLoaded(true);
          setHasLoadedFromDb(true);
          return;
        }

        if (data?.mojo_cosmetics) {
          const dbCosmetics = data.mojo_cosmetics as unknown as CosmeticsState;
          // Ensure color-default is always owned
          if (!dbCosmetics.owned?.includes('color-default')) {
            dbCosmetics.owned = dbCosmetics.owned || [];
            dbCosmetics.owned.push('color-default');
          }
          // Ensure equipped structure exists
          if (!dbCosmetics.equipped) {
            dbCosmetics.equipped = DEFAULT_STATE.equipped;
          }
          setState(dbCosmetics);
          localStorage.setItem(COSMETICS_STORAGE_KEY, JSON.stringify(dbCosmetics));
        } else if (localState) {
          // No DB data but have local - use local and sync to DB
          setState(localState);
        }
      } catch (err) {
        console.error('Error loading cosmetics:', err);
        if (localState) setState(localState);
      }
      setIsLoaded(true);
      setHasLoadedFromDb(true);
    };

    loadFromDatabase();
  }, [user]);

  // Save to database when state changes - only after initial load
  useEffect(() => {
    if (!isLoaded || !hasLoadedFromDb) return;

    // Save to localStorage immediately
    localStorage.setItem(COSMETICS_STORAGE_KEY, JSON.stringify(state));

    if (!user) return;

    // Debounce database save
    const timer = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('user_progress')
          .update({ mojo_cosmetics: JSON.parse(JSON.stringify(state)) })
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error saving cosmetics to DB:', error);
        }
      } catch (err) {
        console.error('Error saving cosmetics:', err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [state, user, isLoaded, hasLoadedFromDb]);

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
