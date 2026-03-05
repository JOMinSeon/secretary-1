'use server';

import * as XLSX from 'xlsx';
import { supabase } from '../supabase/client';
import { receiptService } from '../supabase/receipt-service';

/**
 * 리포트용 지출 데이터 요약
 */
export async function getReportSummary(startDate: string, endDate: string) {
    try {
        return await receiptService.getSummary(startDate, endDate);
    } catch (error) {
        console.error('Report Summary Error:', error);
        throw new Error('리포트 요약 데이터를 가져오는데 실패했습니다.');
    }
}

/**
 * Premium 전용: 영수증 내역 엑셀 파일 생성
 * (Base64 형식으로 버퍼를 반환하여 클라이언트에서 다운로드 가능하도록 함)
 */
export async function generateExcelReport() {
    try {
        const receipts = await receiptService.getReceipts();

        // 엑셀에 들어갈 데이터 가공
        const worksheetData = receipts.map((r) => ({
            '상호명': r.merchant_name,
            '결제일시': r.receipt_date,
            '총 결제금액': r.total_amount,
            '부가세액': r.vat_amount,
            '카테고리': r.category,
            '매입세액 공제여부': r.is_deductible ? '대상' : '비공제',
        }));

        // 워크북 생성
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '영수증 내역');

        // 버퍼 생성 (base64)
        const buf = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

        return buf;
    } catch (error) {
        console.error('Excel Generation Error:', error);
        throw new Error('엑셀 리포트 생성 중 오류가 발생했습니다.');
    }
}
