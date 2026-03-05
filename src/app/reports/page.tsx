'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    FileText,
    TrendingUp,
    Calculator,
    Download,
    Lock,
    ChevronRight,
    AlertCircle,
    Loader2
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { createReceiptService, type ReceiptData } from "@/lib/supabase/receipt-service";
import { createClient } from "@/lib/supabase/browser";
import { generateExcelReport } from "@/lib/actions/report-actions";
import { motion } from "framer-motion";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { getBusinessProfile, type BusinessProfile } from "@/lib/actions/profile-actions";

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

type PeriodType = 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear' | 'all';

const getPeriodLabel = (period: PeriodType): string => {
    switch (period) {
        case 'thisMonth': return '이번 달';
        case 'lastMonth': return '지난 달';
        case 'thisQuarter': return '이번 분기';
        case 'thisYear': return '올해';
        case 'all': return '전체';
    }
};

const getDateRange = (period: PeriodType): { start: Date; end: Date } => {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    
    switch (period) {
        case 'thisMonth':
            start.setDate(1);
            break;
        case 'lastMonth':
            start.setMonth(now.getMonth() - 1, 1);
            end.setDate(0);
            break;
        case 'thisQuarter':
            const quarter = Math.floor(now.getMonth() / 3);
            start.setMonth(quarter * 3, 1);
            end.setMonth(quarter * 3 + 3, 0);
            break;
        case 'thisYear':
            start.setMonth(0, 1);
            end.setMonth(11, 31);
            break;
        case 'all':
            start.setFullYear(2020, 0, 1);
            end.setFullYear(2100, 11, 31);
            break;
    }
    
    return { start, end };
};

