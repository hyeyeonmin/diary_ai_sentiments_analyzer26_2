import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diary AI Sentiments Analyzer",
  description: "Gemini 기반 다이어리 실시간 감성 분석 및 일기 기록 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
