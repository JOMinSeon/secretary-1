import { SupabaseClient } from '@supabase/supabase-js';

export interface ReceiptData {
    id?: string;
    org_id?: string;
    user_id?: string;
    merchant_name: string;
    receipt_date: string;
    total_amount: number;
    vat_amount: number;
    category: string;
    is_deductible: boolean;
    tax_tip?: string;
    status?: 'pending' | 'completed';
    image_url?: string;
    items?: Record<string, unknown>;
    business_number?: string;
}

const mockReceipts: ReceiptData[] = [
    { id: "1", merchant_name: "스타벅스 강남점", receipt_date: "2024-03-05 14:20:00", total_amount: 5400, vat_amount: 491, category: "Food", is_deductible: false },
    { id: "2", merchant_name: "이마트 역삼점", receipt_date: "2024-03-04 18:30:00", total_amount: 125000, vat_amount: 11364, category: "Supplies", is_deductible: true },
    { id: "3", merchant_name: "개인택시(서울)", receipt_date: "2024-03-03 09:15:00", total_amount: 15000, vat_amount: 1364, category: "Transportation", is_deductible: false },
    { id: "4", merchant_name: "오피스디포", receipt_date: "2024-03-02 11:45:00", total_amount: 45000, vat_amount: 4091, category: "Supplies", is_deductible: true },
    { id: "5", merchant_name: "SK주유소", receipt_date: "2024-03-01 16:00:00", total_amount: 60000, vat_amount: 5455, category: "Fuel", is_deductible: true },
    { id: "6", merchant_name: "우체국", receipt_date: "2024-02-28 10:20:00", total_amount: 4000, vat_amount: 364, category: "Supplies", is_deductible: true },
    { id: "7", merchant_name: "김밥천국", receipt_date: "2024-02-28 12:30:00", total_amount: 8000, vat_amount: 727, category: "Food", is_deductible: false },
];

export const createReceiptService = (supabase: SupabaseClient) => ({
    /**
     * 영수증 목록 조회
     */
    async getReceipts() {
        try {
            const { data, error } = await supabase
                .from('receipts')
                .select('*')
                .order('receipt_date', { ascending: false });

            if (error) throw error;
            return data as ReceiptData[];
        } catch (error) {
            console.warn("Supabase fetch failed, falling back to mock data.", error);
            return mockReceipts;
        }
    },

    /**
     * 영수증 데이터 저장
     */
    async saveReceipt(receipt: ReceiptData) {
        // user_id가 없으면 현재 세션에서 가져오기 시도
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            receipt.user_id = user.id;

            // org_id가 없으면 사용자가 속한 첫 번째 조직 가져오기
            if (!receipt.org_id) {
                const { data: memberData } = await supabase
                    .from('organization_members')
                    .select('org_id')
                    .eq('user_id', user.id)
                    .limit(1)
                    .single();

                if (memberData) {
                    receipt.org_id = memberData.org_id;
                }
            }
        }

        const { data, error } = await supabase
            .from('receipts')
            .insert([receipt])
            .select();

        if (error) {
            console.error("DB Save Error:", error);
            throw error;
        }
        return data[0];
    },

    /**
     * 영수증 이미지 업로드
     */
    async uploadImage(file: File, userId: string) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(filePath, file);

        if (uploadError) {
            console.error("Upload Error:", uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    /**
     * 리포트 통계 요약 조회
     */
    async getSummary(startDate: string, endDate: string) {
        try {
            const { data, error } = await supabase
                .from('receipts')
                .select('total_amount, vat_amount, category, is_deductible')
                .gte('receipt_date', startDate)
                .lte('receipt_date', endDate);

            if (error) throw error;

            return data.reduce((acc, curr) => {
                acc.total += Number(curr.total_amount);
                acc.vat += Number(curr.vat_amount);
                if (curr.is_deductible) {
                    acc.deductibleCount += 1;
                }
                return acc;
            }, { total: 0, vat: 0, count: data.length, deductibleCount: 0 });
        } catch (error) {
            console.warn("Summary fetch failed.", error);
            return { total: 0, vat: 0, count: 0, deductibleCount: 0 };
        }
    },

    /**
     * 월별 지출 트렌드 조회 (최근 6개월)
     */
    async getMonthlyTrend() {
        // [복잡도 개선]
        // 전: O(N log N) (DB 정렬) + O(N) (자바스크립트 루프 + Date 객체 생성 x N)
        // 후: O(N) (DB 무정렬 조회 + 자바스크립트 단일 루프 + 문자열 파싱)
        try {
            const now = new Date();
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

            // DB 레벨의 정렬 제거 (메모리 집합 과정에서 순서가 정의됨)
            const { data, error } = await supabase
                .from('receipts')
                .select('total_amount, receipt_date')
                .gte('receipt_date', sixMonthsAgo.toISOString());

            if (error) throw error;

            // 1. 초기 레이블 및 순번 캐싱 (O(1) - 항상 6개)
            const trendOrder: string[] = [];
            const trendMap: Map<string, number> = new Map();

            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const label = `${d.getMonth() + 1}월`;
                trendOrder.push(label);
                trendMap.set(label, 0);
            }

            // 2. 단일 루프 순회 및 문자열 슬라이싱 파싱 (Date 객체 생성 비용 제거 - O(N))
            data?.forEach(r => {
                // ISO 포맷 (YYYY-MM-DD...)에서 월 추출: '2024-03-05' -> '03'
                const monthRaw = r.receipt_date.substring(5, 7);
                const monthLabel = `${parseInt(monthRaw, 10)}월`;

                if (trendMap.has(monthLabel)) {
                    trendMap.set(monthLabel, (trendMap.get(monthLabel) || 0) + Number(r.total_amount));
                }
            });

            // 3. 정적 순서 기반 결과 반환 (O(1))
            return trendOrder.map(name => ({
                name,
                total: trendMap.get(name) || 0
            }));
        } catch (error) {
            console.error("Trend Fetch Error:", error);
            return [];
        }
    },

    /**
     * 영수증 수정
     */
    async updateReceipt(id: string, updates: Partial<ReceiptData>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required");

        const { data, error } = await supabase
            .from('receipts')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id) // IDOR 방지: 소유권 확인
            .select();

        if (error) throw error;
        return data[0];
    },

    /**
     * 영수증 삭제
     */
    async deleteReceipt(id: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required");

        const { error } = await supabase
            .from('receipts')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // IDOR 방지: 소유권 확인

        if (error) throw error;
        return true;
    }
});
