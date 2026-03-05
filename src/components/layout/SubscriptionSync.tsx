"use client";

import { useEffect } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { getCurrentSubscription } from "@/lib/actions/subscription-actions";
import { createClient } from "@/lib/supabase/browser";

export function SubscriptionSync() {
    const { setPlan, setUsageCount } = usePlanStore();
    const supabase = createClient();

    useEffect(() => {
        const syncSubscription = async () => {
            // 세션 체크 후 동기화
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const sub = await getCurrentSubscription();
                if (sub) {
                    setPlan(sub.plan);
                    setUsageCount(sub.usageCount);
                }
            }
        };

        syncSubscription();

        // 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    syncSubscription();
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [setPlan, setUsageCount, supabase]);

    return null; // Side effect only
}
