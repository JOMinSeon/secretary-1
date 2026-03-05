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
    const [user, setUser] = React.useState<any>(null);
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

            <SidebarFooter className="p-4 border-t">
                <div className="space-y-4 group-data-[collapsible=icon]:hidden mb-4">
                    <div className="flex items-center justify-between text-xs pt-2">
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
                        <Link href="/pricing" className="block w-full">
                            <button className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
                                <Zap className="w-3 h-3 fill-current" />
                                업그레이드
                            </button>
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="h-12 hover:bg-slate-100 transition-colors">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                                        {user?.email?.substring(0, 2).toUpperCase() || <User size={16} />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-semibold">{user?.email?.split('@')[0]}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
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
                                        <span className="truncate font-semibold">User Profile</span>
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
