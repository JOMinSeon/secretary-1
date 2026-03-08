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

    // [SECURITY] 입력 길이 제한 — 과도한 토큰 소비 및 Prompt Injection 완화
    const MAX_MESSAGE_LENGTH = 2000;
    if (!message || message.trim().length === 0) {
        throw new Error("메시지를 입력해 주세요.");
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
        throw new Error(`메시지가 너무 깁니다 (최대 ${MAX_MESSAGE_LENGTH}자).`);
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

        // Gemini requires the history to:
        // 1. Start with 'user' role
        // 2. Alternate roles (user -> model -> user -> model)
        // 3. End with 'model' role (if we're calling sendMessage with 'user' input)

        const validHistory: { role: string; parts: { text: string }[] }[] = [];
        let nextRole = 'user';

        for (const h of history) {
            // Find the next expected role in the sequence
            if (h.role === nextRole) {
                validHistory.push({
                    role: h.role,
                    parts: [{ text: h.content }]
                });
                // Flip expected role
                nextRole = nextRole === 'user' ? 'model' : 'user';
            }
        }

        // If history ends with 'user', we must remove it because 
        // sendMessage(message) below will add the next 'user' message.
        if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
            validHistory.pop();
        }

        const chat = modelWithInstructions.startChat({
            history: validHistory,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error("Chat Action Error:", error);
        throw new Error(errMessage || "AI 비서와 연결하는 중 오류가 발생했습니다.");
    }
}
