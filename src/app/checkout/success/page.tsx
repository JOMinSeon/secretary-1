'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlanStore, PlanType } from '@/store/usePlanStore';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const plan = searchParams.get('plan') as PlanType;
    const { setPlan } = usePlanStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId && plan) {
            // 실제 서비스에서는 여기서 서버에 세션 유효성 검증을 요청해야 합니다.
            // 현재는 성공 페이지 도달 시 클라이언트 상태를 즉시 업데이트합니다.
            setPlan(plan);
            const timer = setTimeout(() => setLoading(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [sessionId, plan, setPlan]);

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium">결제 정보를 확인하고 있습니다...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-20 px-4 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-10 rounded-[40px] shadow-2xl shadow-indigo-100 border border-indigo-50"
            >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">업그레이드 완료!</h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    성공적으로 <span className="text-indigo-600 font-bold">{plan}</span> 멤버십이 활성화되었습니다. <br />
                    이제 모든 프리미엄 기능을 자유롭게 이용하세요.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={() => router.push('/')}
                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-indigo-100"
                    >
                        대시보드로 이동
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/reports')}
                        className="w-full h-12 text-slate-400 font-medium"
                    >
                        리포트 먼저 확인하기
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
