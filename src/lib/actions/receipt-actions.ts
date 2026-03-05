"use server";

import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
// Minimal test prompt

export async function analyzeReceipt(base64Image: string, fileName: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    const prompt = `
    Analyze the provided receipt image and extract the following information in structurally valid JSON format.
    If a field cannot be found, return null.
    
    Extract:
    - merchant_name: Name of the business
    - business_number: Business registration number if present
    - receipt_date: Date and time of purchase (YYYY-MM-DD HH:mm:ss)
    - total_amount: Total payment amount (Numeric)
    - vat_amount: VAT amount if specified (Numeric)
    - items: List of items bought, each with { name, price, quantity }
    - category: Categorize the expense into: Food, Supplies, Fuel, Rent, Utility, or Other.
    - is_deductible: Boolean, true if this is likely a deductible business expense.
    
    Response must be ONLY JSON.
  `;

    try {
        const imagePart: Part = {
            inlineData: {
                data: base64Image.split(",")[1] || base64Image,
                mimeType: "image/jpeg", // We'll handle different types in the client if needed
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean JSON (sometimes Gemini wraps JSON in markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to extract JSON from AI response");
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw new Error("영수증 분석 중 오류가 발생했습니다.");
    }
}
