'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { createReceiptService } from "@/lib/supabase/receipt-service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function askTaxAssistant(message: string, history: { role: 'user' | 'model', content: string }[]) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    try {
        const supabase = await createClient();
        const service = createReceiptService(supabase);

        // 1. 현재 사용자의 데이터 요약 가져오기 (컨텍스트 제공)
        // 최근 30일 데이터 기준
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const summary = await service.getSummary(thirtyDaysAgo, now.toISOString());
        const receipts = await service.getReceipts();

        // 최근 영수증 데이터 일부 (상위 5건)
        const recentContext = receipts.slice(0, 5).map(r =>
            `- ${r.merchant_name}: ₩${r.total_amount.toLocaleString()} (${r.category}, ${r.is_deductible ? '공제' : '비공제'})`
        ).join('\n');

        const systemPrompt = `
        You are "TaxAI Secretary", a smart tax assistant for small business owners in South Korea.
        Your tone is professional, helpful, and encouraging.
        
        Current User Context (Last 30 days):
        - Total Spending: ₩${summary.total.toLocaleString()}
        - Estimated VAT Refund: ₩${summary.vat.toLocaleString()}
        - Total Receipts: ${summary.count}
        - Deductible Items: ${summary.deductibleCount}
        
        Recent Activity:
        ${recentContext}
        
        Instructions:
        1. Answer tax-related questions based on the provided context if relevant.
        2. If the user asks about specific spending, refer to the data provided.
        3. Provide helpful advice on South Korean tax laws (VAT, Income Tax) but ALWAYS include a disclaimer that you are an AI and they should consult a professional accountant for final decisions.
        4. Keep responses concise and use markdown for better readability.
        5. Answer in Korean.
        `;

        const modelWithInstructions = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt
        });

        const chat = modelWithInstructions.startChat({
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.content }]
            })),
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();

    } catch (error: any) {
        console.error("Chat Action Error:", error);
        throw new Error(error.message || "AI 비서와 연결하는 중 오류가 발생했습니다.");
    }
}
