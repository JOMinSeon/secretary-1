1. 전체 기술 프로세스 (Architecture)
이미지 업로드: 유저가 영수증 사진을 업로드 (Next.js 클라이언트).

OCR 추출 (텍스트화): Google Cloud Vision API, AWS Textract, 혹은 Upstage(국내 영수증 특화)를 사용하여 사진 속 글자를 읽어옵니다.

LLM 데이터 구조화: 추출된 파편화된 텍스트를 Gemini API나 GPT-4o에게 던져서 날짜, 상호명, 합계금액, 부가세, 카테고리로 분류된 JSON 데이터를 얻습니다.

엑셀 데이터 누적: 정제된 데이터를 DB에 저장하거나 즉시 exceljs를 통해 파일로 만듭니다.

2. 핵심 구현 단계: AI에게 데이터 구조화 맡기기
OCR만으로는 "어디가 상호명이고 어디가 날짜인지" 구분하기 어렵습니다. 이때 LLM을 활용하면 매우 정확하게 데이터를 뽑아낼 수 있습니다.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Workbook } from 'exceljs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { ocrText } = await req.json(); // OCR로 읽어온 가공되지 않은 텍스트

  // 1. AI에게 JSON 형태로 정제 요청
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `다음 영수증 텍스트에서 날짜(YYYY-MM-DD), 상호명, 공급가액, 부가세, 합계금액을 추출해서 JSON 형식으로 응답해줘. 텍스트: ${ocrText}`;
  
  const result = await model.generateContent(prompt);
  const receiptData = JSON.parse(result.response.text());

  // 2. 엑셀 파일 생성 (exceljs 활용)
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('영수증_내역');
  
  sheet.columns = [
    { header: '날짜', key: 'date' },
    { header: '상호명', key: 'store' },
    { header: '공급가액', key: 'price' },
    { header: '부가세', key: 'tax' },
    { header: '합계', key: 'total' }
  ];

  sheet.addRow(receiptData);

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  });
}
3. 사용자 경험(UX) 극대화를 위한 디테일
실시간 확인 모달: AI가 분석한 데이터가 100% 정확하지 않을 수 있습니다. 엑셀로 만들기 전, 유저에게 **"AI가 이렇게 분석했는데 맞나요?"**라고 확인 및 수정할 수 있는 UI를 보여주는 것이 신뢰도를 높이는 핵심입니다.

다중 업로드: 영수증 한 장씩 올리는 건 귀찮습니다. 여러 장을 한꺼번에 드래그해서 올리면 엑셀 시트 한 장에 행(Row)으로 쭉 쌓이게 구현하세요.

카테고리 자동 추천: "AI가 분석해보니 이건 '복리후생비(식대)'인 것 같아요"라고 추천해 주면 유저가 세무 지식 없이도 장부를 만들 수 있습니다.

4. 마케팅 연계 전략
이 기능을 홍보할 때는 **"타이핑 제로(Zero)"**를 강조하세요.

"영수증, 이제 찍기만 하세요. TaxAI가 1초 만에 엑셀로 받아 적습니다."

3개월 0원 이벤트와 결합하여 "지금 가입하고 영수증 무제한 엑셀 변환 기능을 체험해보세요"라고 유도하기 좋습니다.