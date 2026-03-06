-- 1. receipts 테이블에 사업자등록번호(business_number) 컬럼 추가
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS business_number VARCHAR(50);

-- 2. 스키마 캐시 갱신 (Supabase API가 새 컬럼을 바로 인식하도록 강제 갱신)
NOTIFY pgrst, 'reload schema';

