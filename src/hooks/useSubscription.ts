import { usePlanStore, PlanType } from '@/store/usePlanStore';

export function useSubscription() {
    const { plan, usageCount, maxLimit } = usePlanStore();

    const isPremium = plan === 'PREMIUM' || plan === 'PRO';
    const isPro = plan === 'PRO';
    const hasReachedLimit = usageCount >= maxLimit;

    return {
        plan,
        usageCount,
        maxLimit,
        isPremium,
        isPro,
        hasReachedLimit,
        usagePercentage: maxLimit === Infinity ? 0 : (usageCount / maxLimit) * 100,
    };
}
