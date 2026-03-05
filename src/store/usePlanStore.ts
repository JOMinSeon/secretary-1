import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlanType = 'FREE' | 'PREMIUM' | 'PRO';

interface PlanState {
  plan: PlanType;
  usageCount: number;
  maxLimit: number;
  setPlan: (plan: PlanType) => void;
  incrementUsage: () => void;
  resetUsage: () => void;
}

const PLAN_LIMITS: Record<PlanType, number> = {
  FREE: 10,
  PREMIUM: 100,
  PRO: Infinity,
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plan: 'FREE',
      usageCount: 0,
      maxLimit: PLAN_LIMITS.FREE,
      setPlan: (plan: PlanType) => set({ 
        plan, 
        maxLimit: PLAN_LIMITS[plan] 
      }),
      incrementUsage: () => set((state) => ({ 
        usageCount: state.usageCount + 1 
      })),
      resetUsage: () => set({ usageCount: 0 }),
    }),
    {
      name: 'plan-storage',
    }
  )
);
