'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { usePlanStore } from '@/store/usePlanStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function UsageIndicator() {
  const { plan, usageCount, maxLimit } = usePlanStore();
  
  const percentage = maxLimit === Infinity ? 0 : (usageCount / maxLimit) * 100;
  
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-indigo-600';
  };

  const isNearingLimit = percentage >= 80 && maxLimit !== Infinity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-sm overflow-hidden group">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
              구독 사용량
            </CardTitle>
            <Badge variant={plan === 'FREE' ? 'outline' : 'default'} className={plan !== 'FREE' ? 'bg-indigo-600' : ''}>
              {plan} Plan
            </Badge>
          </div>
          <CardDescription className="text-2xl font-bold text-slate-900 mt-1">
            {usageCount} / {maxLimit === Infinity ? '∞' : maxLimit}
            <span className="text-xs font-normal text-slate-400 ml-2">분석 완료</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative pt-1">
              <Progress value={Math.min(percentage, 100)} className="h-2 bg-slate-100" />
              {/* Dynamic color for progress indicator */}
              <style dangerouslySetInnerHTML={{ __html: `
                [role="progressbar"] > div {
                  background-color: ${percentage >= 90 ? '#f43f5e' : percentage >= 70 ? '#f59e0b' : '#4f46e5'} !important;
                  transition: background-color 0.5s ease;
                }
              `}} />
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>이번 달 잔여: {maxLimit === Infinity ? '무제한' : `${maxLimit - usageCount}회`}</span>
              <span>{Math.round(percentage)}% 사용</span>
            </div>

            {isNearingLimit && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2 text-amber-800 animate-pulse">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-tight font-medium">
                  사용량이 거의 다 찼습니다! <br/>
                  제한 없는 분석을 위해 플랜을 업그레이드하세요.
                </p>
              </div>
            )}
            
            {plan === 'FREE' && !isNearingLimit && (
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex items-start gap-2 text-indigo-800">
                <Zap className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-tight font-medium">
                  Pro 플랜으로 업그레이드하고 <br/>
                  무제한 분석과 엑셀 리포트 혜택을 누리세요.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
