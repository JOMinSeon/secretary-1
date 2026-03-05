import { supabase } from './client';

export interface ReceiptData {
    id?: string;
    user_id?: string;
    merchant_name: string;
    receipt_date: string;
    total_amount: number;
    vat_amount: number;
    category: string;
    is_deductible: boolean;
    image_url?: string;
    items?: any;
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

export const receiptService = {
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
            // Return mock data for UI testing if DB is not configured
            return mockReceipts;
        }
    },

    /**
     * 영수증 데이터 저장
     */
    async saveReceipt(receipt: ReceiptData) {
        try {
            const { data, error } = await supabase
                .from('receipts')
                .insert([receipt])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.warn("Supabase insert failed. Using mock response.", error);
            return {
                ...receipt,
                id: Math.random().toString(36).substring(7)
            };
        }
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

            const summary = data.reduce((acc, curr) => {
                acc.total += Number(curr.total_amount);
                acc.vat += Number(curr.vat_amount);
                if (curr.is_deductible) {
                    acc.deductibleCount += 1;
                }
                return acc;
            }, { total: 0, vat: 0, count: data.length, deductibleCount: 0 });

            return summary;
        } catch (error) {
            console.warn("Supabase summary failed, falling back to mock data.", error);
            const summary = mockReceipts.reduce((acc, curr) => {
                acc.total += Number(curr.total_amount);
                acc.vat += Number(curr.vat_amount);
                if (curr.is_deductible) {
                    acc.deductibleCount += 1;
                }
                return acc;
            }, { total: 0, vat: 0, count: mockReceipts.length, deductibleCount: 0 });
            return summary;
        }
    }
};
