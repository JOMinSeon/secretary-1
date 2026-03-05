import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. Supabase Session Update & Base Auth Check
    const response = await updateSession(request)

    // 2. 인증이 필요한 라우트 보호
    const { pathname } = request.nextUrl;

    // /reports 경로는 유료 플랜이거나 유효한 세션이 있어야 함 
    // (여기서는 세션 체크와 쿠키를 병행하되, 최종 검증은 Server Component에서 수행)
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
