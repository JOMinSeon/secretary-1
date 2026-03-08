-- AI 지출 분류기 확장을 위한 마이그레이션 SQL
-- 실행 방법: Supabase SQL Editor에서 실행하세요.

-- 1. receipts 테이블에 AI 분석 관련 컬럼 추가
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS tax_tip TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. 기존 데이터의 status를 completed로 업데이트 (이미 카테고리가 있는 경우)
UPDATE public.receipts 
SET status = 'completed' 
WHERE category IS NOT NULL AND status = 'pending';

-- 3. 설명 주석 추가
COMMENT ON COLUMN public.receipts.tax_tip IS 'AI가 제공하는 절세 팁 텍스트';
COMMENT ON COLUMN public.receipts.status IS '분류 상태 (pending: 분류 전, completed: 분류 완료)';
