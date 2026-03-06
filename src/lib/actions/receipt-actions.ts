"use server";

import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { createReceiptService } from "@/lib/supabase/receipt-service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * [SECURITY: ATOMIC ACTION]
 * 이미지 분석과 DB 저장을 하나의 서버 액션으로 통합하여 데이터 변조(Integrity Breach) 방지.
 */
export async function analyzeAndSaveReceipt(base64Image: string, fileName: string, imageUrl: string) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing");

    // 1. 보안: 입력값 유효성 검사 (Payload Validation)
    if (!base64Image || base64Image.length > 7 * 1024 * 1024) {
        throw new Error("이미지 크기가 너무 큽니다 (최대 7MB).");
    }

    if (!imageUrl || !imageUrl.startsWith('http')) {
        throw new Error("유효하지 않은 이미지 URL입니다.");
    }

    // 2. 보안: 서버 측 인증 확인 (Authentication)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("인증이 필요합니다.");

    const receiptService = createReceiptService(supabase);

    const prompt = `
    Analyze the provided receipt image and extract information in structurally valid JSON format.
    If a field cannot be found, return null.
    
    Fields to extract:
    - merchant_name: Name of the business
    - business_number: Business registration number (if present)
    - receipt_date: Date and time (YYYY-MM-DD HH:mm:ss)
    - total_amount: Total payment (Numeric)
    - vat_amount: VAT amount (Numeric)
    - items: List of { name, price, quantity }
    - category: Food, Supplies, Fuel, Rent, Utility, or Other
    - is_deductible: Boolean (true if business expense)
    
    Response must be ONLY JSON.
    `;

    try {
        const mimeType = base64Image.match(/^data:(.*);base64,/)?.[1] || "image/jpeg";
        const imageData = base64Image.includes("base64,") ? base64Image.split(",")[1] : base64Image;

        const imagePart: Part = {
            inlineData: {
                data: imageData,
                mimeType: mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("AI did not return valid JSON:", text);
            throw new Error("AI 분석 결과에서 정보를 추출할 수 없습니다.");
        }

        const aiData = JSON.parse(jsonMatch[0]);

        // [SANITIZATION] 데이터 타입 및 누락값 보정
        const sanitizedData = {
            merchant_name: aiData.merchant_name || '알 수 없는 상점',
            receipt_date: aiData.receipt_date ? new Date(aiData.receipt_date).toISOString() : new Date().toISOString(),
            total_amount: typeof aiData.total_amount === 'string'
                ? Number(aiData.total_amount.replace(/[^0-9.-]+/g, "")) || 0
                : Number(aiData.total_amount) || 0,
            vat_amount: typeof aiData.vat_amount === 'string'
                ? Number(aiData.vat_amount.replace(/[^0-9.-]+/g, "")) || 0
                : Number(aiData.vat_amount) || 0,
            category: aiData.category || 'Other',
            is_deductible: aiData.is_deductible ?? true,
            business_number: aiData.business_number || null,
            items: aiData.items || []
        };

        /** 
         * [INTEGRITY] 
         * 클라이언트를 거치지 않고 서버 내부에서 직접 데이터를 가공하여 저장.
         */
        const savedReceipt = await receiptService.saveReceipt({
            ...sanitizedData,
            user_id: user.id,
            image_url: imageUrl,
        });

        return savedReceipt;
    } catch (error: any) {
        console.error("Atomic Analysis & Save Error:", error);
        throw new Error(error.message || "영수증 분석 및 자동 저장에 실패했습니다.");
    }
}

/** 
 * @deprecated analyzeAndSaveReceipt 사용을 권장합니다.
 */
export async function analyzeReceipt(base64Image: string, fileName: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("인증이 필요합니다.");

    const prompt = `Extract receipt data in JSON format focusing on: merchant_name, receipt_date, total_amount, vat_amount, items[{name, price, quantity}], category, is_deductible. Response must be valid JSON only.`;

    try {
        const mimeType = base64Image.match(/^data:(.*);base64,/)?.[1] || "image/jpeg";
        const imageData = base64Image.includes("base64,") ? base64Image.split(",")[1] : base64Image;

        const imagePart: Part = {
            inlineData: {
                data: imageData,
                mimeType: mimeType,
            },
        };
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Legacy AI Response Error:", text);
            throw new Error("AI 분석 결과에서 JSON을 찾을 수 없습니다.");
        }

        const aiData = JSON.parse(jsonMatch[0]);

        // [SANITIZATION]
        return {
            ...aiData,
            total_amount: typeof aiData.total_amount === 'string'
                ? Number(aiData.total_amount.replace(/[^0-9.-]+/g, "")) || 0
                : Number(aiData.total_amount) || 0,
            vat_amount: typeof aiData.vat_amount === 'string'
                ? Number(aiData.vat_amount.replace(/[^0-9.-]+/g, "")) || 0
                : Number(aiData.vat_amount) || 0,
        };
    } catch (error: any) {
        console.error("Legacy Analysis Error Detail:", error);
        throw new Error(`분석 중 오류 발생: ${error.message || "알 수 없는 이유"}`);
    }
}
