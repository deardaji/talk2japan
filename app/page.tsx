"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AddCardModal } from "@/components/add-card-modal";
import { SparkIcon } from "@/components/icons";
import { OnboardingHome } from "@/components/onboarding-home";
import { SceneCard } from "@/components/scene-card";
import { Toast } from "@/components/toast";
import { scenes } from "@/data/scenes";
import { useOnboarding } from "@/lib/use-onboarding";
import { useCards } from "@/lib/use-cards";
import { ToastState } from "@/lib/types";
import { getReviewQueue } from "@/lib/storage";

export default function HomePage() {
  const { cards, ready } = useCards();
  const { onboarding, ready: onboardingReady } = useOnboarding();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const reviewCount = useMemo(() => (ready ? getReviewQueue().length : 0), [cards, ready]);
  const favoriteCount = useMemo(() => cards.filter((card) => card.isFavorite).length, [cards]);
  const sceneCardsCount = useMemo(() => cards.filter((card) => card.sourceType === "system").length, [cards]);
  const recommendedScenes = scenes.slice(0, 3);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-28 pt-6 md:px-6 md:pb-8 md:pt-8">
      <section className="paper-panel overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.25fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-accentStrong">
              <SparkIcon className="h-4 w-4" />
              今天只要 3 分钟
            </div>
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">场景化日语学习</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-soft md:text-lg">
              不从教材开始，直接从你真会说到的话开始。先选一个场景，听一句、收藏一句、今晚顺手复习一轮。
            </p>

            <div className="mt-6 rounded-[28px] bg-white/72 p-4">
              <p className="text-sm text-soft">今天怎么开始最顺</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[20px] bg-[#fbf6ee] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-soft">Step 1</p>
                  <p className="mt-2 font-medium">选一个场景</p>
                  <p className="mt-1 text-sm text-soft">先挑你最近最可能用到的。</p>
                </div>
                <div className="rounded-[20px] bg-[#fbf6ee] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-soft">Step 2</p>
                  <p className="mt-2 font-medium">保存 3 句</p>
                  <p className="mt-1 text-sm text-soft">把今天最需要的表达先收进词本。</p>
                </div>
                <div className="rounded-[20px] bg-[#fbf6ee] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-soft">Step 3</p>
                  <p className="mt-2 font-medium">晚上复习</p>
                  <p className="mt-1 text-sm text-soft">轻刷一轮，让它变成能说出口的话。</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {recommendedScenes.map((scene) => (
                <Link
                  key={scene.id}
                  href={`/scenes/${scene.id}`}
                  className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm text-soft transition hover:border-accent hover:text-accent"
                >
                  先学 {scene.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-3 self-start">
            <Link href="/review" className="rounded-[28px] bg-accent p-5 text-white shadow-soft transition hover:bg-accentStrong">
              <p className="text-sm opacity-80">今日复习</p>
              <p className="mt-2 text-4xl font-semibold">{reviewCount}</p>
              <p className="mt-2 text-sm opacity-85">{reviewCount > 0 ? "从今天待复习开始最省力" : "今天还没有待复习，先收藏几句吧"}</p>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/cards" className="rounded-[24px] border border-line bg-white/75 px-4 py-4 transition hover:border-accent/40">
                <p className="text-sm text-soft">我的词本</p>
                <p className="mt-2 text-3xl font-semibold">{favoriteCount}</p>
                <p className="mt-2 text-xs text-soft">已保存句子</p>
              </Link>
              <div className="rounded-[24px] border border-line bg-white/75 px-4 py-4">
                <p className="text-sm text-soft">场景句库</p>
                <p className="mt-2 text-3xl font-semibold">{sceneCardsCount}</p>
                <p className="mt-2 text-xs text-soft">即点即学</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="rounded-[24px] bg-ink px-5 py-4 text-sm font-medium text-white transition hover:opacity-90"
            >
              添加一句自己的旅行日语
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8" id="scenes">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-soft">场景入口</p>
            <h2 className="text-2xl font-semibold">从最像真实旅行的地方开始</h2>
          </div>
          <p className="text-sm text-soft">{cards.length} 张卡片已就绪</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              count={cards.filter((card) => card.scene === scene.id).length}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="paper-panel rounded-[28px] p-5">
          <p className="text-sm text-soft">开始学习</p>
          <h3 className="mt-2 text-xl font-semibold">先听，再保存</h3>
          <p className="mt-3 text-sm leading-6 text-soft">场景页的每句话都能直接朗读，先找“今天就会说”的三句，比大量浏览更有效。</p>
        </div>
        <div className="paper-panel rounded-[28px] p-5">
          <p className="text-sm text-soft">个人词本</p>
          <h3 className="mt-2 text-xl font-semibold">把需要的话留下来</h3>
          <p className="mt-3 text-sm leading-6 text-soft">系统句子能收藏，自己的表达也能录入，慢慢积累成只属于你的旅行口语词本。</p>
        </div>
        <div className="paper-panel rounded-[28px] p-5">
          <p className="text-sm text-soft">每日 3 分钟</p>
          <h3 className="mt-2 text-xl font-semibold">今晚刷一轮就够</h3>
          <p className="mt-3 text-sm leading-6 text-soft">轻量复习比一次学很多更能留下来。会了、模糊、不会三档，足够维持日常节奏。</p>
        </div>
      </section>

      <section className="mt-8 paper-panel rounded-[30px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-soft">开始今天的学习</p>
            <h2 className="text-2xl font-semibold">先选一个场景，或者先记一句你现在就想学的话</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
            >
              添加新句子
            </button>
            <Link href="/review" className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm text-soft transition hover:border-accent hover:text-accent">
              开始今日复习
            </Link>
          </div>
        </div>
      </section>

      <div className="hidden">
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            添加新句子
          </button>
          <Link href="/review" className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm text-soft transition hover:border-accent hover:text-accent">
            开始今日复习
          </Link>
          <Link href="/cards" className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm text-soft transition hover:border-accent hover:text-accent">
            查看我的卡片
          </Link>
        </div>
      </div>

      <AddCardModal open={openModal} onClose={() => setOpenModal(false)} onToast={setToast} />
      {onboardingReady && onboarding.stage === "welcome" ? <OnboardingHome /> : null}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}
