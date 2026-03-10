import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // API 라우트와 Server Actions은 미들웨어 인증 체크에서 제외
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // 중요: 토큰이 갱신되었을 때 브라우저 쿠키도 업데이트 해줘야 에러가 안 납니다.
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // 이 함수를 호출해야 세션이 검증/갱신되고 위 쿠키 로직이 작동합니다.
    const { data: { user } } = await supabase.auth.getUser();

    // 리다이렉트를 처리할 때 쿠키를 유지하기 위한 헬퍼 변수
    let redirectUrl: URL | null = null;

    // A. 로그인한 사용자가 인증 페이지(/login, /signup) 접근 시 대시보드로 리다이렉트
    if (user && (pathname === '/login' || pathname === '/signup')) {
        redirectUrl = new URL('/dashboard', request.url);
    }

    // B. 보호된 라우트 및 관리자 페이지 접근 제어
    const protectedRoutes = ['/dashboard', '/reports', '/settings', '/checkout', '/receipts', '/expenses', '/test-ai'];
    
    // 1. 일반 보호된 기능 접근 체크 (비로그인 사용자)
    if (!user && protectedRoutes.some(path => pathname.startsWith(path))) {
        redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('return_to', pathname);
    }
    
    // 2. 관리자 페이지(/admin) 전용 접근 제어
    if (pathname.startsWith('/admin')) {
        if (!user) {
            redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/login';
            redirectUrl.searchParams.set('return_to', pathname);
        } else {
            // 여기에 실제 관리자를 구분하는 조건(예: 특정 이메일, role 메타데이터 등)을 지정합니다.
            // 임시로 ADMIN_EMAIL 환경 변수나 특정 이메일을 사용해 관리자를 판별합니다.
            const isAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user.email === 'admin@axai.co.kr';
            
            if (!isAdmin) {
                // 관리자가 아닌 사용자가 접근할 경우 대시보드로 강제 이동
                redirectUrl = new URL('/dashboard', request.url);
            }
        }
    }

    // C. 유료 기능 접근 제어 (기존 로직 유지)
    if (!redirectUrl && pathname.startsWith('/reports')) {
        const plan = request.cookies.get('axai_plan')?.value || 'FREE';
        if (plan === 'FREE') {
            redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/pricing';
            redirectUrl.searchParams.set('reason', 'premium_only');
        }
    }

    if (redirectUrl) {
        // Redirection Response 생성
        const redirectResponse = NextResponse.redirect(redirectUrl);
        // Supabase가 세팅한 쿠키들을 전부 복사하여 응답 객체가 리다이렉트 될 때 쿠키가 적용되도록 합니다.
        response.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
        });
        return redirectResponse;
    }

    return response;
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