function ReportsContent() {
    const { isPremium } = useSubscription();
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason');

    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [period, setPeriod] = useState<PeriodType>('thisMonth');
    const [data, setData] = useState<ReceiptData[]>([]);
    const [summary, setSummary] = useState({ total: 0, vat: 0, count: 0, deductible: 0, nonDeductible: 0 });
    const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
    const [trendData, setTrendData] = useState<{ name: string; total: number }[]>([]);
    const [profile, setProfile] = useState<BusinessProfile | null>(null);

    const supabase = createClient();
    const service = createReceiptService(supabase);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const p = await getBusinessProfile();
                setProfile(p);

                const result = await service.getReceipts();
                setData(result);
                
                const { start, end } = getDateRange(period);
                const filtered = result.filter(r => {
                    const date = new Date(r.receipt_date);
                    return date >= start && date <= end;
                });

                const stats = filtered.reduce((acc, curr) => {
                    acc.total += Number(curr.total_amount);
                    acc.vat += Number(curr.vat_amount);
                    if (curr.is_deductible) acc.deductible += 1;
                    const cat = curr.category || '기타';
                    acc.categories[cat] = (acc.categories[cat] || 0) + Number(curr.total_amount);
                    return acc;
                }, { total: 0, vat: 0, deductible: 0, categories: {} as Record<string, number> });

                setSummary({
                    total: stats.total,
                    vat: stats.vat,
                    count: filtered.length,
                    deductible: stats.deductible,
                    nonDeductible: filtered.length - stats.deductible
                });

                const formattedCategories = Object.keys(stats.categories).map(name => ({
                    name,
                    value: stats.categories[name]
                })).sort((a, b) => b.value - a.value);

                setCategoryData(formattedCategories);

                const trend = await service.getMonthlyTrend();
                setTrendData(trend);
            } catch (error) {
                console.error("Reports Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    const exportToExcel = async () => {
        try {
            setIsExporting(true);
            const base64 = await generateExcelReport();
            const res = await fetch(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `axAI_Receipts_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Excel Export Error:', error);
            alert('엑셀 추출 중 오류가 발생했습니다.');
        } finally {
            setIsExporting(false);
        }
    };

    const exportToPDF = async () => {
        const element = document.getElementById('report-content');
        if (!element) return;

        try {
            setIsExporting(true);
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f8fafc',
                ignoreElements: (element) => element.classList.contains('no-print')
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`axAI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF Export Error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    if (!isPremium) {
        return (
            <div className="h-[80vh] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-3xl border border-slate-200 shadow-xl"
                >
                    <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-amber-600" />
                    </div>
                    {reason === 'premium_only' && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 mb-2">프리미엄 기능</Badge>
                    )}
                    <h2 className="text-3xl font-bold text-slate-900">상세 리포트 잠김</h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        월별 분석, 카테고리별 통계 및 세무사 전송용 엑셀 다운로드는 <span className="font-bold text-indigo-600">Premium</span> 플랜 전용 기능입니다.
                    </p>
                    <div className="space-y-3 pt-4">
                        <Link href="/pricing" className="block w-full">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-100">
                                Premium 시작하기
                            </Button>
                        </Link>
                        <Link href="/pricing" className="block w-full">
                            <Button variant="ghost" className="w-full h-12 text-slate-400">
                                플랜 상세 비교
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 p-4 md:p-8 bg-slate-50 min-h-screen" id="report-content">
            {profile?.businessName && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                                {profile.businessName.substring(0, 1)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">{profile.businessName}</h1>
                                <p className="text-sm text-slate-400 font-medium">공식 지출 증빙 보고서</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-sm text-slate-600 italic">
                            <div className="flex justify-between border-b border-slate-50 py-1">
                                <span className="text-slate-400">사업자 등록 번호</span>
                                <span className="font-bold">{profile.businessNumber || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 py-1">
                                <span className="text-slate-400">대표자</span>
                                <span className="font-bold">{profile.representativeName || '-'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="md:text-right flex flex-col justify-end space-y-1">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">보고서 생성 일시</p>
                        <p className="text-slate-900 font-bold">{new Date().toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-2">{profile.address || '-'}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="no-print space-y-3">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">지출 리포트</h2>
                        <p className="text-slate-500 mt-1">데이터 분석을 통해 세금 절감 포인트를 찾아보세요.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(['thisMonth', 'lastMonth', 'thisQuarter', 'thisYear', 'all'] as PeriodType[]).map((p) => (
                            <Button
                                key={p}
                                variant={period === p ? "default" : "outline"}
                                onClick={() => setPeriod(p)}
                                size="sm"
                                className={`rounded-lg ${period === p ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-slate-200 text-slate-600'}`}
                            >
                                {getPeriodLabel(p)}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2 no-print">
                    <Button
                        variant="outline"
                        onClick={exportToExcel}
                        className="rounded-xl border-slate-200 h-11"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Excel 리포트 추출
                    </Button>
                    <Button
                        onClick={exportToPDF}
                        disabled={isExporting}
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 px-6 shadow-md shadow-indigo-100"
                    >
                        {isExporting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        PDF 리포트 추출
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "총 지출액", value: `₩${summary.total.toLocaleString()}`, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", desc: `${getPeriodLabel(period)} 합계` },
                    { title: "환급액 (예상)", value: `₩${summary.vat.toLocaleString()}`, icon: Calculator, color: "text-emerald-600", bg: "bg-emerald-50", desc: "부가세 매입세액 공제" },
                    { title: "공제 가능 건수", value: `${summary.deductible}건`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", desc: "사업 관련 지출 항목" },
                    { title: "분석 영수증", value: `${summary.count}장`, icon: AlertCircle, color: "text-indigo-600", bg: "bg-indigo-50", desc: "처리 완료" },
                ].map((card, i) => (
                    <Card key={i} className="border-none shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${card.bg} ${card.color} p-2.5 rounded-xl`}>
                                    <card.icon size={22} />
                                </div>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-medium">{getPeriodLabel(period)}</Badge>
                            </div>
                            <div className="text-2xl font-black text-slate-900 mb-1">{card.value}</div>
                            <p className="text-xs text-slate-400 font-medium">{card.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>카테고리별 분포</CardTitle>
                        <CardDescription>어떤 항목에 가장 많이 지출했는지 확인하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`₩${Number(value ?? 0).toLocaleString()}`, '지출액']}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>월별 지출 비교</CardTitle>
                        <CardDescription>최근 6개월간의 지출 추이입니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={trendData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v / 10000}만`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value) => [`₩${Number(value ?? 0).toLocaleString()}`, '지출액']}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-indigo-600 border-none shadow-xl shadow-indigo-100 overflow-hidden relative">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white leading-tight">
                            {getPeriodLabel(period)} 매입세액 <span className="text-emerald-300">₩{summary.vat.toLocaleString()}</span>을<br />
                            공제 받으실 수 있어요!
                        </h3>
                        <p className="text-white/80 text-sm max-w-xl">
                            {summary.nonDeductible > 0 && (
                                <>
                                    분석 결과, 아직 공제 대상으로 분류되지 않은 <span className="font-bold text-emerald-200">{summary.nonDeductible}개</span>의 영수증이 발견되었습니다.
                                    {(summary.total - summary.vat) * 0.1 > 0 && (
                                        <> 추가 공제로 약 <span className="font-bold text-emerald-200">₩{Math.round((summary.total - summary.vat) * 0.1 / summary.count * summary.nonDeductible).toLocaleString()}</span>의 세금을 절약할 수 있습니다.</>
                                    )}
                                </>
                            )}
                            {summary.nonDeductible === 0 && "모든 영수증이 공제 대상으로 분류되어 있습니다."}
                        </p>
                    </div>
                    <Button className="bg-white text-indigo-600 hover:bg-slate-100 rounded-2xl h-14 px-8 font-bold text-lg whitespace-nowrap shadow-xl">
                        절세 전략 확인하기
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        }>
            <ReportsContent />
        </Suspense>
    );
}
