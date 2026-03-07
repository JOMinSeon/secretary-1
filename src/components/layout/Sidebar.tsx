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
    LogOut,
    User,
} from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    { icon: LayoutDashboard, label: "대시보드", href: "/dashboard", premium: false },
    { icon: Receipt, label: "영수증 관리", href: "/receipts", premium: false },
    { icon: BarChart3, label: "리포트", href: "/reports", premium: true },
    { icon: Settings, label: "설정", href: "/settings", premium: false },
];

export function AppSidebar() {
    const { plan, usageCount, maxLimit, usagePercentage, isPremium } = useSubscription();
    const pathname = usePathname();
    const [user, setUser] = React.useState<{ email?: string; user_metadata?: { avatar_url?: string } } | null>(null);
    const supabase = createClient();
    const router = useRouter();

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <Sidebar variant="floating" collapsible="icon" className="border-r-0">
            <SidebarHeader className="p-6 flex flex-row items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Receipt className="text-white w-5 h-5" />
                </div>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="font-black text-lg tracking-tight text-slate-900 leading-none">
                        axAI Secretary
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        AI Receipt Butler
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4">
                <SidebarMenu className="gap-2">
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.label}
                                className={`flex items-center gap-3 py-6 rounded-xl transition-all duration-200 ${
                                    pathname === item.href 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                                isActive={pathname === item.href}
                            >
                                <Link href={item.href}>
                                    <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-white' : ''}`} />
                                    <span className="font-bold group-data-[collapsible=icon]:hidden">{item.label}</span>
                                    {item.premium && !isPremium && (
                                        <Lock className="w-3.5 h-3.5 ml-auto opacity-40 group-data-[collapsible=icon]:hidden" />
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 bg-slate-50/50 rounded-b-xl border-t border-slate-100">
                <div className="space-y-4 group-data-[collapsible=icon]:hidden mb-6 px-2">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Usage Limits</span>
                        <Badge variant={usagePercentage > 90 ? "destructive" : "secondary"} className="text-[9px] px-1.5 h-4 font-bold border-none">
                            {plan}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <Progress value={usagePercentage} className="h-1.5 bg-slate-200" />
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                            <span>{usageCount} / {maxLimit === Infinity ? "∞" : maxLimit}</span>
                            <span>{Math.round(usagePercentage)}%</span>
                        </div>
                    </div>
                    {!isPremium && (
                        <Link href="/pricing" className="block w-full">
                            <button className="w-full mt-2 py-2.5 px-3 bg-slate-900 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-2 shadow-sm hover:bg-slate-800 transition-all active:scale-95">
                                <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
                                UPGRADE PLAN
                            </button>
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="h-14 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all">
                                <Avatar className="h-9 w-9 rounded-lg border border-slate-200">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-slate-100 text-indigo-600 font-bold">
                                        {user?.email?.substring(0, 2).toUpperCase() || <User size={16} />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-1">
                                    <span className="truncate font-bold text-slate-900">{user?.email?.split('@')[0]}</span>
                                    <span className="truncate text-[10px] text-slate-400 font-medium">{user?.email}</span>
                                </div>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
                            side="right"
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                                            {user?.email?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">사용자 프로필</span>
                                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                                    <Settings size={16} />
                                    <span>설정</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-500 focus:text-red-500 cursor-pointer flex items-center gap-2"
                                onClick={handleSignOut}
                            >
                                <LogOut size={16} />
                                <span>로그아웃</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
