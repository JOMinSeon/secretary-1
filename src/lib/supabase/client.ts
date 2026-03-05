import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// NOTE:
// 실제 환경에서는 Next.js SSR을 위해 @supabase/ssr 패키지의
// createBrowserClient 와 createServerClient 를 사용하는 것을 권장합니다.
// 여기서는 테스트와 UI 시연을 위해 기본 클라이언트를 먼저 세팅합니다.
