import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const plan = request.cookies.get('axai_plan')?.value || 'FREE';
    const { pathname } = request.nextUrl;

    // PREMIUM or PRO check for reports
    if (pathname.startsWith('/reports')) {
        if (plan !== 'PREMIUM' && plan !== 'PRO') {
            const url = request.nextUrl.clone();
            url.pathname = '/pricing';
            // Add a query param to tell the user they need premium
            url.searchParams.set('reason', 'premium_only');
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/reports/:path*'],
};
