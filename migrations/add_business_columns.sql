-- organizations 테이블에 사업자 정보 보강
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS business_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS representative_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
