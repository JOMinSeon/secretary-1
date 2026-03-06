-- axAI SaaS를 위한 고성능 확장형 데이터베이스 스키마 (v1.0)
-- Supabase SQL Editor에서 실행하세요.

-- 0. 확장 프로그램 활성화 및 초기화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 기존 간단한 영수증 테이블이 있을 경우 삭제 (SaaS 스키마로 업그레이드)
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.ai_usage_logs CASCADE;
DROP TABLE IF EXISTS public.organization_credits CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- 1. 조직(Organizations) 관리 - 테넌트 단위
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    billing_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 사용자 프로필(Profiles) - auth.users와 연동
-- Supabase Auth의 사용자를 확장하는 테이블입니다.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 조직 구성원(Organization Members) - 다대다 관계 및 권한
CREATE TABLE IF NOT EXISTS public.organization_members (
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER', -- OWNER, ADMIN, MEMBER
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (org_id, user_id)
);

-- 4. 구독 플랜(Plans)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Free, Pro, Enterprise
    description TEXT,
    billing_cycle VARCHAR(50) NOT NULL, -- MONTHLY, YEARLY
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KRW',
    base_receipt_limit INT NOT NULL DEFAULT 10, -- 영수증 분석 제한
    stripe_price_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. 구독 상태(Subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    plan_id UUID REFERENCES public.plans(id),
    status VARCHAR(50) NOT NULL, -- ACTIVE, PAST_DUE, CANCELED, TRIALING
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    pg_subscription_id VARCHAR(255), -- Stripe 등 외부 결제 ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. 영수증(Receipts) - 조직 단위로 귀속
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    merchant_name TEXT,
    receipt_date TIMESTAMP WITH TIME ZONE,
    total_amount NUMERIC(15, 2),
    vat_amount NUMERIC(15, 2),
    items JSONB,
    category VARCHAR(50),
    is_deductible BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. AI 사용량 로그(AI Usage Logs)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    model_name VARCHAR(100) NOT NULL,
    prompt_tokens INT,
    completion_tokens INT,
    total_tokens INT,
    action_type VARCHAR(50), -- RECEIPT_ANALYSIS, CHAT, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. 조직 크레딧(Organization Credits) - Metering 실시간 잔량
CREATE TABLE IF NOT EXISTS public.organization_credits (
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE PRIMARY KEY,
    subscription_limit INT DEFAULT 10, -- 이달 제공량
    used_count INT DEFAULT 0, -- 사용량
    purchased_credits DECIMAL(15, 2) DEFAULT 0, -- 추가 구매 크레딧
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. 결제 내역(Billing History)
CREATE TABLE IF NOT EXISTS public.billing_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id),
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED, REFUNDED
    invoice_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. 결제 수단(Payment Methods) - 빌링키 기반
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    pg_provider VARCHAR(50) NOT NULL, -- STRIPE, PORTONE
    billing_key VARCHAR(255) NOT NULL,
    card_brand VARCHAR(50),
    card_last4 VARCHAR(4),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- [[보안 및 정책 설정 (RLS)]] --
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_credits ENABLE ROW LEVEL SECURITY;

-- 조직 멤버만 해당 조직의 데이터를 볼 수 있는 정책 (Receipts)
CREATE POLICY "Members can view org receipts" ON public.receipts
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE org_id = public.receipts.org_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Members can insert org receipts" ON public.receipts
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE org_id = public.receipts.org_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Members can update org receipts" ON public.receipts
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE org_id = public.receipts.org_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Members can delete org receipts" ON public.receipts
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE org_id = public.receipts.org_id
        AND user_id = auth.uid()
    )
);

-- Profiles 정책 (자신의 프로필만 조회/수정 가능)
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Organization Members 정책 (자신이 속한 조직의 멤버 정보만 조회 가능)
CREATE POLICY "Users can view their own membership" ON public.organization_members
FOR SELECT USING (auth.uid() = user_id);

-- Organization Credits 정책 (조직 멤버만 조회 가능)
CREATE POLICY "Members can view org credits" ON public.organization_credits
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE org_id = public.organization_credits.org_id
        AND user_id = auth.uid()
    )
);

-- [[초기 데이터 시딩 (Plans)]] --
INSERT INTO public.plans (name, description, billing_cycle, price, base_receipt_limit)
VALUES 
('FREE', '기본 영수증 분석 (월 10회)', 'MONTHLY', 0, 10),
('PREMIUM', '고급 분석 및 무제한 리포트 (월 100회)', 'MONTHLY', 19000, 100),
('PRO', '전문가용 무제한 플랜', 'MONTHLY', 49000, 999999);

-- [[트리거: 새 사용자 가입 시 자동 워크스페이스 생성]] --
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_org_id UUID;
BEGIN
    -- 1. 조직 생성
    INSERT INTO public.organizations (name, billing_email)
    VALUES (new.email || '의 워크스페이스', new.email)
    RETURNING id INTO new_org_id;

    -- 2. 프로필 생성
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);

    -- 3. 조직 구성원으로 등록 (OWNER)
    INSERT INTO public.organization_members (org_id, user_id, role)
    VALUES (new_org_id, new.id, 'OWNER');

    -- 4. 기본 크레딧 설정
    INSERT INTO public.organization_credits (org_id, subscription_limit)
    VALUES (new_org_id, 10);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 신규 가입 시 트리거 실행
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
