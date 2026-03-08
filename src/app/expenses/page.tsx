import React from 'react';
import { ExpenseClassifier } from '@/components/expenses/ExpenseClassifier';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 지출 자동 분류기 | axAI Secretary',
  description: 'Gemini AI를 활용한 사업용 경비 자동 분류 및 공제 판별 서비스',
};

export default function ExpensesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ExpenseClassifier />
    </div>
  );
}
