'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ExpenseChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#2563EB', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#94A3B8'];

export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartConfig = {
    amount: {
      label: "금액",
      color: "var(--color-blue-600)",
    }
  };

  return (
    <Card className="border border-slate-200/60 shadow-none rounded-[2rem] overflow-hidden bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">카테고리별 지출 분석</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={<ChartTooltipContent />} 
                  cursor={false}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 italic">
            데이터가 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
