"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Receipt,
    BarChart3,
    Settings,
    Zap,
    Lock,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const navItems = [
    { icon: LayoutDashboard, label: "대시보드", href: "/", premium: false },
    { icon: Receipt, label: "영수증 관리", href: "/receipts", premium: false },
    { icon: BarChart3, label: "리포트", href: "/reports", premium: true },
    { icon: Settings, label: "설정", href: "/settings", premium: false },
];

export function AppSidebar() {
    const { plan, usageCount, maxLimit, usagePercentage, isPremium } = useSubscription();
    const pathname = usePathname();

    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader className="p-4 flex flex-row items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Receipt className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden">
                    axAI Secretary
                </span>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="px-2">
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.label}
                                className={`flex items-center gap-3 py-6 ${pathname === item.href ? 'bg-indigo-50 text-indigo-600 font-bold' : ''}`}
                                isActive={pathname === item.href}
                            >
                                <Link href={item.href}>
                                    <item.icon className="w-5 h-5" />
                                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                    {item.premium && !isPremium && (
                                        <Lock className="w-3 h-3 ml-auto opacity-50 group-data-[collapsible=icon]:hidden" />
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t group-data-[collapsible=icon]:hidden">
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground uppercase tracking-wider">사용량</span>
                        <Badge variant={usagePercentage > 90 ? "destructive" : "secondary"} className="text-[10px]">
                            {plan}
                        </Badge>
                    </div>
                    <Progress value={usagePercentage} className="h-1.5" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{usageCount} / {maxLimit === Infinity ? "∞" : maxLimit} 장</span>
                        <span className="font-bold">{Math.round(usagePercentage)}%</span>
                    </div>
                    {!isPremium && (
                        <button className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
                            <Zap className="w-3 h-3 fill-current" />
                            업그레이드
                        </button>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
