"use client";

import React, { useState, useRef } from "react";
import {
    Upload,
    Camera,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { usePlanStore } from "@/store/usePlanStore";
import { analyzeAndSaveReceipt } from "@/lib/actions/receipt-actions";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/browser";
import { createReceiptService } from "@/lib/supabase/receipt-service";

export function ReceiptUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "success" | "error">("idle");
    const [result, setResult] = useState<{ merchant_name?: string; total_amount?: number; receipt_date?: string; category?: string; is_deductible?: boolean } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { usageCount, maxLimit, hasReachedLimit } = useSubscription();
    const incrementUsage = usePlanStore((state) => state.incrementUsage);
    const supabase = createClient();
    const service = createReceiptService(supabase);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (hasReachedLimit) {
                setErrorMsg("이번 달 업로드 한도에 도달했습니다. 플랜을 업그레이드 해주세요.");
                setStatus("error");
                return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setStatus("idle");
                setErrorMsg("");
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setStatus("idle");
        setResult(null);
        setErrorMsg("");
    };

    const handleUpload = async () => {
        if (!preview || !file) return;

        try {
            setStatus("uploading");

            // 0. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setErrorMsg("로그인이 필요합니다.");
                setStatus("error");
                return;
            }

            // 1. Upload to Storage (Storage RLS will handle safety)
            const publicUrl = await service.uploadImage(file, user.id);

            setStatus("analyzing");

            /** 
             * [SECURITY FIX] 
             * 개별 분석/저장 호출을 하나의 원자적(Atomic) 액션으로 병합하여
             * 클라이언트 측 데이터 변조 위험(Integrity Breach) 차단.
             */
            const savedData = await analyzeAndSaveReceipt(preview, file.name, publicUrl);

            // 4. Update UI
            setResult(savedData);
            incrementUsage();
            setStatus("success");
        } catch (error) {
            const message = error instanceof Error ? error.message : '알 수 없는 오류';
            console.error("Atomic process flow error:", error);
            setErrorMsg(message || "처리 중 오류가 발생했습니다.");
            setStatus("error");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors overflow-hidden relative">
                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={status === "analyzing" || status === "uploading"}
                    />

                    <AnimatePresence mode="wait">
                        {!preview ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-4"
                            >
                                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Camera className="w-10 h-10 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">영수증 업로드</h3>
                                    <p className="text-slate-500 mt-2">
                                        이미지를 드래그하거나 클릭하여 업로드하세요. <br />
                                        (현재 한도: {usageCount} / {maxLimit === Infinity ? "무제한" : maxLimit})
                                    </p>
                                </div>
                                <div className="flex gap-4 pt-4 justify-center">
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl"
                                    >
                                        이미지 선택
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full space-y-6"
                            >
                                <div className="relative aspect-[3/4] max-h-[400px] mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />

                                    {status !== "analyzing" && (
                                        <button
                                            onClick={clearFile}
                                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}

                                    {status === "analyzing" && (
                                        <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                                            <div className="relative">
                                                <Loader2 className="w-16 h-16 animate-spin text-indigo-200" />
                                                <motion.div
                                                    className="absolute inset-0 border-4 border-white/20 rounded-full"
                                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            </div>
                                            <p className="mt-4 font-bold text-xl tracking-widest animate-pulse">AI 분석 중...</p>
                                            <p className="text-sm opacity-80">항목을 추출하고 있습니다.</p>
                                        </div>
                                    )}
                                </div>

                                {status === "idle" && (
                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={clearFile}
                                            className="flex-1 h-12 rounded-xl"
                                        >
                                            취소
                                        </Button>
                                        <Button
                                            onClick={handleUpload}
                                            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold"
                                        >
                                            분석 시작하기
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <AnimatePresence>
                {status === "success" && result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-xl space-y-4"
                    >
                        <div className="flex items-center gap-3 text-emerald-600 pb-2 border-b border-emerald-50">
                            <CheckCircle2 size={24} />
                            <h4 className="font-bold text-lg">분석 완료!</h4>
                            <Badge variant="secondary" className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-100">
                                {result.category}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div>
                                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">상호명</label>
                                <div className="text-lg font-bold text-slate-900">{result.merchant_name || "-"}</div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">결제금액</label>
                                <div className="text-lg font-bold text-indigo-600">₩{result.total_amount?.toLocaleString() || "0"}</div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">날짜</label>
                                <div className="text-slate-700">{result.receipt_date || "-"}</div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">공제 가능</label>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${result.is_deductible ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className="text-slate-700">{result.is_deductible ? "공제 대상" : "비공제"}</span>
                                </div>
                            </div>
                        </div>

                        <Button onClick={clearFile} className="w-full mt-4 bg-slate-900 hover:bg-black text-white rounded-xl h-12 font-bold">
                            새 영수증 추가
                        </Button>
                    </motion.div>
                )}

                {status === "error" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3"
                    >
                        <AlertCircle size={20} />
                        <span className="font-medium">{errorMsg}</span>
                        <Button size="sm" variant="ghost" className="ml-auto hover:bg-red-100 text-red-600" onClick={clearFile}>
                            기록 삭제
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
