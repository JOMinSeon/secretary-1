'use server';

import { createClient } from '@/lib/supabase/server';
import { createReceiptService } from '../supabase/receipt-service';
import * as XLSX from 'xlsx';
import { getBusinessProfile } from './profile-actions';

/**
 * 리포트용 지출 데이터 요약
 */
export async function getReportSummary(startDate: string, endDate: string) {
    try {
        const supabase = await createClient();
        const service = createReceiptService(supabase);
        return await service.getSummary(startDate, endDate);
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
        const supabase = await createClient();
        const service = createReceiptService(supabase);

        // 1. 세션 확인
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthenticated');

        const profile = await getBusinessProfile();
        const receipts = await service.getReceipts();

        // 2. 엑셀에 들어갈 데이터 가공 (한글 헤더 지원)
        const headerInfo = [
            ['공식 지출 증빙 모음'],
            ['발행일시', new Date().toLocaleString()],
            ['상호명', profile?.businessName || '-'],
            ['사업자번호', profile?.businessNumber || '-'],
            ['대표자', profile?.representativeName || '-'],
            ['주소', profile?.address || '-'],
            [] // 빈 줄
        ];

        const worksheetData = receipts.map((r) => ({
            '상호명': r.merchant_name,
            '결제일시': r.receipt_date,
            '총 결제금액': r.total_amount,
            '부가세액': r.vat_amount,
            '카테고리': r.category,
            '매입세액 공제여부': r.is_deductible ? '대상' : '비공제',
            '사업자번호': r.business_number || '-',
            '영수증 이미지': r.image_url || 'N/A'
        }));


        // 워크북 생성 (헤더 정보 먼저 추가 후 데이터 추가)
        const worksheet = XLSX.utils.aoa_to_sheet(headerInfo);
        XLSX.utils.sheet_add_json(worksheet, worksheetData, { origin: 'A8' });

        // 컬럼 너비 설정 (가독성 향상)
        const wscols = [
            { wch: 25 }, // 상호명
            { wch: 20 }, // 결제일시
            { wch: 15 }, // 총액
            { wch: 15 }, // 부가세
            { wch: 15 }, // 카테고리
            { wch: 15 }, // 공제여부
            { wch: 20 }, // 사업자번호
            { wch: 50 }, // 이미지 URL
        ];
        worksheet['!cols'] = wscols;

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
