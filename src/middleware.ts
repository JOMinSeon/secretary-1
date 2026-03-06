import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    // 1. Supabase Session Update & Base Auth Check
    const response = await updateSession(request)

    // [보안 강화] 서버 사이드 세션 검증
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                }
            }
        }
    )

    // getUser()는 토큰의 유효성을 서버에서 실제 검증하므로 안전함
    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    // A. 로그인한 사용자가 인증 페이지(/login, /signup) 접근 시 대시보드로 리다이렉트
    if (user && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // B. 비로그인 사용자가 보호된 라우트 접근 시 로그인 페이지로 리다이렉트
    const protectedRoutes = ['/dashboard', '/reports', '/settings', '/checkout'];
    if (!user && protectedRoutes.some(path => pathname.startsWith(path))) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('return_to', pathname);
        return NextResponse.redirect(url);
    }

    // C. 유료 기능 접근 제어 (기존 로직 유지)
    if (pathname.startsWith('/reports')) {
        const plan = request.cookies.get('axai_plan')?.value || 'FREE';
        if (plan === 'FREE') {
            const url = request.nextUrl.clone();
            url.pathname = '/pricing';
            url.searchParams.set('reason', 'premium_only');
            return NextResponse.redirect(url);
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
