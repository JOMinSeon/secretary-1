'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { analyzeReceipt, analyzeAndSaveReceipt } from '@/lib/actions/receipt-actions';
import { createReceiptService } from '@/lib/supabase/receipt-service';
import { createClient } from '@/lib/supabase/browser';
import { usePlanStore } from '@/store/usePlanStore';
import { motion, AnimatePresence } from 'framer-motion';

// NOTE: Since shadcn/ui dialog might not be installed, 
// I'll implement a custom premium modal with framer-motion for maximum control and "wow" factor.

interface ReceiptUploadModalProps {
    onSuccess?: () => void;
}

export function ReceiptUploadModal({ onSuccess }: ReceiptUploadModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { incrementUsage, usageCount, maxLimit } = usePlanStore();

    const handleOpen = () => {
        if (usageCount >= maxLimit) {
            alert('사용량을 초과했습니다. 플랜을 업그레이드해주세요!');
            return;
        }
        setIsOpen(true);
        resetState();
    };

    const resetState = () => {
        setFile(null);
        setPreview(null);
        setIsAnalyzing(false);
        setStatus('idle');
        setError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!preview || !file) return;

        try {
            setIsAnalyzing(true);
            setStatus('analyzing');

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("인증이 필요합니다.");

            // 1. Supabase Storage에 이미지 업로드
            const service = createReceiptService(supabase);
            const imageUrl = await service.uploadImage(file, user.id);

            // 2. Gemini AI 영수증 분석 및 DB 저장 (Atomic Action)
            // analyzeAndSaveReceipt는 서버 액션이므로 클라이언트에서 호출 가능
            await analyzeAndSaveReceipt(preview, file.name, imageUrl);

            // 3. 상태 업데이트
            incrementUsage();
            setStatus('success');

            setTimeout(() => {
                setIsOpen(false);
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (err: any) {
            const message = err.message || '알 수 없는 오류';
            console.error(err);
            setError(message || '영수증 분석 중 오류가 발생했습니다.');
            setStatus('error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 text-lg font-semibold shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1"
            >
                <Plus className="w-5 h-5 mr-2" />
                새 영수증 업로드
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isAnalyzing && setIsOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900">영수증 업로드</h3>
                                    {!isAnalyzing && (
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>

                                {status === 'idle' && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-indigo-100 rounded-[24px] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all bg-slate-50/50 group"
                                    >
                                        <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="text-indigo-500" size={32} />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-slate-900">클릭하여 이미지 업로드</p>
                                            <p className="text-sm text-slate-400 mt-1">JPEG, PNG 형식의 이미지를 선택하세요</p>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                )}

                                {preview && status !== 'success' && status !== 'analyzing' && (
                                    <div className="relative rounded-[24px] overflow-hidden bg-slate-100 aspect-video mb-6">
                                        <img src={preview} alt="Receipt Preview" className="w-full h-full object-contain" />
                                        <button
                                            onClick={() => resetState()}
                                            className="absolute top-4 right-4 p-2 bg-slate-900/50 backdrop-blur-md text-white rounded-full hover:bg-slate-900 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                {status === 'analyzing' && (
                                    <div className="flex flex-col items-center justify-center py-12 gap-6">
                                        <div className="relative">
                                            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                                            <Plus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <h4 className="text-xl font-bold text-slate-900">영수증 분석 중...</h4>
                                            <p className="text-slate-500 mt-2">axAI가 텍스트와 숫자를 정밀하게 추출하고 있습니다.</p>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 15, ease: "linear" }}
                                                className="bg-indigo-600 h-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {status === 'success' && (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center scale-up-center">
                                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-slate-900">분석 완료 및 저장됨!</h4>
                                        <p className="text-slate-500">대시보드와 리포트에서 즉시 확인하실 수 있습니다.</p>
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                            <AlertCircle className="w-8 h-8 text-red-600" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900">오류가 발생했습니다</h4>
                                        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>
                                        <Button onClick={() => setStatus('idle')} variant="outline" className="mt-4">
                                            다시 시도하기
                                        </Button>
                                    </div>
                                )}

                                {status === 'idle' && file && (
                                    <Button
                                        onClick={handleUpload}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-100 transition-all mt-4"
                                    >
                                        영수증 분석 시작하기
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        .scale-up-center {
          animation: scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
        }
        @keyframes scale-up-center {
          0% { transform: scale(0.5); }
          100% { transform: scale(1); }
        }
      `}</style>
        </>
    );
}
