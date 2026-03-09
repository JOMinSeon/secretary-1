"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { usePathname } from 'next/navigation';
import { SubscriptionSync } from "./SubscriptionSync";
import { TaxAssistantChat } from "../chat/TaxAssistantChat";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';

    if (isLandingPage) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <SubscriptionSync />
            <AppSidebar />
            <SidebarInset className="flex flex-col bg-slate-50/50">
                <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 sticky top-0 z-50 shadow-sm">
                    <SidebarTrigger className="text-slate-500 hover:text-slate-900 hover:bg-slate-100" />
                    <div className="ml-4 h-4 w-px bg-slate-200" />
                    <div className="ml-4">
                        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            {pathname.includes('/settings') ? '설정' :
                                pathname.includes('/pricing') ? '요금제' :
                                    pathname.includes('/receipts') ? '영수증 관리' : '대시보드'}
                        </h1>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-6 md:p-10">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </SidebarInset>
            <TaxAssistantChat />
        </SidebarProvider>
    );
}
