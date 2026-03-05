"use client"

import { ReceiptUpload } from "@/components/receipt/ReceiptUpload";
import { ReceiptTable } from "@/components/receipt/ReceiptTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReceiptsPage() {
    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">영수증 관리</h2>
                <p className="text-slate-500">스마트 영수증 업로드 및 기간별, 플랜별 내역 관리가 가능합니다.</p>
            </div>

            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="mb-6 p-1 bg-slate-100 rounded-xl">
                    <TabsTrigger value="upload" className="rounded-lg px-8 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        AI 영수증 업로드
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg px-8 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        매입 내역 (DB)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-10">
                    <ReceiptUpload />

                    <div className="bg-white rounded-2xl p-8 border border-slate-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <h3 className="font-bold text-lg">실시간 처리 현황</h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed group">
                            Gemini 2.5 Flash 엔진이 최고의 속도로 영수증의 품목, 부가세, 상호명 정보를 추출합니다.
                            추출된 데이터는 방금 구성한 Supabase Database로 자동 저장될 수 있도록 준비되어 있습니다.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    {/* TanStack Table Rendering */}
                    <ReceiptTable />
                </TabsContent>
            </Tabs>
        </div>
    );
}
