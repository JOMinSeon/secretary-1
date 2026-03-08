import * as XLSX from 'xlsx';

export interface RawExpense {
    merchant_name: string;
    receipt_date: string;
    total_amount: number;
    vat_amount?: number;
    category?: string;
}

/**
 * 엑셀 또는 CSV 파일을 파싱하여 JSON 데이터로 변환
 */
export async function parseExcelFile(file: File): Promise<RawExpense[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // 데이터를 JSON 배열로 변환
                const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

                // 사장님들이 업로드하는 다양한 엑셀 형식을 대응하기 위한 매핑 로직 (MVP)
                // 가맹점명(merchant), 일자(date), 금액(amount) 등을 유연하게 매핑
                const mappedData: RawExpense[] = rawData.map((row) => {
                    const findKey = (candidates: string[]) => 
                        Object.keys(row).find(k => candidates.some(c => k.includes(c)));

                    const merchantKey = findKey(['가맹점', '상호', '업체', 'Merchant', 'Vendor']) || 'merchant_name';
                    const dateKey = findKey(['일자', '날짜', 'Date', 'Time']) || 'receipt_date';
                    const amountKey = findKey(['금액', '합계', 'Total', 'Amount']) || 'total_amount';
                    const vatKey = findKey(['부가세', '세액', 'VAT', 'Tax']);

                    // 날짜 정규화 (엑셀 날짜 형식 대응)
                    let dateVal = row[dateKey];
                    if (typeof dateVal === 'number') {
                        // Excel serial date to JS Date
                        const dateObj = XLSX.utils.format_cell({ v: dateVal, t: 'd' });
                        dateVal = new Date(dateObj).toISOString();
                    }

                    return {
                        merchant_name: String(row[merchantKey] || '알 수 없는 상점'),
                        receipt_date: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString(),
                        total_amount: Number(String(row[amountKey] || 0).replace(/[^0-9.-]+/g, "")),
                        vat_amount: vatKey ? Number(String(row[vatKey] || 0).replace(/[^0-9.-]+/g, "")) : undefined,
                        category: 'Pending'
                    };
                });

                resolve(mappedData);
            } catch (err) {
                console.error("Excel Parsing Error:", err);
                reject(new Error("엑셀 파일을 읽는 중 오류가 발생했습니다."));
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}
