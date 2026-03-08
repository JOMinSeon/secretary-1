'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Sparkles, Info, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { ReceiptData } from "@/lib/supabase/receipt-service";

interface ExpenseTableProps {
  expenses: ReceiptData[];
  isLoading?: boolean;
}

export function ExpenseTable({ expenses, isLoading }: ExpenseTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
        분석 중인 데이터를 불러오는 중...
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-4">
        <AlertCircle size={40} className="text-slate-200" />
        <p>분석할 지출 내역이 없습니다. 엑셀 파일을 업로드해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[120px] font-bold text-slate-500 py-6 pl-8">일자</TableHead>
              <TableHead className="font-bold text-slate-500">가맹점명</TableHead>
              <TableHead className="text-right font-bold text-slate-500">결제 금액</TableHead>
              <TableHead className="font-bold text-slate-500">AI 카테고리</TableHead>
              <TableHead className="font-bold text-slate-500">공제 여부</TableHead>
              <TableHead className="font-bold text-slate-500 text-center pr-8">AI 절세 팁</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} className="hover:bg-slate-50/50 transition-colors border-slate-100 group">
                <TableCell className="py-5 pl-8 text-slate-500 font-medium">
                  {expense.receipt_date ? format(new Date(expense.receipt_date), 'yyyy.MM.dd') : '-'}
                </TableCell>
                <TableCell className="font-bold text-slate-900">{expense.merchant_name}</TableCell>
                <TableCell className="text-right font-black text-slate-900">
                  ₩{expense.total_amount?.toLocaleString()}
                </TableCell>
                <TableCell>
                  {expense.status === 'completed' ? (
                    <Badge className="bg-blue-50 text-blue-700 border-none font-bold px-3 py-1 rounded-lg">
                      {expense.category}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-200 text-slate-400 font-medium animate-pulse">
                      분석 대기
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {expense.status === 'completed' ? (
                    expense.is_deductible ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                        <CheckCircle2 size={16} />
                        공제 가능
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                        <XCircle size={16} />
                        불공제 대상
                      </div>
                    )
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center pr-8">
                  {expense.tax_tip ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all transform group-hover:scale-110">
                            <Sparkles size={18} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-slate-900 text-white border-none p-4 rounded-2xl max-w-[240px] shadow-xl">
                          <div className="flex gap-2 items-start">
                            <Info size={16} className="text-blue-400 mt-1 shrink-0" />
                            <p className="text-sm font-medium leading-relaxed">{expense.tax_tip}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-slate-200">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
