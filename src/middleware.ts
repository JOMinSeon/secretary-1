import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. Plan-based redirection logic (merged from proxy.ts)
    const plan = request.cookies.get('axai_plan')?.value || 'FREE';
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/reports')) {
        if (plan !== 'PREMIUM' && plan !== 'PRO') {
            const url = request.nextUrl.clone();
            url.pathname = '/pricing';
            url.searchParams.set('reason', 'premium_only');
            return NextResponse.redirect(url);
        }
    }

    // 2. Supabase Session Update
    return await updateSession(request)
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
