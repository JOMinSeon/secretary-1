import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { usePlanStore } from "@/store/usePlanStore";
import { analyzeAndSaveReceipt } from "@/lib/actions/receipt-actions";
import { createClient } from "@/lib/supabase/browser";
import { createReceiptService } from "@/lib/supabase/receipt-service";

export type FileUploadStatus = "idle" | "uploading" | "analyzing" | "success" | "error";

export interface ReceiptFile {
    id: string;
    file: File;
    preview: string;
    status: FileUploadStatus;
    result: any;
    errorMsg: string;
}

export function useMultiReceiptUpload() {
    const [files, setFiles] = useState<ReceiptFile[]>([]);
    const { usageCount, maxLimit, hasReachedLimit } = useSubscription();
    const incrementUsage = usePlanStore((state) => state.incrementUsage);

    const supabase = createClient();
    const service = createReceiptService(supabase);

    const handleFilesChange = (selectedFiles: FileList | File[]) => {
        if (hasReachedLimit) {
            alert("이번 달 업로드 한도에 도달했습니다. 플랜을 업그레이드 해주세요.");
            return;
        }

        const newFiles: ReceiptFile[] = Array.from(selectedFiles).map((file) => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file), // Generate preview instantly
            status: "idle",
            result: null,
            errorMsg: ""
        }));

        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (id: string) => {
        setFiles(prev => {
            const fileToRemove = prev.find(f => f.id === id);
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter(f => f.id !== id);
        });
    };

    const clearFiles = () => {
        files.forEach(f => {
            if (f.preview) URL.revokeObjectURL(f.preview);
        });
        setFiles([]);
    };

    const processUpload = async () => {
        const idleFiles = files.filter(f => f.status === "idle" || f.status === "error");
        if (idleFiles.length === 0) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("로그인이 필요합니다.");

            // Process one by one or in Promise.all[]? Let's do one by one to avoid rate limits or memory bursts.
            for (const item of idleFiles) {
                // Update specific file status to uploading
                updateFileStatus(item.id, { status: "uploading", errorMsg: "" });

                try {
                    const publicUrl = await service.uploadImage(item.file, user.id);
                    updateFileStatus(item.id, { status: "analyzing" });

                    // Convert image preview to base64 for Gemini
                    const base64Image = await fetch(item.preview).then(r => r.blob()).then(blob => {
                        return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                        });
                    });

                    const savedData = await analyzeAndSaveReceipt(base64Image, item.file.name, publicUrl);
                    
                    updateFileStatus(item.id, { status: "success", result: savedData });
                    incrementUsage();
                } catch (err: any) {
                    updateFileStatus(item.id, { status: "error", errorMsg: err.message || "분석 실패" });
                }
            }
        } catch (error: any) {
            alert(error.message || "처리 중 오류가 발생했습니다.");
        }
    };

    const updateFileStatus = (id: string, updates: Partial<ReceiptFile>) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const exportToExcel = async () => {
        const successfulReceipts = files.filter(f => f.status === "success" && f.result).map(f => f.result);
        
        if (successfulReceipts.length === 0) {
            alert("엑셀로 다운로드할 성공한 영수증이 없습니다.");
            return;
        }

        try {
            const res = await fetch("/api/export-excel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receipts: successfulReceipts })
            });

            if (!res.ok) throw new Error("엑셀 생성 실패");
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `receipts_${new Date().getTime()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            alert("영수증 엑셀 파일이 다운로드 되었습니다.");
        } catch (error: any) {
            alert(error.message);
        }
    };

    return {
        files,
        usageCount,
        maxLimit,
        handleFilesChange,
        removeFile,
        clearFiles,
        processUpload,
        exportToExcel,
        // Expose a way to edit result manually before export
        updateFileStatus
    };
}
