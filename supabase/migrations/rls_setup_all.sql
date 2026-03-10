-- ==========================================
-- Supabase Row Level Security (RLS) Setup
-- ==========================================

-- --------------------------------------------------------
-- 1. PROFILES Table
-- --------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- --------------------------------------------------------
-- 2. ORGANIZATIONS & MEMBERS Tables
-- --------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 사용자는 본인이 속한 조직만 볼 수 있음
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
CREATE POLICY "Users can view their organizations"
ON public.organizations FOR SELECT
USING (
  id IN (
    SELECT org_id 
    FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- 사용자는 본인의 멤버십 정보만 볼 수 있음
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.organization_members;
CREATE POLICY "Users can view their own memberships"
ON public.organization_members FOR SELECT
USING (user_id = auth.uid());


-- --------------------------------------------------------
-- 3. RECEIPTS Table
-- --------------------------------------------------------
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own receipts" ON public.receipts;
CREATE POLICY "Users can manage own receipts"
ON public.receipts FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());


-- --------------------------------------------------------
-- 4. PLANS Table (Public/Authenticated Read-Only)
-- --------------------------------------------------------
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
CREATE POLICY "Anyone can view plans"
ON public.plans FOR SELECT
USING (true);


-- --------------------------------------------------------
-- 5. SUBSCRIPTIONS, CREDITS, & BILLING Tables
-- --------------------------------------------------------
-- 이 테이블들은 주로 서버(Webhook)에서 Service Role을 통해 업데이트되므로 INSERT/UPDATE 권한은 생략
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their org subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their org subscriptions"
ON public.subscriptions FOR SELECT
USING (
  org_id IN (
    SELECT org_id 
    FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view their org credits" ON public.organization_credits;
CREATE POLICY "Users can view their org credits"
ON public.organization_credits FOR SELECT
USING (
  org_id IN (
    SELECT org_id 
    FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view their org billing history" ON public.billing_history;
CREATE POLICY "Users can view their org billing history"
ON public.billing_history FOR SELECT
USING (
  org_id IN (
    SELECT org_id 
    FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- ==========================================
-- End of RLS Setup
-- ==========================================
