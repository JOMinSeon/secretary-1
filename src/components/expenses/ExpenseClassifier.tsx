'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { parseExcelFile, RawExpense } from "@/lib/excel-parser";
import { motion, AnimatePresence } from "framer-motion";
import { ExpenseTable } from "./ExpenseTable";
import { ExpenseSummary } from "./ExpenseSummary";
import { ExpenseChart } from "./ExpenseChart";
import { bulkClassifyAndSaveExpenses } from "@/lib/actions/receipt-actions";
import { ReceiptData } from "@/lib/supabase/receipt-service";

export function ExpenseClassifier() {
  const [expenses, setExpenses] = useState<ReceiptData[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const rawData = await parseExcelFile(file);
      
      const mapped: ReceiptData[] = rawData.map((d, i) => ({
        id: `temp-${i}-${Date.now()}`,
        merchant_name: d.merchant_name,
        receipt_date: d.receipt_date,
        total_amount: d.total_amount,
        vat_amount: d.vat_amount || 0,
        category: '분류 전',
        is_deductible: false,
        status: 'pending'
      }));

      setExpenses(mapped);
    } catch (err: any) {
      setError(err.message || "파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStartClassification = async () => {
    if (expenses.length === 0) return;

    setIsClassifying(true);
    setError(null);
    try {
      const payload = expenses.map(e => ({
        merchant_name: e.merchant_name,
        total_amount: e.total_amount,
        receipt_date: e.receipt_date,
        vat_amount: e.vat_amount
      }));

      const results = await bulkClassifyAndSaveExpenses(payload);
      setExpenses(results);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "분류 중 오류가 발생했습니다.");
    } finally {
      setIsClassifying(false);
    }
  };

  const clearData = () => {
    setExpenses([]);
    setError(null);
  };

  // 통계 계산
  const totalAmount = expenses.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const deductibleAmount = expenses.reduce((acc, curr) => 
    acc + (curr.is_deductible ? (curr.total_amount || 0) : 0), 0);
  const completedCount = expenses.filter(e => e.status === 'completed').length;

  // 차트 데이터 변환
  const chartData = Object.entries(
    expenses.reduce((acc, curr) => {
      if (curr.status === 'completed') {
        acc[curr.category] = (acc[curr.category] || 0) + (curr.total_amount || 0);
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 space-y-3">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            AI 지출 자동 분류기
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-lg">
            카드 내역 엑셀 파일을 업로드하면 AI가 사업용 경비 여부와 카테고리를 자동 분류해 드립니다.
          </p>
        </div>
        
        <div className="flex gap-3 z-10">
          {expenses.length > 0 ? (
            <>
              <Button 
                onClick={handleStartClassification} 
                disabled={isClassifying}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-16 px-10 text-xl font-black shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1"
              >
                {isClassifying ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-6 w-6" />
                    AI 자동 분류 시작
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearData}
                disabled={isClassifying}
                className="rounded-2xl h-16 w-16 p-0 border-slate-200 hover:bg-slate-50"
              >
                <X size={24} className="text-slate-400" />
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-16 px-10 text-xl font-black shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1"
            >
              <Upload className="mr-2 h-6 w-6" />
              엑셀 업로드하기
            </Button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".xlsx, .xls, .csv" 
          />
        </div>

        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-50 rounded-full -mr-40 -mt-40 opacity-40 blur-[100px]" />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-600 overflow-hidden"
          >
            <AlertCircle size={24} />
            <p className="font-bold">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <ExpenseSummary 
        totalAmount={totalAmount}
        deductibleAmount={deductibleAmount}
        totalCount={expenses.length}
        completedCount={completedCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ExpenseTable expenses={expenses} isLoading={isUploading} />
        </div>
        <div className="space-y-6">
          <ExpenseChart data={chartData} />
          
          <Card className="bg-slate-900 text-white border-none rounded-[2rem] p-8 shadow-xl shadow-slate-200 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-2xl" />
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Sparkles className="text-blue-400" size={24} />
              AI 활용 팁
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 font-bold text-blue-400">1</div>
                <div>
                  <p className="font-bold mb-1">정확한 업로드</p>
                  <p className="text-sm text-slate-400 leading-relaxed">카드사에서 내려받은 엑셀 파일을 가공 없이 그대로 올려주세요.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 font-bold text-blue-400">2</div>
                <div>
                  <p className="font-bold mb-1">공제 여부 확인</p>
                  <p className="text-sm text-slate-400 leading-relaxed">AI가 판별한 공제 여부는 제안 사항입니다. 세무사 검토 시 참고용으로 활용하세요.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 font-bold text-blue-400">3</div>
                <div>
                  <p className="font-bold mb-1">절세 팁 활용</p>
                  <p className="text-sm text-slate-400 leading-relaxed">각 항목별 AI가 제공하는 팁을 확인하여 누락된 공제 혜택을 챙기세요.</p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
