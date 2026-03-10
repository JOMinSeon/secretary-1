"use client";

import React, { useRef, useState } from "react";
import { Upload, Camera, X, Loader2, CheckCircle2, AlertCircle, FileSpreadsheet, Plus, Edit2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMultiReceiptUpload, ReceiptFile } from "@/hooks/useMultiReceiptUpload";

/**
 * Role: Receipt Upload Orchestrator (UI/UX)
 * Responsibility: Renders the multi-receipt upload interface and coordinates with useMultiReceiptUpload hook.
 */
export function ReceiptUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        files, usageCount, maxLimit,
        handleFilesChange, removeFile, clearFiles, processUpload, exportToExcel, updateFileStatus
    } = useMultiReceiptUpload();

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            handleFilesChange(selectedFiles);
        }
        // clear input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const hasFiles = files.length > 0;
    const isProcessing = files.some(f => f.status === "analyzing" || f.status === "uploading");
    const allSuccess = files.length > 0 && files.every(f => f.status === "success");

    return (
        <div className="w-full mx-auto space-y-8">
            <Card className={`border-2 border-dashed transition-colors overflow-hidden relative ${hasFiles ? 'border-slate-300 bg-white' : 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/50'}`}>
                <CardContent className="p-8">
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        onChange={onFileSelect}
                        disabled={isProcessing}
                    />

                    {!hasFiles ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Camera className="w-10 h-10 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">다중 영수증 업로드</h3>
                                <p className="text-slate-500 mt-2">
                                    여러 장의 영수증을 한꺼번에 올려서 한 번에 처리하세요. <br />
                                    (현재 한도: {usageCount} / {maxLimit === Infinity ? "무제한" : maxLimit})
                                </p>
                            </div>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl mt-4"
                            >
                                <Plus className="mr-2" size={20} /> 이미지 여러장 선택
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <h3 className="text-lg font-bold">업로드된 영수증 ({files.length}장)</h3>
                                    <p className="text-sm text-slate-500">사진을 확인하고 분석을 시작하세요.</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                                        추가 업로드
                                    </Button>
                                    <Button variant="ghost" onClick={clearFiles} disabled={isProcessing} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        전체 초기화
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {files.map((file) => (
                                    <ReceiptThumbnail key={file.id} file={file} onRemove={() => removeFile(file.id)} />
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 gap-4">
                                {!allSuccess && !isProcessing && (
                                    <Button onClick={processUpload} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold">
                                        모두 분석 시작하기
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AnimatePresence>
                {files.filter(f => f.status === "success" || f.status === "error").length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                📝 실시간 확인 및 수정 
                                <span className="text-sm font-normal text-slate-500 ml-2">AI가 분석한 결과를 엑셀로 만들기 전에 확인하세요.</span>
                            </h3>

                            {allSuccess && (
                                <Button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6 rounded-lg font-bold text-white flex items-center gap-2">
                                    <FileSpreadsheet size={18} />
                                    엑셀로 추출하기
                                </Button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">상태</th>
                                        <th className="px-4 py-3">영수증 사진</th>
                                        <th className="px-4 py-3">상호명</th>
                                        <th className="px-4 py-3">결제일시</th>
                                        <th className="px-4 py-3">총액</th>
                                        <th className="px-4 py-3">카테고리</th>
                                        <th className="px-4 py-3 rounded-tr-lg">액션</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((f) => (
                                        <ReceiptEditableRow 
                                            key={f.id} 
                                            file={f} 
                                            onUpdate={(updatedResult) => updateFileStatus(f.id, { result: updatedResult })} 
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ReceiptThumbnail({ file, onRemove }: { file: ReceiptFile; onRemove: () => void }) {
    return (
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
            <img src={file.preview} alt="Receipt preview" className="w-full h-full object-cover" />
            
            {(file.status === "idle" || file.status === "error") && (
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                >
                    <X size={16} />
                </button>
            )}

            {(file.status === "analyzing" || file.status === "uploading") && (
                <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-200 mb-2" />
                    <p className="text-xs font-bold">{file.status === "uploading" ? "업로드중.." : "분석중.."}</p>
                </div>
            )}

            {file.status === "success" && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                    <CheckCircle2 size={16} />
                </div>
            )}
        </div>
    );
}

function ReceiptEditableRow({ file, onUpdate }: { file: ReceiptFile, onUpdate: (r: any) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const result = file.result || {};

    const [editForm, setEditForm] = useState({
        merchant_name: result.merchant_name || "",
        receipt_date: result.receipt_date || "",
        total_amount: result.total_amount || 0,
        category: result.category || ""
    });

    const handleSave = () => {
        onUpdate({ 
            ...result, 
            merchant_name: editForm.merchant_name,
            receipt_date: editForm.receipt_date,
            total_amount: Number(editForm.total_amount),
            category: editForm.category
        });
        setIsEditing(false);
    };

    if (file.status === "idle" || file.status === "analyzing" || file.status === "uploading") {
        return (
            <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 opacity-50">
                <td className="px-4 py-4">대기/분석중</td>
                <td className="px-4 py-4"><img src={file.preview} className="w-10 h-10 object-cover rounded" /></td>
                <td colSpan={5} className="px-4 py-4 text-center text-slate-400">결과를 기다리는 중입니다...</td>
            </tr>
        );
    }

    if (file.status === "error") {
        return (
            <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 bg-red-50/50">
                <td className="px-4 py-4"><AlertCircle className="text-red-500 w-5 h-5" /></td>
                <td className="px-4 py-4"><img src={file.preview} className="w-10 h-10 object-cover rounded" /></td>
                <td colSpan={5} className="px-4 py-4 text-red-600 font-medium">{file.errorMsg}</td>
            </tr>
        );
    }

    return (
        <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-4">
                <div className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                    <CheckCircle2 size={16} /> 성공
                </div>
            </td>
            <td className="px-4 py-4">
                <img src={file.preview} alt="preview" className="w-12 h-16 object-cover rounded shadow-sm border" />
            </td>
            
            <td className="px-4 py-4">
                {isEditing ? (
                    <Input value={editForm.merchant_name} onChange={e => setEditForm({...editForm, merchant_name: e.target.value})} className="h-8 text-sm w-32" />
                ) : (
                    <span className="font-medium text-slate-800">{result.merchant_name || "-"}</span>
                )}
            </td>
            <td className="px-4 py-4">
                {isEditing ? (
                    <Input value={editForm.receipt_date} onChange={e => setEditForm({...editForm, receipt_date: e.target.value})} className="h-8 text-sm w-40" />
                ) : (
                    <span className="text-slate-600 truncate max-w-[150px] inline-block">{result.receipt_date ? new Date(result.receipt_date).toLocaleString('ko-KR') : "-"}</span>
                )}
            </td>
            <td className="px-4 py-4">
                {isEditing ? (
                    <Input type="number" value={editForm.total_amount} onChange={e => setEditForm({...editForm, total_amount: Number(e.target.value)})} className="h-8 text-sm w-24" />
                ) : (
                    <span className="font-bold text-indigo-600">₩{result.total_amount?.toLocaleString()}</span>
                )}
            </td>
            <td className="px-4 py-4">
                {isEditing ? (
                    <Input value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="h-8 text-sm w-24" />
                ) : (
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">{result.category || "-"}</Badge>
                )}
            </td>
            <td className="px-4 py-4">
                {isEditing ? (
                    <Button size="sm" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3 rounded">
                        <Save size={14} className="mr-1" /> 저장
                    </Button>
                ) : (
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 px-2 text-slate-500 hover:text-indigo-600">
                        <Edit2 size={14} /> 수동수정
                    </Button>
                )}
            </td>
        </tr>
    );
}

