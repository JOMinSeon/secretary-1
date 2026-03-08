'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, Receipt, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface ExpenseSummaryProps {
  totalAmount: number;
  deductibleAmount: number;
  totalCount: number;
  completedCount: number;
}

export function ExpenseSummary({ totalAmount, deductibleAmount, totalCount, completedCount }: ExpenseSummaryProps) {
  const stats = [
    {
      title: "총 지출 합계",
      value: `₩${totalAmount.toLocaleString()}`,
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "분석 대상 전체 금액"
    },
    {
      title: "공제 가능 예상액",
      value: `₩${deductibleAmount.toLocaleString()}`,
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "세금 혜택 가능 항목"
    },
    {
      title: "처리 건수",
      value: `${totalCount}건`,
      icon: Receipt,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      description: "업로드된 내역 수"
    },
    {
      title: "AI 분석 진행도",
      value: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%`,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: "분석 완료 비율"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <Card className="border border-slate-200/60 shadow-none rounded-[2rem] overflow-hidden bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-2xl`}>
                <stat.icon size={18} strokeWidth={2.5} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
              <p className="text-xs text-slate-400 mt-2 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
