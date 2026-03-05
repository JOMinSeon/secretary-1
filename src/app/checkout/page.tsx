'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Lock,
    CheckCircle2,
    ChevronLeft,
    ShieldCheck,
    Calendar,
    Info,
    Loader2,
    Zap,
    Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePlanStore, PlanType } from '@/store/usePlanStore';
import { createCheckoutSession } from '@/lib/actions/payment-actions';
import { createClient } from '@/lib/supabase/browser';

const planDetails = {
    PREMIUM: {
        price: '$19.00',
        icon: Zap,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        desc: 'Best for growing businesses'
    },
    PRO: {
        price: '$49.00',
        icon: Crown,
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        desc: 'Unlimited power for professionals'
    },
    FREE: {
        price: '$0.00',
        icon: ShieldCheck,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        desc: 'Basic features trial'
    }
};

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedPlan = (searchParams.get('plan') as PlanType) || 'PREMIUM';
    const { setPlan } = usePlanStore();

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const detail = planDetails[selectedPlan];

    const handleStripePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        const supabase = createClient();
        try {
            // 0. 현재 로그인한 사용자 정보 가져오기
            const { data: { user } } = await supabase.auth.getUser();

            // 1. 서버 액션을 통해 Stripe Checkout 세션 생성 (보안: userId 파라미터 제거)
            const { sessionId, url } = await createCheckoutSession(selectedPlan);

            if (url) {
                // Stripe 호스팅 결제 페이지로 리다이렉트
                window.location.href = url;
            } else {
                throw new Error('Stripe checkout URL is missing.');
            }
        } catch (error) {
            console.error('Checkout Error:', error);
            alert('결제 세션 생성 중 오류가 발생했습니다.');
            setIsProcessing(false);
        }
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        return parts.length ? parts.join(' ') : v;
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-8 text-slate-500 hover:text-slate-900 group"
            >
                <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Select Plan
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Left: Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Order Summary</h2>
                        <Card className="border-none shadow-xl shadow-slate-100 overflow-hidden bg-gradient-to-br from-white to-slate-50">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 ${detail.bg} ${detail.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                                        <detail.icon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{selectedPlan} Plan</h3>
                                        <p className="text-sm text-slate-500 font-medium">{detail.desc}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 border-t border-slate-100 pt-6">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Monthly Subscription</span>
                                        <span className="font-bold">{detail.price}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>VAT (Included)</span>
                                        <span className="font-bold">0%</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                        <span className="text-lg font-bold text-slate-900">Total Price</span>
                                        <span className="text-2xl font-black text-indigo-600">{detail.price}</span>
                                    </div>
                                </div>

                                <div className="mt-8 bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-indigo-400 mt-0.5" />
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Secured by Stripe. Your subscription will be active immediately after payment.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right: Stripe Payment UI */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="border-none shadow-2xl shadow-indigo-50 bg-white rounded-[32px] overflow-hidden">
                                    <CardHeader className="bg-indigo-600 text-white p-8">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="text-2xl font-bold">Safe Checkout</CardTitle>
                                                <CardDescription className="text-indigo-100 mt-1 uppercase text-[10px] tracking-widest font-bold">Stripe Secured Gateway</CardDescription>
                                            </div>
                                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                                <Lock size={20} className="text-white" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <form onSubmit={handleStripePayment} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 ml-1">Card details</label>
                                                <div className="relative">
                                                    <Input
                                                        required
                                                        placeholder="4242 4242 4242 4242"
                                                        value={cardNumber}
                                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                        maxLength={19}
                                                        className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-lg font-medium px-12"
                                                    />
                                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-500 ml-1">Expiry</label>
                                                    <div className="relative">
                                                        <Input
                                                            required
                                                            placeholder="MM / YY"
                                                            value={expiry}
                                                            onChange={(e) => setExpiry(e.target.value)}
                                                            className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-12"
                                                        />
                                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-500 ml-1">CVC</label>
                                                    <div className="relative">
                                                        <Input
                                                            required
                                                            placeholder="123"
                                                            maxLength={3}
                                                            value={cvc}
                                                            onChange={(e) => setCvc(e.target.value)}
                                                            className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-12"
                                                        />
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-500 ml-1">Cardholder Name</label>
                                                <Input
                                                    required
                                                    placeholder="John Doe"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-4 uppercase"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isProcessing}
                                                className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] mt-4"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    `Pay ${detail.price} via Stripe`
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                    <CardFooter className="bg-slate-50 p-6 flex justify-center gap-6 border-t border-slate-100">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-5 opacity-40 grayscale" />
                                        <div className="h-4 w-px bg-slate-200" />
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PCI Compliant</span>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center p-12 bg-white rounded-[40px] shadow-2xl text-center min-h-[500px]"
                            >
                                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-12 h-12 text-indigo-600" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 mb-4">Success!</h2>
                                <p className="text-slate-500 text-lg max-w-sm">
                                    Your <span className="text-indigo-600 font-bold">{selectedPlan} Plan</span> is now active. <br />Redirecting you to dashboard...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default function StripeCheckoutPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
