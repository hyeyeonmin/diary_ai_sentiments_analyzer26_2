import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "일기 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const startTime = Date.now();

    const systemPrompt = `당신은 공감 능력이 뛰어난 전문 심리 상담가이자 감정 분석 AI입니다.
사용자가 작성한 일기를 읽고, 다음 5가지 감정의 백분율 비율(합계 100%)을 도출하고 주 감정(primaryEmotion)을 선택하세요.
감정 카테고리 5가지:
1. "기쁨" (joy) - 감사, 성취, 활력, 행복
2. "평온" (calm) - 안도, 평화, 이완, 차분함
3. "슬픔" (sadness) - 외로움, 아쉬움, 반추, 우울
4. "불안" (anxiety) - 걱정, 부담감, 긴장, 혼란
5. "지침" (exhausted) - 피로, 번아웃, 무기력, 스트레스

또한 다음 지표(0~100점) 및 요약/공감 피드백을 제공하세요:
- fatigueScore: 신체적 & 정신적 피로도 (0~100)
- fatigueComment: 피로도 관련 짧은 해석 코멘트 (예: "오전 회의 과열 상태에서 산책 후 30%p 대폭 하락")
- resilienceScore: 의식적 회복 탄력성 (0~100)
- resilienceComment: 회복 탄력성 관련 짧은 해석 코멘트 (예: "자발적 산책을 통한 건강한 자기 치유 메커니즘 가동")
- peaceScore: 내면 심리 평온도 (0~100)
- peaceComment: 심리 평온도 관련 짧은 해석 코멘트 (예: "'소음이 가라앉았다' 문맥에서 매우 높은 심리적 안도 감지")
- empathyReport: 다정하고 따뜻한 어조의 Gemini 공감 리포트 (2-3문장, 따뜻한 위로와 격려, 통찰)
- recommendedActions: 오늘 밤 또는 내일을 위한 맞춤형 행동 제안 2가지 (예: ["1) 수면 1시간 전 스마트폰 끄기", "2) 내일 투두리스트 총 1개 위임하기"])`;

    let response;
    let retries = 4;
    let delay = 1000;
    while (retries >= 0) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: [
            {
              role: "user",
              parts: [{ text: `사용자의 일기:\n"""\n${content}\n"""\n\n위 일기를 분석하여 지정된 스키마 형식으로 정밀하게 응답해 주세요.` }],
            },
          ],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                primaryEmotion: {
                  type: Type.STRING,
                  description: "5가지 감정(기쁨, 평온, 슬픔, 불안, 지침) 중 가장 주도적인 감정 하나",
                },
                emotions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "기쁨, 평온, 슬픔, 불안, 지침 중 하나" },
                      percentage: { type: Type.INTEGER, description: "해당 감정의 비율 (0-100)" },
                      isDominant: { type: Type.BOOLEAN, description: "가장 주도적인 감정 여부" },
                    },
                    required: ["name", "percentage", "isDominant"],
                  },
                },
                metrics: {
                  type: Type.OBJECT,
                  properties: {
                    fatigueScore: { type: Type.INTEGER },
                    fatigueComment: { type: Type.STRING },
                    resilienceScore: { type: Type.INTEGER },
                    resilienceComment: { type: Type.STRING },
                    peaceScore: { type: Type.INTEGER },
                    peaceComment: { type: Type.STRING },
                  },
                  required: [
                    "fatigueScore",
                    "fatigueComment",
                    "resilienceScore",
                    "resilienceComment",
                    "peaceScore",
                    "peaceComment",
                  ],
                },
                empathyReport: { type: Type.STRING },
                recommendedActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["primaryEmotion", "emotions", "metrics", "empathyReport", "recommendedActions"],
            },
          },
        });
        break;
      } catch (err: any) {
        if (retries === 0) throw err;
        retries--;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.5;
      }
    }

    const latencySec = ((Date.now() - startTime) / 1000).toFixed(2);
    const parsedData = JSON.parse(response?.text || "{}");

    return NextResponse.json({
      success: true,
      latency: latencySec,
      modelUsed: "gemini-3.1-flash-lite",
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    let message = error?.message || "감정 분석 중 오류가 발생했습니다.";
    if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
      message = "Gemini API 무료 요청 한도(Free Tier Quota)에 일시적으로 도달했습니다. 1분 후 다시 시도해 주세요.";
    } else if (message.includes("503") || message.includes("UNAVAILABLE")) {
      message = "Gemini 모델에 일시적으로 트래픽이 몰리고 있습니다. 잠시 후 다시 시도해 주세요.";
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
