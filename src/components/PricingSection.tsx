'use client';

import React from 'react';
import { Check, Zap, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlanStore, PlanType } from '@/store/usePlanStore';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const plans = [
    {
        name: 'FREE' as PlanType,
        price: '₩0',
        description: '개인 사업자 초기 단계',
        features: ['월 10회 영수증 분석', '기본 대시보드', '디바이스 1대 연결'],
        icon: Shield,
        color: 'bg-slate-500',
        buttonVariant: 'outline' as const,
    },
    {
        name: 'PREMIUM' as PlanType,
        price: '₩19,000',
        description: '성장하는 비즈니스를 위해',
        features: ['월 100회 영수증 분석', '상세 지출 리포트', '엑셀 데이터 내보내기', '우선 순위 AI 지원'],
        icon: Zap,
        color: 'bg-indigo-600',
        buttonVariant: 'default' as const,
        popular: true,
    },
    {
        name: 'PRO' as PlanType,
        price: '₩49,000',
        description: '전문적인 세무 관리가 필요한 기업',
        features: ['무제한 영수증 분석', '세무사 전송 전용 리포트', '모든 프리미엄 기능', '1:1 전담 서포트'],
        icon: Crown,
        color: 'bg-violet-600',
        buttonVariant: 'default' as const,
    },
];

interface PricingSectionProps {
    title?: React.ReactNode;
    subtitle?: string;
}

export function PricingSection({ 
    title = <>비즈니스에 딱 맞는 <span className="text-indigo-600">성장 플랜</span>을 선택하세요</>,
    subtitle = "axAI Secretary와 함께 영수증 관리 시간을 90% 단축하고 환급액을 극대화하세요.",
}: PricingSectionProps) {
    const { plan: currentPlan, setPlan } = usePlanStore();
    const router = useRouter();

    const handleSelectPlan = (planName: PlanType) => {
        if (planName === 'FREE') {
            setPlan(planName);
            router.push('/');
        } else {
            router.push(`/checkout?plan=${planName}`);
        }
    };

    return (
        <section className="py-24 px-6">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                        {title}
                    </h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Card className={`relative h-full border-2 flex flex-col transition-all duration-300 ${plan.popular ? 'border-indigo-600 shadow-2xl scale-105 z-10' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
                                {plan.popular && (
                                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg z-20">
                                        POPULAR
                                    </div>
                                )}
                                <CardHeader>
                                    <div className={`${plan.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg text-white`}>
                                        <plan.icon size={24} />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium">{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="mb-6">
                                        <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                        <span className="text-slate-400 font-medium ml-1">/월</span>
                                    </div>
                                    <ul className="space-y-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                                <div className="mt-0.5 rounded-full bg-emerald-100 p-0.5 shrink-0">
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className={`w-full h-14 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] ${plan.name === currentPlan ? 'bg-slate-100 text-slate-400 hover:bg-slate-100 cursor-default' : plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100' : 'bg-slate-900 hover:bg-slate-800'}`}
                                        variant={plan.buttonVariant}
                                        onClick={() => plan.name !== currentPlan && handleSelectPlan(plan.name)}
                                    >
                                        {plan.name === currentPlan ? '현재 사용 중' : '플랜 선택하기'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
