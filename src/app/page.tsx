"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Copy,
  Loader2,
  ShieldAlert,
  Check,
  CheckCircle2,
  Save,
  BookOpen,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DiaryEntry {
  timestamp: string;
  datetime: string;
  content: string;
}

interface EmotionItem {
  name: string;
  percentage: number;
  isDominant: boolean;
}

interface AnalysisResult {
  primaryEmotion: string;
  emotions: EmotionItem[];
  metrics: {
    fatigueScore: number;
    fatigueComment: string;
    resilienceScore: number;
    resilienceComment: string;
    peaceScore: number;
    peaceComment: string;
  };
  empathyReport: string;
  recommendedActions: string[];
}

// 5대 기본 감성 정의
const BASE_EMOTIONS = [
  { name: "기쁨", emoji: "😊", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-400", activeBg: "bg-amber-100" },
  { name: "평온", emoji: "🌿", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-400", activeBg: "bg-emerald-100" },
  { name: "슬픔", emoji: "💧", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-400", activeBg: "bg-indigo-100" },
  { name: "불안", emoji: "⚡", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-400", activeBg: "bg-purple-100" },
  { name: "지침", emoji: "🥱", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-400", activeBg: "bg-rose-100" },
];

export default function DiaryAnalyzerPage() {
  // 날짜(년. 월. 일 및 요일) 상태
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>("");
  const [diaryTitle, setDiaryTitle] = useState<string>("");
  const [diaryContent, setDiaryContent] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [readingTime, setReadingTime] = useState<number>(1);

  // 로딩 & AI 분석 결과 상태 (초기에는 null)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [latency, setLatency] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // 현재 날짜 및 요일 설정
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      const dayName = days[now.getDay()];
      
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");

      setCurrentDateFormatted(`${year}. ${month}. ${date} (${dayName})`);
    };

    updateDate();
  }, []);

  // 글자수 및 읽는 시간 계산
  useEffect(() => {
    const trimmed = diaryContent.trim();
    const count = trimmed ? trimmed.length : 0;
    setWordCount(count);
    setReadingTime(Math.max(1, Math.ceil(count / 250)));
  }, [diaryContent]);

  // AI 분석 요청 핸들러
  const handleAnalyze = async () => {
    if (!diaryContent.trim()) {
      alert("일기 내용을 입력해주세요!");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: diaryContent }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "분석 요청에 실패했습니다.");
      }

      setAnalysisResult(resData.data);
      if (resData.latency) {
        setLatency(`${resData.latency}s`);
      }

      // 축하 폭죽 효과
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.75 },
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "분석 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 재시작 버튼 핸들러 (초기화)
  const handleReset = () => {
    if (confirm("일기 작성 내용을 초기화하고 다시 시작할까요?")) {
      setDiaryTitle("");
      setDiaryContent("");
      setAnalysisResult(null);
      setErrorMessage(null);
      setLatency("");
    }
  };

  // 결과 복사 핸들러
  const handleCopyResult = () => {
    if (!analysisResult) return;
    const textToCopy = `[Gemini 3.8 Flash 감정 분석 리포트]\n주요 감정: ${analysisResult.primaryEmotion}\n\n${analysisResult.empathyReport}\n\n추천 행동:\n- ${analysisResult.recommendedActions.join("\n- ")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Sheets CRUD 상태
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [diaryList, setDiaryList] = useState<DiaryEntry[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 수정 상태 (Update)
  const [editingTimestamp, setEditingTimestamp] = useState<string | null>(null);
  const [editDatetime, setEditDatetime] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // 삭제 진행 중 timestamp (Delete)
  const [deletingTimestamp, setDeletingTimestamp] = useState<string | null>(null);

  // 사용자 수동 스크립트 URL 설정 지원
  const [manualScriptUrl, setManualScriptUrl] = useState<string>("");
  const [showUrlSettings, setShowUrlSettings] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("NEXT_PUBLIC_GOOGLE_SCRIPT_URL");
      if (savedUrl) setManualScriptUrl(savedUrl);
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getEffectiveScriptUrl = () => {
    return (
      (typeof window !== "undefined" && localStorage.getItem("NEXT_PUBLIC_GOOGLE_SCRIPT_URL")) ||
      process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
      manualScriptUrl ||
      ""
    );
  };

  // 1. Create (저장)
  const handleSaveDiary = async () => {
    if (!diaryContent.trim()) {
      alert("저장할 일기 내용을 작성해주세요!");
      return;
    }

    const scriptUrl = getEffectiveScriptUrl();

    setIsSaving(true);
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          datetime: currentDateFormatted || new Date().toLocaleDateString(),
          content: diaryContent,
          scriptUrl: scriptUrl || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "구글 시트 저장에 실패했습니다.");
      }

      showToast("✅ 구글 시트에 일기가 성공적으로 저장되었습니다!");

      if (isListModalOpen || diaryList.length > 0) {
        fetchDiaryList();
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("NEXT_PUBLIC_GOOGLE_SCRIPT_URL이 설정되지 않았습니다")) {
        setShowUrlSettings(true);
        setIsListModalOpen(true);
      }
      alert(`저장 실패: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Read (목록 조회)
  const fetchDiaryList = async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const scriptUrl = getEffectiveScriptUrl();
      const queryParam = scriptUrl ? `?action=read&scriptUrl=${encodeURIComponent(scriptUrl)}` : "?action=read";
      
      const res = await fetch(`/api/diary${queryParam}`);
      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "일기 목록을 불러오지 못했습니다.");
      }

      setDiaryList(Array.isArray(resData.data) ? resData.data : []);
    } catch (err: any) {
      console.error(err);
      setListError(err.message || "일기 목록을 조회할 수 없습니다.");
      if (err.message?.includes("NEXT_PUBLIC_GOOGLE_SCRIPT_URL이 설정되지 않았습니다")) {
        setShowUrlSettings(true);
      }
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleOpenDiaryList = () => {
    setIsListModalOpen(true);
    fetchDiaryList();
  };

  // 3. Update (수정)
  const handleStartEdit = (item: DiaryEntry) => {
    setEditingTimestamp(item.timestamp);
    setEditDatetime(item.datetime);
    setEditContent(item.content);
  };

  const handleCancelEdit = () => {
    setEditingTimestamp(null);
    setEditDatetime("");
    setEditContent("");
  };

  const handleUpdateDiary = async (timestamp: string) => {
    if (!editContent.trim()) {
      alert("일기 내용을 입력해주세요.");
      return;
    }

    setIsUpdating(true);
    try {
      const scriptUrl = getEffectiveScriptUrl();
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          timestamp,
          datetime: editDatetime,
          content: editContent,
          scriptUrl: scriptUrl || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "일기 수정에 실패했습니다.");
      }

      showToast("✏️ 일기가 수정되었습니다.");
      setDiaryList((prev) =>
        prev.map((item) =>
          item.timestamp === timestamp
            ? { ...item, datetime: editDatetime, content: editContent }
            : item
        )
      );
      setEditingTimestamp(null);
    } catch (err: any) {
      alert(`수정 실패: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Delete (삭제)
  const handleDeleteDiary = async (timestamp: string) => {
    if (!confirm("정말 이 일기를 구글 시트에서 삭제하시겠습니까?")) {
      return;
    }

    setDeletingTimestamp(timestamp);
    try {
      const scriptUrl = getEffectiveScriptUrl();
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          timestamp,
          scriptUrl: scriptUrl || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "일기 삭제에 실패했습니다.");
      }

      showToast("🗑️ 일기가 삭제되었습니다.");
      setDiaryList((prev) => prev.filter((item) => item.timestamp !== timestamp));
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    } finally {
      setDeletingTimestamp(null);
    }
  };

  // 일기 불러오기 (작성 영역에 채우기)
  const handleLoadToEditor = (item: DiaryEntry) => {
    if (
      diaryContent.trim() &&
      !confirm("현재 작성 중인 일기 내용이 선택한 일기 내용으로 대체됩니다. 계속할까요?")
    ) {
      return;
    }
    setDiaryContent(item.content);
    if (item.datetime) {
      setCurrentDateFormatted(item.datetime);
    }
    setIsListModalOpen(false);
    showToast("📝 선택한 일기를 작성창으로 불러왔습니다.");
  };

  const handleSaveManualUrl = (url: string) => {
    const trimmed = url.trim();
    setManualScriptUrl(trimmed);
    if (typeof window !== "undefined") {
      localStorage.setItem("NEXT_PUBLIC_GOOGLE_SCRIPT_URL", trimmed);
    }
    showToast("URL이 저장되었습니다.");
    setShowUrlSettings(false);
    fetchDiaryList();
  };

  // 현재 일자의 숫자
  const todayDateNum = new Date().getDate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1C30] flex flex-col font-sans">
      {/* 1. 상단 글로벌 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* 로고 영역 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">Aura Journal</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Gemini 3.1 Flash-Lite
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">마음 기록 & AI 감성 분석 시스템</p>
            </div>
          </div>

          {/* 중간 날짜 뱃지 */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100/90 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-medium border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentDateFormatted || "오늘"}</span>
            </div>
          </div>

          {/* 우측 도구: 재시작 버튼 */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-sm cursor-pointer"
              title="일기 초기화 후 재시작"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>재시작</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
              AI
            </div>
          </div>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-6">
        
        {/* 상단 날짜 (요일 포함) + 제목 입력 영역 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            {/* 일기 작성 날짜 (년. 월. 일 및 요일) */}
            <div className="inline-flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 px-3.5 py-1.5 rounded-full text-indigo-950 font-semibold text-xs sm:text-sm whitespace-nowrap">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{currentDateFormatted || "오늘"}</span>
            </div>

            {/* 일기 제목 입력란 */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-slate-400 text-sm">✏️</span>
              <input
                type="text"
                value={diaryTitle}
                onChange={(e) => setDiaryTitle(e.target.value)}
                placeholder="오늘의 마음을 표현해보세요..."
                className="w-full text-sm sm:text-base font-semibold text-slate-800 focus:outline-none bg-transparent placeholder-slate-400"
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> 새로 쓰기
          </button>
        </div>

        {/* 2열 메인 레이아웃: 일기 작성(좌) + 캘린더/마음곡선(우) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* [일기 작성 영역 - 8열] */}
          <section className="lg:col-span-8 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400">
              
              {/* 상단 텍스트 정보 메타바 */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-600">
                    작성일: {currentDateFormatted}
                  </span>
                  <span>•</span>
                  <span>{wordCount}자 작성</span>
                  <span>•</span>
                  <span>읽는 시간 약 {readingTime}분</span>
                </div>

                {/* 오른쪽 상단 액션 버튼 그룹: [저장], [일기보기] */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDiary}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                    title="구글 시트에 일기 저장"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSaving ? "저장 중..." : "저장"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenDiaryList}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 active:scale-98 text-slate-700 border border-slate-300 shadow-xs transition cursor-pointer"
                    title="구글 시트 일기 목록 보기"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>일기보기</span>
                  </button>
                </div>
              </div>

              {/* [일기 작성 영역] 텍스트에어리어 (목업 텍스트 없음) */}
              <div className="relative">
                <textarea
                  value={diaryContent}
                  onChange={(e) => setDiaryContent(e.target.value)}
                  placeholder="오늘 어떤 일들이 있었나요? 기뻤던 순간, 힘들었던 순간, 떠오르는 생각과 감정들을 자유롭게 적어보세요..."
                  rows={8}
                  className="w-full text-slate-800 text-base sm:text-lg leading-relaxed focus:outline-none resize-none placeholder-slate-300 font-normal min-h-[200px]"
                />
              </div>

              {/* [AI 분석 버튼] 및 재시작 액션 바 */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || !diaryContent.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 active:scale-98 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini-3.1-Flash-Lite 분석 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>✨ AI 분석 (Gemini-3.1-Flash-Lite 감성 분석)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>재시작</span>
                </button>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* [감성 이모지 영역] - AI가 분석을 실시한 후에만 화면에 표시 */}
            {analysisResult && (
              <div className="bg-white rounded-3xl border border-indigo-100 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎨</span>
                    <h3 className="text-sm font-bold text-slate-800">
                      분석된 오늘의 감정 팔레트
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini 3.1 Flash-Lite 감정 탐지 반영 완료</span>
                  </div>
                </div>

                {/* 5개 감성 이모지 뱃지 영역 - AI 분석 결과에 따라 가장 주도적인 감성 강조 */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {BASE_EMOTIONS.map((item) => {
                    const matchingResult = analysisResult.emotions?.find((e) => e.name === item.name);
                    const isDominant = matchingResult
                      ? matchingResult.isDominant || analysisResult.primaryEmotion === item.name
                      : false;
                    const percentage = matchingResult ? matchingResult.percentage : 0;

                    return (
                      <div
                        key={item.name}
                        className={`relative flex items-center justify-between sm:justify-center sm:flex-col gap-1.5 px-3.5 py-3 rounded-2xl border transition-all duration-300 ${
                          isDominant
                            ? `${item.activeBg} ${item.border} border-2 shadow-md shadow-indigo-100 scale-105 z-10 ring-2 ring-indigo-400/40`
                            : `${item.bg} border-slate-200/70 opacity-75 hover:opacity-100`
                        }`}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-1">
                          <span className="text-xl">{item.emoji}</span>
                          <span className={`text-xs font-bold ${item.color}`}>{item.name}</span>
                        </div>
                        <span className={`text-sm font-extrabold ${item.color}`}>
                          {percentage}%
                        </span>
                        {isDominant && (
                          <span className="absolute -top-2.5 right-2 sm:right-auto px-2 py-0.5 text-[10px] font-black bg-indigo-600 text-white rounded-full shadow-sm animate-bounce">
                            지배적 감정
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* [우측 사이드 패널 - 4열]: 캘린더 & 주간 마음 곡선 */}
          <aside className="lg:col-span-4 space-y-5">
            {/* 미니 캘린더 */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
                  </h3>
                  <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    오늘 {todayDateNum}일
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <ChevronLeft className="w-4 h-4 hover:text-slate-700 cursor-pointer" />
                  <ChevronRight className="w-4 h-4 hover:text-slate-700 cursor-pointer" />
                </div>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2">
                <span className="text-rose-500">일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span className="text-blue-500">토</span>
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                <span className="py-1.5 text-slate-300">27</span>
                <span className="py-1.5 text-slate-300">28</span>
                <span className="py-1.5 text-slate-300">29</span>
                <span className="py-1.5 text-slate-300">30</span>
                <span className="py-1.5 rounded-xl bg-indigo-600 text-white font-bold shadow-sm">
                  {todayDateNum}
                </span>
                <span className="py-1.5 text-slate-600">2</span>
                <span className="py-1.5 text-slate-600">3</span>
                <span className="py-1.5 text-slate-600">4</span>
                <span className="py-1.5 text-slate-600">5</span>
                <span className="py-1.5 text-slate-600">6</span>
                <span className="py-1.5 text-slate-600">7</span>
                <span className="py-1.5 text-slate-600">8</span>
                <span className="py-1.5 text-slate-600">9</span>
                <span className="py-1.5 text-slate-600">10</span>
                <span className="py-1.5 text-slate-600">11</span>
                <span className="py-1.5 text-slate-600">12</span>
                <span className="py-1.5 text-slate-600">13</span>
                <span className="py-1.5 text-slate-600">14</span>
                <span className="py-1.5 text-slate-600">15</span>
                <span className="py-1.5 text-slate-600">16</span>
                <span className="py-1.5 text-slate-600">17</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>오늘의 일기를 작성해 보세요!</span>
                </div>
              </div>
            </div>

            {/* 이번 주 마음 곡선 요약 카드 */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">주간 마음 흐름</h3>
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                  AI 감정 기록 <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="h-16 w-full flex items-end justify-between px-2 pt-2 relative">
                <div className="absolute inset-x-2 top-6 border-b border-dashed border-slate-200"></div>
                <div className="flex flex-col items-center gap-1 z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <span className="text-[10px] text-slate-400">월</span>
                </div>
                <div className="flex flex-col items-center gap-1 z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <span className="text-[10px] text-slate-400">화</span>
                </div>
                <div className="flex flex-col items-center gap-1 z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <span className="text-[10px] text-slate-400">수</span>
                </div>
                <div className="flex flex-col items-center gap-1 z-10">
                  <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100"></div>
                  <span className="text-[10px] font-bold text-indigo-600">오늘</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                일기를 작성하고 감정 분석을 실행하면 오늘의 주 감정과 마인드 지표가 시각화됩니다.
              </p>
            </div>
          </aside>
        </div>

        {/* 3. [AI 일기 감성 분석 결과] 영역 - AI가 분석을 완료했을 때만 화면에 노출 */}
        {analysisResult && (
          <section className="bg-white rounded-3xl border border-indigo-100 p-6 sm:p-8 shadow-lg shadow-indigo-100/50 space-y-6 relative overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-400"></div>

            {/* 헤더 정보 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Gemini 3.1 Flash-Lite 심층 감성 분석 & 케어 제안
                    </h2>
                    {latency && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Latency {latency}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">일기 속 문장 패턴과 감정 전환 구조를 다각도로 해석했습니다.</p>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>분석 모델: Gemini-3.1-Flash-Lite</span>
              </div>
            </div>

            {/* 3대 핵심 심리 지표 카드 (피로도, 회복탄력성, 평온도) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. 피로도 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>신체적 & 정신적 피로도</span>
                  <span className="text-base text-rose-600 font-extrabold">
                    {analysisResult.metrics.fatigueScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${analysisResult.metrics.fatigueScore}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {analysisResult.metrics.fatigueComment}
                </p>
              </div>

              {/* 2. 회복 탄력성 */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                  <span>의식적 회복 탄력성</span>
                  <span className="text-base text-indigo-600 font-extrabold">
                    {analysisResult.metrics.resilienceScore}%
                  </span>
                </div>
                <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${analysisResult.metrics.resilienceScore}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-indigo-950/70 leading-snug">
                  {analysisResult.metrics.resilienceComment}
                </p>
              </div>

              {/* 3. 내면 심리 평온도 */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>내면 심리 평온도</span>
                  <span className="text-base text-emerald-600 font-extrabold">
                    {analysisResult.metrics.peaceScore}%
                  </span>
                </div>
                <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${analysisResult.metrics.peaceScore}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-emerald-950/70 leading-snug">
                  {analysisResult.metrics.peaceComment}
                </p>
              </div>
            </div>

            {/* Gemini 공감 리포트 카드 */}
            <div className="relative p-6 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-slate-800">
              <div className="flex items-start gap-4">
                <span className="text-4xl text-indigo-400 font-serif select-none leading-none">“</span>
                <div className="space-y-2 flex-1">
                  <h4 className="text-sm font-bold text-indigo-900">Gemini 공감 리포트</h4>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-normal">
                    {analysisResult.empathyReport}
                  </p>
                </div>
              </div>
            </div>

            {/* 하단 오늘 밤 추천 행동 & 복사 버튼 */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  💡 오늘 밤 추천 행동:
                </span>
                {analysisResult.recommendedActions.map((action, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 text-slate-700 font-medium px-3 py-1 rounded-full border border-slate-200/80"
                  >
                    {action}
                  </span>
                ))}
              </div>

              <button
                onClick={handleCopyResult}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "복사됨!" : "분석 결과 복사"}</span>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* 세련된 푸터 영역 */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/90 backdrop-blur-md py-8 px-4 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            {/* 브랜드 & 프로젝트 설명 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                    Diary AI Sentiments Analyzer
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    INU
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI 기반 마음 기록 및 실시간 다이어리 감정 분석 플랫폼
                </p>
              </div>
            </div>

            {/* 기술 스택 & 시스템 뱃지 */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Gemini 3.1 Flash-Lite
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                Google Sheets CRUD
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                Next.js & Tailwind CSS
              </span>
            </div>
          </div>

          {/* 하단 Copyright & 제작자 명시 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs font-semibold text-slate-600">
              Copyright INU Diary AI Sentiments Analyzer by hyeyeon min
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
      {/* 토스트 알림 메시지 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 구글 시트 일기 목록 모달 [일기보기] */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* 모달 상단 헤더 */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800">구글 시트 일기 목록</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      총 {diaryList.length}건
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">스프레드시트에 저장된 일기 데이터 (CRUD)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://docs.google.com/spreadsheets/d/1l9tXmOsv1TX9FBbBdmZ5zUkeiTuBpQK3bqH8lbTwXhw/edit?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition"
                  title="구글 스프레드시트 새 창에서 열기"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>시트 열기</span>
                </a>

                <button
                  onClick={fetchDiaryList}
                  disabled={isLoadingList}
                  className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                  title="새로고침"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingList ? "animate-spin text-indigo-600" : ""}`} />
                </button>

                <button
                  onClick={() => setIsListModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 웹 앱 URL 설정 배너 (설정 누락 시 또는 수동 입력용) */}
            {(!process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || showUrlSettings) && (
              <div className="px-5 py-3 bg-amber-50/70 border-b border-amber-200/60 text-xs text-amber-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5 text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    구글 웹 앱 URL(NEXT_PUBLIC_GOOGLE_SCRIPT_URL) 연결
                  </span>
                  <button
                    onClick={() => setShowUrlSettings(!showUrlSettings)}
                    className="text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
                  >
                    {showUrlSettings ? "접기" : "URL 설정 열기"}
                  </button>
                </div>

                {showUrlSettings && (
                  <div className="pt-1 space-y-2">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Apps Script 웹 앱 배포 URL을 입력하면 즉시 연결되어 테스트할 수 있습니다. (또는 <code>.env.local</code>에 추가 후 서버 재시작)
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={manualScriptUrl}
                        onChange={(e) => setManualScriptUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleSaveManualUrl(manualScriptUrl)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer whitespace-nowrap"
                      >
                        연결 저장
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 모달 본문 영역 */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/40">
              {isLoadingList ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs font-medium text-slate-500">구글 시트에서 일기를 불러오는 중입니다...</p>
                </div>
              ) : listError ? (
                <div className="py-12 px-6 text-center space-y-3 bg-white rounded-2xl border border-rose-200">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">목록을 불러오지 못했습니다</h4>
                  <p className="text-xs text-rose-600 max-w-md mx-auto">{listError}</p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={fetchDiaryList}
                      className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                    >
                      다시 시도
                    </button>
                    <button
                      onClick={() => setShowUrlSettings(true)}
                      className="px-4 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer"
                    >
                      URL 설정하기
                    </button>
                  </div>
                </div>
              ) : diaryList.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-200">
                  <div className="text-3xl">📖</div>
                  <h4 className="text-sm font-bold text-slate-700">저장된 일기가 없습니다</h4>
                  <p className="text-xs text-slate-400">
                    일기를 작성하고 상단의 [저장] 버튼을 누르면 구글 시트에 안전하게 보관됩니다.
                  </p>
                </div>
              ) : (
                diaryList.map((item, index) => {
                  const isEditingThis = editingTimestamp === item.timestamp;
                  const isDeletingThis = deletingTimestamp === item.timestamp;

                  return (
                    <div
                      key={item.timestamp || index}
                      className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
                    >
                      {/* 항목 상단 메타 바 */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          <span className="text-xs font-bold text-slate-700">
                            {item.datetime || "작성일시 미상"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {item.timestamp}
                          </span>
                        </div>

                        {/* 우측 조작 액션 (불러오기, 수정, 삭제) */}
                        {!isEditingThis && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleLoadToEditor(item)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition cursor-pointer"
                              title="이 일기 내용을 작성창으로 불러옵니다"
                            >
                              불러오기
                            </button>
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
                              title="수정"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDiary(item.timestamp)}
                              disabled={isDeletingThis}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer disabled:opacity-50"
                              title="삭제"
                            >
                              {isDeletingThis ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 본문 영역 (일반 보기 vs 수정 모드) */}
                      {isEditingThis ? (
                        <div className="space-y-3 pt-1">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-slate-500">작성일시:</label>
                            <input
                              type="text"
                              value={editDatetime}
                              onChange={(e) => setEditDatetime(e.target.value)}
                              className="flex-1 text-xs border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 text-slate-800"
                            />
                          </div>

                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={4}
                            className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-800 resize-none leading-relaxed"
                          />

                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => handleUpdateDiary(item.timestamp)}
                              disabled={isUpdating}
                              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {isUpdating && <Loader2 className="w-3 h-3 animate-spin" />}
                              <span>수정 완료</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                          {item.content}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* 모달 하단 닫기 */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                시트: <code>Sheet1</code> (timestamp, datetime, content)
              </span>
              <button
                onClick={() => setIsListModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
