'use server';

import { createClient } from '@/lib/supabase/server';
import { PlanType } from '@/store/usePlanStore';
import { stripe } from '@/lib/stripe';
import { revalidatePath } from 'next/cache';

export async function upgradeSubscription(planName: PlanType, sessionId: string) {
    try {
        const supabase = await createClient();

        // 1. 현재 사용자 가져오기
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated');

        // 2. Stripe 결제 세션 검증 (세션 ID 검증)
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
        if (stripeSession.payment_status !== 'paid') {
            throw new Error('Payment verification failed.');
        }

        /**
         * [SECURITY] 직접적인 DB 업데이트 로직 제거
         * 민감한 구독 정보 변경은 오직 신뢰할 수 있는 Webhook(supabaseAdmin 사용)에서만 처리합니다.
         * 여기서는 사용자의 최신 정보를 반영하기 위해 경로만 캐시 무효화(revalidatePath)합니다.
         */

        // 데이터가 아직 웹훅에 의해 업데이트되지 않았을 수 있으므로 대시보드 진입 시 최신화 유도
        revalidatePath('/');
        revalidatePath('/dashboard');
        revalidatePath('/reports');

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error('Upgrade Verification Error:', error);
        return { success: false, error: message };
    }
}

export async function getCurrentSubscription() {
    try {
        const supabase = await createClient();

        // 1. 현재 사용자 가져오기
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { plan: 'FREE' as PlanType, usageCount: 0 };
        }

        // 2. 조직 크레딧(사용량) 가져오기
        const { data: creditData } = await supabase
            .from('organization_credits')
            .select('used_count, subscription_limit')
            .eq('org_id', (
                await supabase
                    .from('organization_members')
                    .select('org_id')
                    .eq('user_id', user.id)
                    .single()
            ).data?.org_id)
            .single();

        // 3. 활성 구독 플랜 가져오기
        const { data: subData } = await supabase
            .from('subscriptions')
            .select('plan_id, plans(name)')
            .eq('org_id', (
                await supabase
                    .from('organization_members')
                    .select('org_id')
                    .eq('user_id', user.id)
                    .single()
            ).data?.org_id)
            .eq('status', 'ACTIVE')
            .single();

        const planName = (subData as { plans?: { name?: string } })?.plans?.name as PlanType || 'FREE';

        return {
            plan: planName,
            usageCount: creditData?.used_count || 0,
            maxLimit: creditData?.subscription_limit || 10
        };
    } catch (error) {
        console.error('Fetch Subscription Error:', error);
        return { plan: 'FREE' as PlanType, usageCount: 0, maxLimit: 10 };
    }
}
