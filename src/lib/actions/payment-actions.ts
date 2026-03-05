'use server';

import { stripe } from '@/lib/stripe';
import { PlanType } from '@/store/usePlanStore';
import { headers } from 'next/headers';

const PLAN_PRICES: Record<string, string> = {
    // 실제 Stripe 대시보드에서 생성한 Product/Price ID를 여기에 입력하세요.
    // 아래 ID들은 예시이며, 실제 ID로 교체 전까지는 $19/$49 결제 항목이 기본으로 생성됩니다.
    PREMIUM: 'premium_price_id',
    PRO: 'pro_price_id',
};

export async function createCheckoutSession(plan: PlanType, userId?: string) {
    try {
        const headerList = await headers();
        const origin = headerList.get('origin');

        if (!origin) {
            throw new Error('Could not determine origin for redirect URLs.');
        }

        // 실제 Price ID가 없다면 테스트용 고정 데이터로 세션 생성
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `axAI Secretary ${plan} Subscription`,
                            description: plan === 'PREMIUM' ? 'Monthly Premium Membership' : 'Monthly Pro Membership',
                        },
                        unit_amount: plan === 'PREMIUM' ? 1900 : 4900, // $19.00 or $49.00
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
            cancel_url: `${origin}/pricing`,
            metadata: {
                plan: plan,
                userId: userId || '',
            },
        });

        return { sessionId: session.id, url: session.url };
    } catch (error) {
        const message = error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.';
        console.error('Stripe Checkout Error:', error);
        throw new Error(message);
    }
    }
}
