import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "read";
    const timestamp = searchParams.get("timestamp");
    const customUrl = searchParams.get("scriptUrl");

    const scriptUrl = customUrl || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!scriptUrl || scriptUrl.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error:
            ".env.local 파일에 NEXT_PUBLIC_GOOGLE_SCRIPT_URL이 설정되지 않았습니다.",
        },
        { status: 400 }
      );
    }

    const targetUrl = new URL(scriptUrl);
    targetUrl.searchParams.set("action", action);
    if (timestamp) {
      targetUrl.searchParams.set("timestamp", timestamp);
    }

    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, raw: text };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Diary GET API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, timestamp, datetime, content, scriptUrl: customUrl } = body;

    const scriptUrl = customUrl || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!scriptUrl || scriptUrl.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error:
            ".env.local 파일에 NEXT_PUBLIC_GOOGLE_SCRIPT_URL이 설정되지 않았습니다.",
        },
        { status: 400 }
      );
    }

    // Google Apps Script Web App POST 요청 (redirect 자동 추적)
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: action || "create",
        timestamp,
        datetime,
        content,
      }),
      redirect: "follow",
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, raw: text };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Diary POST API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
