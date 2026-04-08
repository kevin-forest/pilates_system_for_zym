import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY || "";

  try {
    if (!apiKey) throw new Error("GEMINI_API_KEY가 없습니다.");

    // 1. 사용 가능한 모든 모델 목록 가져오기
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();

    if (!listData.models) throw new Error("모델 목록을 불러오지 못했습니다.");

    // 2. 텍스트 생성이 가능한 Gemini 모델들을 필터링하고 우선순위 순으로 정렬
    // 우선순위: 1.5-flash (빠름) -> 1.5-flash-8b (경량) -> 1.0-pro (안정)
    const candidates = listData.models
      .filter((m: any) => m.supportedGenerationMethods.includes("generateContent") && m.name.includes("gemini"))
      .map((m: any) => m.name.replace("models/", ""))
      .sort((a: string, b: string) => {
        const order = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.0-pro"];
        return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b));
      });

    const body = await request.json();
    const prompt = `너는 10년 차 수석 필라테스 강사야. 
회원의 상태(목적: ${body.goals}, 체형: ${body.posture}, 통증: ${body.pain})와 
오늘 수업(기구: ${body.apparatus}, 타겟: ${body.target})에 맞춘 50분 시퀀스를 마크다운으로 짜줘.`;

    // 3. 폴백 루프: 성공할 때까지 다음 모델로 시도
    let lastError = null;

    for (const modelName of candidates) {
      try {
        console.log(`🔄 시도 중인 모델: ${modelName}`);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        // 타임아웃 대비를 위해 15초 제한 설정 (선택 사항)
        const result = await model.generateContent(prompt);
        const sequence = result.response.text();

        console.log(`✅ 성공 모델: ${modelName}`);
        return NextResponse.json({ sequence, usedModel: modelName }, { status: 200 });

      } catch (err: any) {
        console.warn(`⚠️ ${modelName} 실패: ${err.message}. 다음 모델로 넘어갑니다.`);
        lastError = err;
        continue; // 다음 루프로 이동
      }
    }

    // 모든 모델이 실패했을 경우
    throw new Error(`모든 모델이 응답하지 않습니다. 마지막 에러: ${lastError?.message}`);

  } catch (error: any) {
    console.error("[Fallback System Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}