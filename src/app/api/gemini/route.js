// app/api/gemini/route.js

// 1. 필요한 패키지 불러오기 (설치가 안 되어 있다면 npm install @google/generative-ai 실행)
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // 2. 클라이언트(프론트엔드)에서 보낸 질문 데이터 받기
        const body = await request.json();
        const { prompt } = body;

        // 💡 3. 방금 말씀드린 코드가 바로 여기에 들어갑니다!
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 4. AI 모델에 질문을 던지고 답변 기다리기
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 5. 생성된 텍스트를 다시 클라이언트(화면)로 보내주기
        return NextResponse.json({ text: text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "AI 응답을 가져오는 데 실패했습니다." },
            { status: 500 }
        );
    }
}
