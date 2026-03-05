import Stripe from 'stripe';

// 빌드 타임에는 환경 변수가 없을 수 있으므로 런타임에만 검증합니다.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder', {
    apiVersion: '2026-02-25.clover',
    typescript: true,
});
