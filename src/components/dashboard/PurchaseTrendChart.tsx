'use client';

import React, { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data (실제로는 Supabase 연동 시 서버에서 집계된 데이터를 가져와야 함)
const DATA_BY_PERIOD = {
    '6months': [
        { month: '10월', total: 450000 },
        { month: '11월', total: 680000 },
        { month: '12월', total: 950000 },
        { month: '1월', total: 720000 },
        { month: '2월', total: 1100000 },
        { month: '3월', total: 1240000 },
    ],
    '3months': [
        { month: '1월', total: 720000 },
        { month: '2월', total: 1100000 },
        { month: '3월', total: 1240000 },
    ],
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex flex-col gap-1 items-start">
                <p className="text-xs font-semibold text-slate-500">{label} 지출</p>
                <p className="text-lg font-bold text-indigo-700">
                    ₩{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function PurchaseTrendChart() {
    const [period, setPeriod] = useState<'6months' | '3months'>('6months');
    const data = DATA_BY_PERIOD[period];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
        >
            <Card className="border-none shadow-sm h-full overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>지출 트렌드</CardTitle>
                        <CardDescription>월별 총 매입 내역 분석</CardDescription>
                    </div>
                    <Tabs defaultValue="6months" onValueChange={(v) => setPeriod(v as '6months' | '3months')}>
                        <TabsList className="bg-slate-100/50 p-1 h-9 rounded-lg">
                            <TabsTrigger value="6months" className="text-xs rounded-md">6개월</TabsTrigger>
                            <TabsTrigger value="3months" className="text-xs rounded-md">3개월</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="h-[300px] pb-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={period}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.4 }}
                            className="w-full h-full"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={data}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        tickFormatter={(v) => `₩${v / 1000}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
}
