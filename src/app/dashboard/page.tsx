'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Receipt,
    TrendingUp,
    CreditCard,
    Clock,
    ArrowRight,
    Plus
} from "lucide-react";
import { usePlanStore } from "@/store/usePlanStore";
import { UsageIndicator } from "@/components/dashboard/UsageIndicator";
import { PurchaseTrendChart } from "@/components/dashboard/PurchaseTrendChart";
import { motion } from "framer-motion";
import Link from 'next/link';
import { ReceiptUploadModal } from "@/components/receipt/ReceiptUploadModal";
import { createClient } from "@/lib/supabase/browser";
import { createReceiptService, type ReceiptData } from "@/lib/supabase/receipt-service";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { plan, setUsageCount } = usePlanStore();
    const [stats, setStats] = useState({
        totalExpense: 0,
        vatRefund: 0,
        receiptCount: 0,
        lastUpdate: "방금 전"
    });
    const [recentReceipts, setRecentReceipts] = useState<ReceiptData[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("사장님");

    const router = useRouter();
    const supabase = createClient();
    const service = createReceiptService(supabase);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. 세션 확인
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }
                setUserName(user.email?.split('@')[0] || "사장님");

                // 2. 이번 달 데이터 가져오기 (임시로 전체 가져와서 필터링)
                // 실제 고도화 시에는 RPC나 단일 쿼리로 처리 권장
                const receipts = await service.getReceipts();

                const now = new Date();
                const thisMonth = now.getMonth();
                const thisYear = now.getFullYear();

                const currentMonthReceipts = receipts.filter(r => {
                    const d = new Date(r.receipt_date);
                    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
                });

                const total = currentMonthReceipts.reduce((acc, curr) => acc + Number(curr.total_amount), 0);
                const vat = currentMonthReceipts.reduce((acc, curr) => acc + Number(curr.vat_amount), 0);

                setStats({
                    totalExpense: total,
                    vatRefund: vat,
                    receiptCount: currentMonthReceipts.length,
                    lastUpdate: "실시간 반영됨"
                });

                // 상점 상태 업데이트 (사용량)
                setUsageCount(currentMonthReceipts.length);

                // 최근 3건
                setRecentReceipts(receipts.slice(0, 3));
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [supabase, service, router, setUsageCount]);

    return (
        <div className="space-y-8 pb-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
            >
                <div className="relative z-10">
                    <Badge className="mb-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border-none font-semibold px-3 py-1">
                        {plan} 멤버십 활성화됨
                    </Badge>
                    <h2 className="text-3xl font-bold text-slate-900 leading-tight">안녕하세요, {userName}님! 👋</h2>
                    <p className="text-slate-500 mt-2 text-lg">오늘도 스마트하게 영수증을 관리해보세요.</p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <ReceiptUploadModal onSuccess={() => window.location.reload()} />
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl" />
                <div className="absolute left-1/2 bottom-0 w-32 h-32 bg-indigo-100 rounded-full opacity-30 blur-2xl" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "이번 달 총 지출", value: loading ? "---" : `₩${stats.totalExpense.toLocaleString()}`, change: "+0%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { title: "분석된 영수증", value: loading ? "---" : `${stats.receiptCount}장`, change: `${plan} 플랜`, icon: Receipt, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { title: "환급 예상액", value: loading ? "---" : `₩${stats.vatRefund.toLocaleString()}`, change: "VAT 실집계", icon: CreditCard, color: "text-amber-500", bg: "bg-amber-50" },
                    { title: "최근 업데이트", value: stats.lastUpdate, change: "정상 작동", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                        <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group cursor-default">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                                <div className={`${stat.bg} ${stat.color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={20} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                    <span className={stat.color === 'text-emerald-500' ? 'text-emerald-600 font-medium' : ''}>{stat.change}</span>
                                    {i === 0 ? '지난 달 대비' : ''}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <PurchaseTrendChart />
                <div className="space-y-8">
                    <UsageIndicator />
                    <Card className="bg-indigo-900 text-white border-none relative overflow-hidden flex flex-col justify-between p-2 shadow-xl shadow-indigo-200">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-2xl font-bold">Smart Tax Assistant</CardTitle>
                            <CardDescription className="text-indigo-200 pt-2 text-sm">
                                무제한 영수증 분석과 전문가용 엑셀 리포트 기능을 이용해 세금을 절약해보세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <ul className="space-y-3 mb-6">
                                {['무제한 분석', '엑셀 다운로드', '상세 통계', '우선 순위 AI'].map((feat) => (
                                    <li key={feat} className="flex items-center gap-2 text-sm text-indigo-100">
                                        <div className="w-4 h-4 rounded-full bg-indigo-400/30 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-indigo-100 rounded-full" />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/pricing" className="block w-full">
                                <Button className="w-full bg-white text-indigo-900 hover:bg-slate-100 font-extrabold py-6 rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                                    지금 업그레이드
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <Card className="border-slate-200 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
                        <div>
                            <CardTitle className="text-xl">최근 영수증 내역</CardTitle>
                            <CardDescription>최근 24시간 동안 업로드된 내역입니다.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 rounded-xl">
                            전체 보기
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {loading ? (
                                <div className="p-12 text-center text-slate-400">데이터를 불러오는 중...</div>
                            ) : recentReceipts.length > 0 ? (
                                recentReceipts.map((item) => (
                                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt="Receipt" className="w-full h-full object-cover opacity-80" />
                                                ) : (
                                                    <Receipt className="text-indigo-400" size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-lg">{item.merchant_name}</div>
                                                <div className="text-sm text-slate-400">
                                                    {item.receipt_date ? format(new Date(item.receipt_date), 'yyyy.MM.dd | HH:mm') : '-'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-slate-900 text-lg">₩{item.total_amount?.toLocaleString()}</div>
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none px-2 mt-1">
                                                {item.category}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400">최근 영수증 내역이 없습니다.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
