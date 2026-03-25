"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ReviewCard } from "@/components/review-card";
import { Toast } from "@/components/toast";
import { OnboardingBanner } from "@/components/onboarding-banner";
import { scenes } from "@/data/scenes";
import { getOnboardingState, saveOnboardingState } from "@/lib/onboarding";
import { applyReviewResult } from "@/lib/srs";
import { getReviewQueue, patchCard } from "@/lib/storage";
import { useOnboarding } from "@/lib/use-onboarding";
import { Card, ReviewResult, ToastState } from "@/lib/types";
import { useCards } from "@/lib/use-cards";

type ReviewStats = {
  easy: number;
  hard: number;
  again: number;
};

type FeedbackState = {
  tone: "easy" | "hard" | "again";
  title: string;
  detail: string;
} | null;

function previewSnippet(text: string, length = 7) {
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length)}…`;
}

export default function ReviewPage() {
  const { ready } = useCards();
  const { onboarding, ready: onboardingReady } = useOnboarding();
  const [queue, setQueue] = useState<Card[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<ReviewStats>({ easy: 0, hard: 0, again: 0 });
  const [toast, setToast] = useState<ToastState | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    if (ready) {
      const dueCards = getReviewQueue();
      setQueue(dueCards);
      setTotalCount(dueCards.length);
      setStats({ easy: 0, hard: 0, again: 0 });
    }
  }, [ready]);

  const currentCard = queue[0];
  const nextCard = queue[1];
  const total = totalCount;
  const completed = stats.easy + stats.hard + stats.again;
  const remaining = Math.max(total - completed, 0);
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const sceneName = useMemo(
    () => scenes.find((scene) => scene.id === currentCard?.scene)?.name ?? "自定义场景",
    [currentCard]
  );
  const rhythmLabel = useMemo(() => {
    if (total === 0) {
      return "今天可以先去收藏几句新的表达。";
    }
    if (remaining <= 1) {
      return "最后一张了，收个尾就好。";
    }
    if (remaining === 2) {
      return "已经快结束了，再刷两张。";
    }
    if (completed > 0 && completed % 3 === 0) {
      return `已经完成 ${completed} 张，节奏很好。`;
    }
    return "保持这个节奏，一张接一张就好。";
  }, [completed, remaining, total]);
  const nextPreview = useMemo(() => {
    if (!nextCard) {
      return null;
    }

    const nextSceneName = scenes.find((scene) => scene.id === nextCard.scene)?.name ?? "下一张";
    return {
      sceneName: nextSceneName,
      hint: previewSnippet(nextCard.chinese, 8)
    };
  }, [nextCard]);

  const handleReview = (result: ReviewResult) => {
    if (!currentCard || isAdvancing) {
      return;
    }

    patchCard(currentCard.id, (card) => applyReviewResult(card, result));
    setStats((prev) => ({ ...prev, [result]: prev[result] + 1 }));
    setFeedback(
      result === "easy"
        ? { tone: "easy", title: "顺了", detail: "这句已经可以拉长复习间隔。" }
        : result === "hard"
          ? { tone: "hard", title: "继续熟悉", detail: "近期再看一次，最容易留下来。" }
          : { tone: "again", title: "先记住它", detail: "这句会更快回来，再刷一轮就好。" }
    );
    setIsAdvancing(true);
    setToast({
      message: result === "easy" ? "这张卡片已拉长复习间隔。" : result === "hard" ? "已安排近期再看一次。" : "已标记加强，稍后会更快出现。",
      tone: "success"
    });
    const onboardingState = getOnboardingState();
    if (onboardingState.stage === "saved-first") {
      saveOnboardingState({ ...onboardingState, stage: "completed" });
    }
    window.setTimeout(() => {
      setQueue((prev) => prev.slice(1));
      setFeedback(null);
      setIsAdvancing(false);
    }, 260);
  };

  if (!ready) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-28 pt-6 md:px-6 md:pb-8 md:pt-8">
      <section className="paper-panel rounded-[32px] p-6 md:p-8">
        <Link href="/" className="text-sm text-soft transition hover:text-accent">
          ← 返回首页
        </Link>
        <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-soft">每日复习</p>
            <h1 className="font-display text-4xl">今日复习 {remaining} 张</h1>
            <p className="mt-2 text-soft">用一个短回合，把已经保存过的话重新刷到更自然。</p>
          </div>
          <div className="rounded-[24px] bg-white/70 px-4 py-3 text-sm text-soft">
            已完成 {completed} / {total}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm text-soft">
            <span>本轮进度</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/70">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </section>

      {total === 0 ? (
        <section className="paper-panel mt-6 rounded-[30px] p-8 text-center">
          <h2 className="text-2xl font-semibold">今天的复习已经清空了</h2>
          <p className="mt-3 text-soft">你可以去场景页收藏更多句子，或者添加自己的旅行表达。</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/" className="rounded-full bg-accent px-5 py-3 text-white">去选场景</Link>
            <Link href="/cards" className="rounded-full border border-line bg-white/75 px-5 py-3 text-soft">查看我的卡片</Link>
          </div>
        </section>
      ) : currentCard ? (
        <section className="mt-6">
          {onboardingReady && onboarding.stage === "saved-first" ? (
            <div className="mb-4">
              <OnboardingBanner
                title="很好，试着刷一张复习卡"
                description="翻面看答案，然后按“会了 / 模糊 / 不会”选一个。只要开始一次，之后就会很自然。"
                onDismiss={() => saveOnboardingState({ ...onboarding, stage: "completed" })}
              />
            </div>
          ) : null}
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-white/72 px-4 py-3 text-sm text-soft">还剩 {remaining} 张</div>
            <div className="rounded-[22px] bg-white/72 px-4 py-3 text-sm text-soft">会了 {stats.easy} 张</div>
            <div className="rounded-[22px] bg-white/72 px-4 py-3 text-sm text-soft">需要加强 {stats.again} 张</div>
          </div>
          <div className="mb-4 rounded-[22px] bg-white/72 px-4 py-3 text-sm text-soft">
            {rhythmLabel}
          </div>
          <div className={`review-stage ${isAdvancing ? "is-advancing" : ""}`}>
            <ReviewCard key={currentCard.id} card={currentCard} sceneName={sceneName} onToast={setToast} />
          </div>
          {feedback && nextPreview ? (
            <div className="review-next-preview mt-4 rounded-[22px] border border-line bg-white/75 px-4 py-3 text-sm text-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-soft/80">Next</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{nextPreview.hint}</p>
                  <p className="mt-1 text-xs text-soft">{nextPreview.sceneName}</p>
                </div>
                <span className="text-xs text-accentStrong">下一张马上开始</span>
              </div>
            </div>
          ) : null}
          {feedback ? (
            <div
              className={`review-feedback mt-4 rounded-[22px] px-4 py-3 text-sm ${
                feedback.tone === "easy"
                  ? "bg-emerald-50 text-emerald-700"
                  : feedback.tone === "hard"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
              }`}
            >
              <span className="font-medium">{feedback.title}</span>
              <span className="ml-2 opacity-90">{feedback.detail}</span>
            </div>
          ) : null}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleReview("again")}
              disabled={isAdvancing}
              className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-600"
            >
              不会
            </button>
            <button
              type="button"
              onClick={() => handleReview("hard")}
              disabled={isAdvancing}
              className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-700"
            >
              模糊
            </button>
            <button
              type="button"
              onClick={() => handleReview("easy")}
              disabled={isAdvancing}
              className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-700"
            >
              会了
            </button>
          </div>
        </section>
      ) : (
        <section className="paper-panel mt-6 rounded-[30px] p-8 text-center">
          <h2 className="text-2xl font-semibold">今日复习完成</h2>
          <p className="mt-3 text-soft">这一轮很完整。今天该记住的话已经过了一遍，停在这里刚刚好，明天回来会更轻松。</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white/72 px-4 py-4">
              <p className="text-sm text-soft">完成张数</p>
              <p className="mt-2 text-3xl font-semibold">{completed}</p>
            </div>
            <div className="rounded-[24px] bg-white/72 px-4 py-4">
              <p className="text-sm text-soft">会了</p>
              <p className="mt-2 text-3xl font-semibold">{stats.easy}</p>
            </div>
            <div className="rounded-[24px] bg-white/72 px-4 py-4">
              <p className="text-sm text-soft">还需加强</p>
              <p className="mt-2 text-3xl font-semibold">{stats.again}</p>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] bg-white/72 px-4 py-4 text-sm text-soft">
            {stats.easy > stats.again ? "今天这轮整体很顺，明天继续就会越来越自然。" : "今天把难点标出来已经很有价值，下次回来会更稳。"}
          </div>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/" className="rounded-full bg-accent px-5 py-3 text-white">返回首页</Link>
            <Link href="/cards" className="rounded-full border border-line bg-white/75 px-5 py-3 text-soft">继续整理卡片</Link>
          </div>
        </section>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}
