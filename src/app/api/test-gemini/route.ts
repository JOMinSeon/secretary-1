import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({
            error: "GEMINI_API_KEY가 설정되지 않았습니다.",
        }, { status: 500 });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent("Say 'OK' if you can read this.");
        const response = await result.response;

        return NextResponse.json({
            success: true,
            result: response.text(),
            model: "gemini-2.0-flash"
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류';
        return NextResponse.json({
            error: message,
            suggestion: "Check your Gemini API key in Google AI Studio"
        }, { status: 500 });
    }
}
