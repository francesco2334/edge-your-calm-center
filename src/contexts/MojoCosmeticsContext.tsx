import { createContext, useContext, ReactNode } from 'react';
import { useMojoCosmetics, CosmeticType, Cosmetic, COSMETICS_CATALOG } from '@/hooks/useMojoCosmetics';
import type { EquippedCosmetics } from '@/components/MojoOrb';

interface MojoCosmeticsContextType {
  owned: string[];
  equipped: Record<CosmeticType, string | null>;
  equippedCosmetics: EquippedCosmetics;
  ownsCosmetic: (cosmeticId: string) => boolean;
  purchaseCosmetic: (cosmeticId: string) => boolean;
  equipCosmetic: (cosmeticId: string) => void;
  unequipCosmetic: (type: CosmeticType) => void;
  getEquippedCosmetics: () => { type: CosmeticType; cosmetic: Cosmetic }[];
  getCosmeticsByType: (type: CosmeticType) => Cosmetic[];
  catalog: Cosmetic[];
}

const MojoCosmeticsContext = createContext<MojoCosmeticsContextType | null>(null);

export function MojoCosmeticsProvider({ children }: { children: ReactNode }) {
  const cosmetics = useMojoCosmetics();
  
  // Convert to the format MojoOrb expects
  const equippedCosmetics: EquippedCosmetics = {
    color: cosmetics.equipped.color,
    hat: cosmetics.equipped.hat,
    face: cosmetics.equipped.face,
    accessory: cosmetics.equipped.accessory,
  };

  return (
    <MojoCosmeticsContext.Provider value={{ ...cosmetics, equippedCosmetics }}>
      {children}
    </MojoCosmeticsContext.Provider>
  );
}

export function useMojoCosmeticsContext() {
  const context = useContext(MojoCosmeticsContext);
  if (!context) {
    throw new Error('useMojoCosmeticsContext must be used within MojoCosmeticsProvider');
  }
  return context;
}

// Optional hook that returns undefined if outside provider (for components that may not have it)
export function useMojoCosmeticsOptional() {
  return useContext(MojoCosmeticsContext);
}
