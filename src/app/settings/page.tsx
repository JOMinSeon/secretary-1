'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Settings,
    CreditCard,
    Bell,
    Shield,
    ChevronRight,
    Zap,
    RefreshCw,
    LogOut
} from "lucide-react";
import { usePlanStore } from "@/store/usePlanStore";
import { UsageIndicator } from "@/components/dashboard/UsageIndicator";
import { motion } from "framer-motion";
import Link from 'next/link';

export default function SettingsPage() {
    const { plan, resetUsage, usageCount, maxLimit } = usePlanStore();

    const handleResetUsage = () => {
        if (confirm('데모를 위해 이달의 사용량을 초기화하시겠습니까?')) {
            resetUsage();
            alert('사용량이 초기화되었습니다.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">설정</h2>
                    <p className="text-slate-500 mt-1">계정 관리 및 서비스 환경설정</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Sidebar Links */}
                <div className="space-y-2">
                    {[
                        { name: '프로필 정보', icon: User, active: true },
                        { name: '구독 관리', icon: CreditCard },
                        { name: '알림 설정', icon: Bell },
                        { name: '보안 및 개인정보', icon: Shield },
                    ].map((item) => (
                        <button
                            key={item.name}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${item.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                <span className="font-bold">{item.name}</span>
                            </div>
                            <ChevronRight size={16} className={item.active ? 'text-white' : 'text-slate-300'} />
                        </button>
                    ))}

                    <button className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-colors mt-8">
                        <LogOut size={20} />
                        <span className="font-bold">로그아웃</span>
                    </button>
                </div>

                {/* Main Settings Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Profile Card */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 font-black text-2xl border-4 border-white shadow-sm">
                                    JD
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">홍길동 사장님</CardTitle>
                                    <CardDescription>CEO at axAI Tech</CardDescription>
                                    <div className="flex gap-2 mt-2">
                                        <Badge className="bg-indigo-600 border-none">{plan} 플랜</Badge>
                                        <Badge variant="outline" className="border-slate-200 text-slate-500">계정 활성</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">이메일</label>
                                    <p className="font-medium text-slate-900">ceo@axai.example.com</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">전화번호</label>
                                    <p className="font-medium text-slate-900">010-1234-5678</p>
                                </div>
                            </div>
                            <Button variant="outline" className="rounded-xl border-slate-200">개인정보 수정</Button>
                        </CardContent>
                    </Card>

                    {/* Subscription Status Card */}
                    <Card className="border-none shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="text-amber-500 fill-amber-500" size={20} />
                                멤버십 상태
                            </CardTitle>
                            <CardDescription>현재 플랜 혜택 및 사용량 현황입니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <UsageIndicator />

                            <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                                <h4 className="font-bold text-slate-900">진행 중인 혜택</h4>
                                <ul className="space-y-2">
                                    {[
                                        'AI 영수증 자동 분석',
                                        '실시간 지출 통계 리포트',
                                        plan !== 'FREE' ? '엑셀/PDF 무제한 내보내기' : 'Export 기능 제한 (업그레이드 필요)',
                                        plan === 'PRO' ? '1:1 세무사 상담 연결' : '전문가 상담 (PRO 전용)'
                                    ].map((benefit, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 pt-0">
                            <Link href="/pricing" className="w-full">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl font-bold shadow-lg shadow-indigo-100">
                                    플랜 변경하기
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                onClick={handleResetUsage}
                                className="w-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 h-12 rounded-xl text-xs gap-2"
                            >
                                <RefreshCw size={14} />
                                시뮬레이션: 이번 달 사용량 초기화
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
