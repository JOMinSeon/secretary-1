-- ==========================================
-- 1. 사용자 생성 트리거(Trigger) 재생성 및 수정
-- ==========================================

-- 기존 트리거 삭제 (충돌 방지)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 트리거 함수가 존재하지 않을 수 있으므로 한 번 더 확실히 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_org_id UUID;
    full_name_val TEXT;
BEGIN
    full_name_val := new.raw_user_meta_data->>'full_name';

    INSERT INTO public.organizations (name, billing_email)
    VALUES (COALESCE(full_name_val, new.email) || '의 워크스페이스', new.email)
    RETURNING id INTO new_org_id;

    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, full_name_val);

    INSERT INTO public.organization_members (org_id, user_id, role)
    VALUES (new_org_id, new.id, 'OWNER');

    INSERT INTO public.organization_credits (org_id, subscription_limit)
    VALUES (new_org_id, 10);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- [핵심 수정] 깔끔한 구문 및 EXECUTE FUNCTION 사용
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- 2. Storage 버킷 설정 (receipts 버킷 생성)
-- ==========================================

-- 퍼블릭 모드로 receipts 버킷 생성 (이미 있다면 Public 속성만 업데이트)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 버킷에 대해 강제 RLS(Row Level Security) 속성 부여
UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5MB 제한 (예시)
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'receipts';


-- ==========================================
-- 3. Storage 버킷 권한(RLS) 정책 설정
-- ==========================================

-- 3-1. 영수증 이미지 조회 정책 (누구나 읽기 가능)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'receipts');

-- 3-2. 영수증 이미지 업로드 정책 (로그인한 사용자만 업로드)
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
CREATE POLICY "Authenticated users can upload receipts" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

-- 3-3. 본인이 업로드한 이미지만 수정/삭제할 수 있는 보안 정책
DROP POLICY IF EXISTS "Users can update/delete own receipts" ON storage.objects;
CREATE POLICY "Users can update/delete own receipts" 
    ON storage.objects 
    FOR ALL 
    USING (bucket_id = 'receipts' AND auth.uid() = owner)
    WITH CHECK (bucket_id = 'receipts' AND auth.uid() = owner);
