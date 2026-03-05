import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlanType = 'FREE' | 'PREMIUM' | 'PRO';

interface PlanState {
  plan: PlanType;
  usageCount: number;
  maxLimit: number;
  setPlan: (plan: PlanType) => void;
  setUsageCount: (count: number) => void;
  incrementUsage: () => void;
  resetUsage: () => void;
}

const PLAN_LIMITS: Record<PlanType, number> = {
  FREE: 10,
  PREMIUM: 100,
  PRO: Infinity,
};

// Helper to set cookie for middleware access
const setPlanCookie = (plan: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `axai_plan=${plan}; path=/; max-age=31536000; SameSite=Lax`;
  }
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plan: 'FREE',
      usageCount: 0,
      maxLimit: PLAN_LIMITS.FREE,
      setPlan: (plan: PlanType) => {
        setPlanCookie(plan);
        set({
          plan,
          maxLimit: PLAN_LIMITS[plan]
        });
      },
      setUsageCount: (count: number) => set({ usageCount: count }),
      incrementUsage: () => set((state) => ({
        usageCount: state.usageCount + 1
      })),
      resetUsage: () => set({ usageCount: 0 }),
    }),
    {
      name: 'plan-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          setPlanCookie(state.plan);
        }
      },
    }
  )
);
