"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AddCardModal } from "@/components/add-card-modal";
import { CardItem } from "@/components/card-item";
import { OnboardingBanner } from "@/components/onboarding-banner";
import { Toast } from "@/components/toast";
import { scenes } from "@/data/scenes";
import { saveOnboardingState } from "@/lib/onboarding";
import { useOnboarding } from "@/lib/use-onboarding";
import { useCards } from "@/lib/use-cards";
import { ToastState } from "@/lib/types";

export function SceneDetailPage({ sceneId }: { sceneId: string }) {
  const { cards } = useCards();
  const { onboarding, ready } = useOnboarding();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const scene = scenes.find((item) => item.id === sceneId);
  const sceneCards = useMemo(() => cards.filter((card) => card.scene === sceneId), [cards, sceneId]);
  const favoritesInScene = useMemo(() => sceneCards.filter((card) => card.isFavorite).length, [sceneCards]);
  const inReviewCount = useMemo(() => sceneCards.filter((card) => card.inReview).length, [sceneCards]);

  if (!scene) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
        <div className="paper-panel rounded-[30px] p-8 text-center">
          <h1 className="text-2xl font-semibold">这个场景暂时不存在</h1>
          <p className="mt-3 text-soft">你可以先回首页挑一个已有场景，或者直接添加自己的句子。</p>
          <Link href="/" className="mt-5 inline-flex rounded-full bg-accent px-5 py-3 text-white">
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-28 pt-6 md:px-6 md:pb-8 md:pt-8">
      <section className="paper-panel rounded-[32px] p-6 md:p-8">
        <Link href="/" className="text-sm text-soft transition hover:text-accent">
          ← 返回首页
        </Link>
        <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="rounded-full bg-warm px-3 py-1 text-sm text-accentStrong">{scene.icon}</span>
            <h1 className="mt-4 font-display text-4xl">{scene.name}</h1>
            <p className="mt-2 max-w-2xl text-soft">{scene.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-full bg-white/70 px-4 py-2 text-sm text-soft">共 {sceneCards.length} 句</div>
              <div className="rounded-full bg-white/70 px-4 py-2 text-sm text-soft">已收藏 {favoritesInScene} 句</div>
              <div className="rounded-full bg-white/70 px-4 py-2 text-sm text-soft">加入复习 {inReviewCount} 句</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
          >
            添加这个场景的新句子
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr]">
        {ready && onboarding.stage === "scene-picked" ? (
          <OnboardingBanner
            title="先收藏一句最可能会说的话"
            description="不需要全学完。先点开一条你今天最可能会用到的句子，收藏之后它就会进你的词本。"
            onDismiss={() => saveOnboardingState({ ...onboarding, stage: "dismissed" })}
          />
        ) : null}
        <div className="paper-panel rounded-[28px] p-5">
          <p className="text-sm text-soft">怎么学这一页最有效</p>
          <h2 className="mt-2 text-xl font-semibold">先听 2 句，再存 2 句</h2>
          <p className="mt-2 text-sm leading-6 text-soft">不用一次全记住。先点播放，挑出你在这个场景最可能真的会开口说的句子，收藏进词本就够了。</p>
        </div>
        <div className="paper-panel rounded-[28px] p-5">
          <p className="text-sm text-soft">学习目标</p>
          <h2 className="mt-2 text-xl font-semibold">今天带走 3 句能立刻用的话</h2>
          <p className="mt-2 text-sm leading-6 text-soft">如果今天只学这一页，建议至少保存一条“开场句”、一条“确认句”、一条“结尾句”。</p>
        </div>
      </section>

      <section className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soft">常用句列表</p>
          <h2 className="text-2xl font-semibold">先学这些最常会说的</h2>
        </div>
        <Link href="/cards" className="text-sm text-soft transition hover:text-accent">
          查看我的词本 →
        </Link>
      </section>

      <section className="mt-6 space-y-4">
        {sceneCards.map((card) => (
          <CardItem key={card.id} card={card} onToast={setToast} />
        ))}
      </section>

      <AddCardModal open={openModal} defaultScene={sceneId} onClose={() => setOpenModal(false)} onToast={setToast} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}
