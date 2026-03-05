"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';

    if (isLandingPage) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-slate-50">
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                    <header className="h-16 border-b bg-white flex items-center px-6 sticky top-0 z-10">
                        <SidebarTrigger />
                        <div className="ml-4 h-4 w-px bg-slate-200" />
                        <div className="ml-4">
                            <h1 className="text-sm font-semibold text-slate-900">
                                {pathname.includes('/settings') ? '설정' :
                                    pathname.includes('/pricing') ? '요금제' :
                                        pathname.includes('/receipts') ? '영수증 관리' : '대시보드'}
                            </h1>
                        </div>
                    </header>
                    <div className="p-6 md:p-10 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
