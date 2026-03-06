"use client";

import React, { useRef } from "react";
import { Upload, Camera, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReceiptUpload } from "@/hooks/useReceiptUpload";

/**
 * Role: Receipt Upload Orchestrator (UI/UX)
 * Responsibility: Renders the receipt upload interface and coordinates with useReceiptUpload hook.
 */
export function ReceiptUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        preview, status, result, errorMsg, usageCount, maxLimit,
        handleFileChange, clearFile, processUpload
    } = useReceiptUpload();

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) handleFileChange(selectedFile);
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
                        onChange={onFileSelect}
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
                                        </div>
                                    )}
                                </div>

                                {status === "idle" && (
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={clearFile} className="flex-1 h-12 rounded-xl">
                                            취소
                                        </Button>
                                        <Button
                                            onClick={processUpload}
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
                    <AnalysisResultCard result={result} onClear={clearFile} />
                )}

                {status === "error" && (
                    <UploadErrorAlert errorMsg={errorMsg} onClear={clearFile} />
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Role: Analysis Result View (UI)
 * Responsibility: Renders high-fidelity card with extraction results.
 */
function AnalysisResultCard({ result, onClear }: { result: any; onClear: () => void }) {
    return (
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

            <Button onClick={onClear} className="w-full mt-4 bg-slate-900 hover:bg-black text-white rounded-xl h-12 font-bold">
                새 영수증 추가
            </Button>
        </motion.div>
    );
}

/**
 * Role: Error Feedback (UI)
 * Responsibility: Renders user-friendly error messages.
 */
function UploadErrorAlert({ errorMsg, onClear }: { errorMsg: string; onClear: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3"
        >
            <AlertCircle size={20} />
            <span className="font-medium">{errorMsg}</span>
            <Button size="sm" variant="ghost" className="ml-auto hover:bg-red-100 text-red-600" onClick={onClear}>
                기록 삭제
            </Button>
        </motion.div>
    );
}
