import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
    console.log("Available Env Keys:", Object.keys(process.env).filter(k => k.includes("GEMINI")));
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing in process.env");
        return NextResponse.json({
            error: "GEMINI_API_KEY가 설정되지 않았습니다.",
            availableKeys: Object.keys(process.env).filter(k => k.includes("GEMINI"))
        }, { status: 500 });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Minimal test prompt
        const prompt = "Say 'OK' if you can read this.";
        const result = await model.generateContent(prompt);
        const response = await result.response;

        return NextResponse.json({
            success: true,
            result: response.text(),
            model: "gemini-1.5-flash"
        });
    } catch (error: any) {


        return NextResponse.json({
            error: error.message,
            suggestion: "Try checking model availability in Google AI Studio",
            detail: error.stack
        }, { status: 500 });
    }
}
