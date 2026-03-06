/**
 * Role: Receipt Upload Logic & State Orchestrator
 * Responsibility: Handles file processing, status management, and integration with Supabase/AI services.
 */

import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { usePlanStore } from "@/store/usePlanStore";
import { analyzeAndSaveReceipt } from "@/lib/actions/receipt-actions";
import { createClient } from "@/lib/supabase/browser";
import { createReceiptService } from "@/lib/supabase/receipt-service";

export type UploadStatus = "idle" | "uploading" | "analyzing" | "success" | "error";

export function useReceiptUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [result, setResult] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const { usageCount, maxLimit, hasReachedLimit } = useSubscription();
    const incrementUsage = usePlanStore((state) => state.incrementUsage);

    // Dependency Injection (Context/Service)
    const supabase = createClient();
    const service = createReceiptService(supabase);

    const handleFileChange = (selectedFile: File) => {
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
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setStatus("idle");
        setResult(null);
        setErrorMsg("");
    };

    const processUpload = async () => {
        if (!preview || !file) return;

        try {
            setStatus("uploading");

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("로그인이 필요합니다.");
            }

            // 1. Storage Upload
            const publicUrl = await service.uploadImage(file, user.id);

            setStatus("analyzing");

            // 2. Atomic Analysis & Save
            const savedData = await analyzeAndSaveReceipt(preview, file.name, publicUrl);

            setResult(savedData);
            incrementUsage();
            setStatus("success");
        } catch (error) {
            const message = error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.";
            setErrorMsg(message);
            setStatus("error");
        }
    };

    return {
        preview,
        status,
        result,
        errorMsg,
        usageCount,
        maxLimit,
        handleFileChange,
        clearFile,
        processUpload
    };
}
