import { NextResponse } from "next/server";
import { Workbook } from 'exceljs';

export async function POST(req: Request) {
  try {
    const data = await req.json(); 
    // data should be { receipts: any[] }

    if (!data.receipts || !Array.isArray(data.receipts)) {
      return NextResponse.json({ error: "No receipts data provided" }, { status: 400 });
    }

    const { receipts } = data;

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('영수증_내역');
    
    // Header setup
    sheet.columns = [
      { header: '날짜', key: 'receipt_date', width: 20 },
      { header: '상호명', key: 'merchant_name', width: 25 },
      { header: '사업자번호', key: 'business_number', width: 18 },
      { header: '공급가액', key: 'price', width: 15 },
      { header: '부가세', key: 'vat_amount', width: 15 },
      { header: '합계', key: 'total_amount', width: 15 },
      { header: '카테고리', key: 'category', width: 15 },
      { header: '공제대상', key: 'is_deductible', width: 12 },
    ];

    // Add multiple rows
    receipts.forEach((receipt: any) => {
      sheet.addRow({
        receipt_date: receipt.receipt_date,
        merchant_name: receipt.merchant_name,
        business_number: receipt.business_number || '-',
        price: receipt.total_amount - (receipt.vat_amount || 0),
        vat_amount: receipt.vat_amount || 0,
        total_amount: receipt.total_amount || 0,
        category: receipt.category,
        is_deductible: receipt.is_deductible ? 'O' : 'X',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    
    return new Response(buffer, {
      headers: { 
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="receipts.xlsx"'
      }
    });
  } catch (error) {
    console.error("Excel Export Error:", error);
    return NextResponse.json({ error: "Failed to create Excel file" }, { status: 500 });
  }
}
