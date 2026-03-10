-- ==========================================
-- SaaS Billing Database Schema
-- 실행 방법: Supabase SQL Editor에서 이 스크립트를 전체 복사해서 실행하세요.
-- 역할: Stripe 결제 연동(플랜, 구독 상태, 결제 내역)을 위한 필수 테이블들을 생성합니다.
-- ==========================================


-- ==========================================
-- 1. [plans] 요금제 종류 테이블 생성
-- ==========================================
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'FREE', 'PREMIUM', 'PRO' 등
    description TEXT,
    stripe_price_id TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'KRW',
    base_receipt_limit INTEGER NOT NULL DEFAULT 10,
    billing_cycle TEXT DEFAULT 'monthly',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 기존에 테이블이 있을 경우를 위해 누락된 컬럼 추가 (에러 방지용 호환성 작업)
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'KRW';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- (이전 과정의 오류로 인해) 만약 동일한 이름의 요금제가 여러 개 중복해서 들어갔다면 1개만 남기고 모두 삭제합니다.
DELETE FROM public.plans WHERE ctid NOT IN (
    SELECT MIN(ctid) FROM public.plans GROUP BY name
);

-- 기존에 UNIQUE 조건 없이 테이블이 만들어졌을 오류를 대비하여 명시적으로 추가
ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_name_key;
ALTER TABLE public.plans ADD CONSTRAINT plans_name_key UNIQUE (name);

-- 누구나 읽을 수 있는 RLS 설정
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
CREATE POLICY "Anyone can view plans" ON public.plans FOR SELECT USING (true);

-- (초기 데이터 삽입) 만약 비어있다면, 3가지 기본 플랜을 추가합니다.
INSERT INTO public.plans (name, description, stripe_price_id, price, currency, base_receipt_limit, billing_cycle, is_active)
VALUES 
    ('FREE', '기본 무료 요금제', NULL, 0, 'KRW', 10, 'monthly', true),
    ('PREMIUM', '프리미엄 요금제', NULL, 9900, 'KRW', 150, 'monthly', true),
    ('PRO', '프로모션 전용 요금제', NULL, 24000, 'KRW', 1000, 'monthly', true)
ON CONFLICT (name) DO UPDATE 
SET base_receipt_limit = EXCLUDED.base_receipt_limit, price = EXCLUDED.price;


-- ==========================================
-- 2. [subscriptions] 활성화된 유료 구독 정보 테이블 생성
-- ==========================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'CANCELED', 'PAST_DUE' 등
    pg_subscription_id TEXT, -- Stripe의 실제 구독 ID (예: sub_1M...)
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 본인이 속한 조직의 구독 정보만 조회 가능 (생성/수정은 서버 Webhook이 담당)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their org subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their org subscriptions" ON public.subscriptions 
FOR SELECT USING (
    org_id IN (
        SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);


-- ==========================================
-- 3. [billing_history] 실제 결제 및 승인 내역 테이블 생성
-- ==========================================
CREATE TABLE IF NOT EXISTS public.billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'REFUNDED' 등
    paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 본인이 속한 조직의 결제 내역만 조회 가능 (생성/기록은 서버 Webhook이 담당)
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their org billing history" ON public.billing_history;
CREATE POLICY "Users can view their org billing history" ON public.billing_history 
FOR SELECT USING (
    org_id IN (
        SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);


-- ==========================================
-- 4. [organization_credits] 조직 사용량(크레딧) 테이블 보완
-- ==========================================
-- 기존에 생성되지 않았다면 만들고, RLS 설정
CREATE TABLE IF NOT EXISTS public.organization_credits (
    org_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_limit INTEGER NOT NULL DEFAULT 10,
    used_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 본인이 속한 조직의 잔여 크레딧/사용량만 조회 가능
ALTER TABLE public.organization_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their org credits" ON public.organization_credits;
CREATE POLICY "Users can view their org credits" ON public.organization_credits 
FOR SELECT USING (
    org_id IN (
        SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

-- 오직 '로그인한 사용자'만 요금제를 조회할 수 있게 변경
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
DROP POLICY IF EXISTS "Authenticated users can view plans" ON public.plans;
CREATE POLICY "Authenticated users can view plans" ON public.plans FOR SELECT USING (auth.role() = 'authenticated');


