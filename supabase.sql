-- 3단계: 매입 내역 DB 및 플랜별 필터링용 Supabase 스키마
-- Supabase SQL Editor에 복사하여 붙여넣고 실행하세요.

-- 1. receipts 테이블 생성 (영수증 내역)
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT,
    merchant_name TEXT,
    receipt_date TIMESTAMP WITH TIME ZONE,
    total_amount NUMERIC(10, 2),
    vat_amount NUMERIC(10, 2),
    items JSONB,
    category TEXT,
    is_deductible BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS(Row Level Security) 설정
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- 자신의 영수증 데이터만 CRUD 할 수 있도록 정책 설정
CREATE POLICY "Users can view their own receipts" 
    ON public.receipts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts" 
    ON public.receipts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts" 
    ON public.receipts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts" 
    ON public.receipts FOR DELETE 
    USING (auth.uid() = user_id);

-- 2. Mock Data 삽입 (테스트용)
-- (auth.users 에 유효한 user_id 가 없으면 오류가 날 수 있으므로, 테스트용으로 user_id를 임의로 넣거나 생략합니다)
-- 실제 연동 전 UI 테스트를 위해 RLS를 잠시 비활성화하거나, user_id 없이 조회할 수 있도록 public 접속 권한을 추가할 수도 있습니다.
