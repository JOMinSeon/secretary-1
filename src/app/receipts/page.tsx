import { ReceiptUpload } from "@/components/receipt/ReceiptUpload";

export default function ReceiptsPage() {
    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">영수증 업로드</h2>
                <p className="text-slate-500">AI가 영수증 이미지를 분석하여 자동으로 데이터를 추출합니다.</p>
            </div>

            <ReceiptUpload />

            <div className="bg-white rounded-2xl p-8 border border-slate-200">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h3 className="font-bold text-lg">실시간 처리 현황</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Gemini 1.5 Flash 엔진이 최고의 속도로 영수증의 품목, 부가세, 상호명 정보를 추출합니다.
                    추출된 데이터는 자동으로 저장되어 나중에 엑셀 리포트로 다운로드할 수 있습니다.
                </p>
            </div>
        </div>
    );
}
