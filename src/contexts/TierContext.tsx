import { createContext, useContext, ReactNode } from "react";
import { TierLevel, TierInfo, TIER_CONFIG } from "@/lib/tiers";
import { useAuth } from "@/contexts/AuthContext";

interface TierContextType {
  tier: TierInfo;
  isLoading: boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

/**
 * For now this uses a mock tier. In production, this would read from
 * access_rights / orders to determine the user's active tier.
 */
export const TierProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  // Mock: give logged-in users "basic" tier for demo purposes
  const level: TierLevel = user ? "basic" : "none";
  const config = TIER_CONFIG[level];

  const tier: TierInfo = {
    level,
    name: config.name,
    expiresAt: user ? "2026-06-19T00:00:00Z" : null,
    categoriesOpen: config.categoriesOpen,
    totalCategories: 6,
    materialsOpen: config.materialsOpen,
    totalMaterials: 50,
  };

  return (
    <TierContext.Provider value={{ tier, isLoading: loading }}>
      {children}
    </TierContext.Provider>
  );
};

export const useTier = () => {
  const ctx = useContext(TierContext);
  if (!ctx) throw new Error("useTier must be used within TierProvider");
  return ctx;
};
