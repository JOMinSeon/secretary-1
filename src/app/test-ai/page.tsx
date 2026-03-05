"use client";

import { useState } from "react";
import { analyzeReceipt } from "@/lib/actions/receipt-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function TestAIPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [result, setResult] = useState<{ success: boolean; result?: string; model?: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runTest = async () => {
        setStatus("loading");
        setError(null);
        try {
            // Sample Base64 (A small 1x1 transparent dot or a simple placeholder)
            // In a real test, the user would upload. For this "Auto Test", we'll just use a small valid-ish data
            // or ask the user to upload on the main page.
            // Actually, let's just make this page a "Self-Test" info page.

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: "Say 'Hello, I am Gemini' if you are working." })
            });
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setResult(data);
            setStatus("success");
        } catch (e) {
            const message = e instanceof Error ? e.message : '알 수 없는 오류';
            setError(message);
            setError(e instanceof Error ? e.message : '알 수 없는 오류');
            setStatus("error");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>AI 연동 테스트</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-slate-500">
                        현재 설정된 <code>GEMINI_API_KEY</code>를 사용하여 AI 분석 기능이 정상적으로 동작하는지 확인합니다.
                    </p>

                    <div className="flex gap-4">
                        <Button onClick={runTest} disabled={status === "loading"}>
                            {status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            연동 테스트 시작 (Mock Data)
                        </Button>
                    </div>

                    {status === "success" && (
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-emerald-700 font-bold">
                                <CheckCircle2 size={20} />
                                연동 성공!
                            </div>
                            <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-60">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="bg-red-50 border border-red-100 p-6 rounded-xl flex items-center gap-3 text-red-600">
                            <AlertCircle size={20} />
                            <div>
                                <div className="font-bold">연동 실패</div>
                                <div className="text-sm">{error}</div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-indigo-50 border-indigo-100">
                <CardContent className="p-6">
                    <h4 className="font-bold text-indigo-900 mb-2">테스트 방법:</h4>
                    <ol className="list-decimal list-inside text-sm text-indigo-800 space-y-1">
                        <li>좌측 메뉴의 <strong>영수증 관리</strong>로 이동합니다.</li>
                        <li>실제 영수증 사진(또는 제공된 샘플 이미지)을 업로드합니다.</li>
                        <li><strong>분석 시작하기</strong>를 클릭하여 AI 결과를 확인합니다.</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
}
