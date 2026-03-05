'use server';

import { createClient } from '@/lib/supabase/server';
import { PlanType } from '@/store/usePlanStore';

export async function upgradeSubscription(planName: PlanType) {
    try {
        const supabase = await createClient();

        // 1. 현재 사용자 가져오기
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // 2. 사용자의 조직 ID 가져오기
        const { data: memberData, error: memberError } = await supabase
            .from('organization_members')
            .select('org_id')
            .eq('user_id', user.id)
            .single();

        if (memberError || !memberData) {
            throw new Error('Could not find user organization');
        }

        const orgId = memberData.org_id;

        // 3. 플랜 정보 가져오기
        const { data: planData, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('name', planName)
            .single();

        if (planError || !planData) {
            throw new Error('Invalid plan selected');
        }

        // 4. 구독 상태 업데이트
        const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
                org_id: orgId,
                plan_id: planData.id,
                status: 'ACTIVE',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
            }, { onConflict: 'org_id' });

        if (subError) {
            throw subError;
        }

        // 5. 조직 크레딧(한도) 업데이트
        const { error: creditError } = await supabase
            .from('organization_credits')
            .update({
                subscription_limit: planData.base_receipt_limit,
                updated_at: new Date().toISOString()
            })
            .eq('org_id', orgId);

        if (creditError) {
            throw creditError;
        }

        return { success: true };
    } catch (error: any) {
        console.error('Upgrade Error:', error);
        return { success: false, error: error.message };
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

        const planName = (subData as any)?.plans?.name as PlanType || 'FREE';

        return {
            plan: planName,
            usageCount: creditData?.used_count || 0,
            maxLimit: creditData?.subscription_limit || 10
        };
    } catch (error: any) {
        console.error('Fetch Subscription Error:', error);
        return { plan: 'FREE' as PlanType, usageCount: 0, maxLimit: 10 };
    }
}
