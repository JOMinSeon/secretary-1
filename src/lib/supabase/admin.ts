import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in production.');
    }
}

/**
 * [SECURITY] ADMIN CLIENT (RLS Bypass)
 * 이 클라이언트는 모든 Row Level Security(RLS)를 우회합니다.
 * - 오직 서버 측(Webhooks, Server-only jobs)에서만 사용해야 합니다.
 * - 일반적인 Server Action이나 Client Component에서 절대 사용하지 마세요.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
