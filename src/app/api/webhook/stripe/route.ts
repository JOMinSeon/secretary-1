import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Webhook verification failed';
        console.error(`Webhook Error: ${message}`);
        return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
    }

    // 1. 체크아웃 세션 완료 (결제 성공 시점)
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
            console.log(`Payment success for User: ${userId}, Plan: ${plan}`);

            // 사용자 프로필 및 조직 정보 업데이트
            // 1-1. 사용자 프로필 업데이트 (PREMIUM/PRO 멤버십 표기용)
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (profileError) console.error('Profile update error:', profileError);

            // 1-2. 구독 정보(Subscriptions) 테이블 기록
            // 먼저 사용자가 속한 조직 ID를 찾아야 함 (현재는 유저당 1개의 조직으로 매핑됨)
            const { data: memberData } = await supabaseAdmin
                .from('organization_members')
                .select('org_id')
                .eq('user_id', userId)
                .single();

            if (memberData?.org_id) {
                // 1-2. 활성 플랜 정보 조회
                const { data: planData } = await supabaseAdmin
                    .from('plans')
                    .select('id, base_receipt_limit')
                    .eq('name', plan)
                    .single();

                if (planData) {
                    // 1-3. 구독 정보(Subscriptions) 테이블 기록
                    const { error: subError } = await supabaseAdmin
                        .from('subscriptions')
                        .upsert({
                            org_id: memberData.org_id,
                            plan_id: planData.id,
                            status: 'ACTIVE',
                            pg_subscription_id: session.subscription as string,
                            current_period_start: new Date().toISOString(),
                            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        }, { onConflict: 'org_id' });

                    if (subError) console.error('Subscription update error:', subError);

                    // 1-4. 조직 크레딧(한도) 업데이트 추가
                    await supabaseAdmin
                        .from('organization_credits')
                        .update({
                            subscription_limit: planData.base_receipt_limit,
                            updated_at: new Date().toISOString()
                        })
                        .eq('org_id', memberData.org_id);
                }

                // 1-5. 결제 내역 기록
                await supabaseAdmin.from('billing_history').insert({
                    org_id: memberData.org_id,
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    status: 'SUCCESS',
                    paid_at: new Date().toISOString(),
                });
            }
        }
    }

    // 2. 구독 취소 또는 종료 처리
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const pgSubId = subscription.id;

        await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'CANCELED' })
            .eq('pg_subscription_id', pgSubId);
    }

    return new NextResponse(null, { status: 200 });
}
