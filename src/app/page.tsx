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
  Plus,
  ArrowRight
} from "lucide-react";
import { usePlanStore } from "@/store/usePlanStore";
import { UsageIndicator } from "@/components/dashboard/UsageIndicator";
import { PurchaseTrendChart } from "@/components/dashboard/PurchaseTrendChart";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { usageCount, plan } = usePlanStore();
  const [stats, setStats] = useState({
    totalExpense: 1240000,
    vatRefund: 124000,
    recentCount: 8,
    lastUpdate: "2시간 전"
  });

  // 실제 앱에서는 여기서 Supabase로부터 이번 달 합계 등을 fetch 해올 것입니다.
  // useEffect(() => { ... fetch data ... }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
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
          <h2 className="text-3xl font-bold text-slate-900 leading-tight">안녕하세요, 사장님! 👋</h2>
          <p className="text-slate-500 mt-2 text-lg">오늘도 스마트하게 영수증을 관리해보세요.</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 text-lg font-semibold shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1">
            <Plus className="w-5 h-5 mr-2" />
            새 영수증 업로드
          </Button>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl" />
        <div className="absolute left-1/2 bottom-0 w-32 h-32 bg-indigo-100 rounded-full opacity-30 blur-2xl" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "이번 달 총 지출", value: `₩${stats.totalExpense.toLocaleString()}`, change: "+12.5%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          { title: "분석된 영수증", value: `${usageCount}장`, change: `${plan} 플랜`, icon: Receipt, color: "text-indigo-500", bg: "bg-indigo-50" },
          { title: "환급 예상액", value: `₩${(stats.totalExpense * 0.1).toLocaleString()}`, change: "VAT 10%", icon: CreditCard, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "최근 업로드", value: stats.lastUpdate, change: "정상 작동", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
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
        {/* Main Charts Area */}
        <PurchaseTrendChart />

        {/* Sidebar Widgets */}
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
              <Button className="w-full bg-white text-indigo-900 hover:bg-slate-100 font-bold py-6 rounded-2xl shadow-lg transition-transform hover:-translate-y-0.5">
                지금 업그레이드
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
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
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Receipt className="text-indigo-400" size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-lg">스타벅스 강남점</div>
                      <div className="text-sm text-slate-400">2024.03.05 | 14:20</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-lg">₩5,400</div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none px-2 mt-1">분석 완료</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

