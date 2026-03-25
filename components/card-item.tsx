"use client";

import { useEffect, useState } from "react";
import { Card, ToastState } from "@/lib/types";
import { HeartIcon, TrashIcon } from "@/components/icons";
import { scenes } from "@/data/scenes";
import { getOnboardingState, saveOnboardingState } from "@/lib/onboarding";
import { patchCard, deleteCard } from "@/lib/storage";
import { SpeakButton } from "@/components/speak-button";
import { cn } from "@/lib/utils";

type CardItemProps = {
  card: Card;
  showDelete?: boolean;
  onToast: (toast: ToastState) => void;
};

export function CardItem({ card, showDelete = false, onToast }: CardItemProps) {
  const [localCard, setLocalCard] = useState(card);
  const sceneName = scenes.find((scene) => scene.id === card.scene)?.name ?? card.scene;

  useEffect(() => {
    setLocalCard(card);
  }, [card]);

  return (
    <article className="paper-panel rounded-[26px] p-5 md:p-6" data-card-id={localCard.id}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-warm px-3 py-1 text-xs text-accentStrong">{sceneName}</span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                localCard.masteryLevel >= 4 ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-soft"
              )}
            >
              熟练度 {localCard.masteryLevel}
            </span>
          </div>
          <h3 className="text-[1.22rem] font-semibold leading-8 tracking-[-0.01em]">{localCard.japanese}</h3>
          <p className="mt-1 text-sm leading-6 text-soft">{localCard.kana}</p>
          <p className="text-sm leading-6 text-soft">{localCard.romaji}</p>
        </div>
        <SpeakButton
          text={localCard.japanese}
          onUnsupported={() => onToast({ message: "当前浏览器不支持日语朗读。", tone: "error" })}
        />
      </div>

      <div className="paper-card mb-4 rounded-[20px] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-soft">中文释义</p>
        <p className="mt-2 text-[0.98rem] leading-7">{localCard.chinese}</p>
      </div>

      {localCard.notes ? <p className="paper-card mb-4 rounded-[18px] px-3 py-3 text-sm leading-6 text-soft">{localCard.notes}</p> : null}

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          data-action="favorite"
          onClick={() => {
            const nextFavorite = !localCard.isFavorite;
            setLocalCard((current) => ({ ...current, isFavorite: nextFavorite }));
            patchCard(localCard.id, (item) => ({ ...item, isFavorite: nextFavorite }));
            const onboarding = getOnboardingState();
            if (nextFavorite && (onboarding.stage === "welcome" || onboarding.stage === "scene-picked")) {
              saveOnboardingState({ ...onboarding, stage: "saved-first" });
            }
            onToast({ message: nextFavorite ? "已收藏到我的卡片。" : "已取消收藏。", tone: "success" });
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5",
            localCard.isFavorite ? "border-accent bg-accent/10 text-accentStrong shadow-sm" : "border-line bg-white/80 text-soft hover:border-accent/40"
          )}
          aria-pressed={localCard.isFavorite}
        >
          <HeartIcon className="h-4 w-4" />
          {localCard.isFavorite ? "已收藏" : "收藏"}
        </button>

        <button
          type="button"
          data-action="review"
          onClick={() => {
            const nextReview = !localCard.inReview;
            setLocalCard((current) => ({ ...current, inReview: nextReview }));
            patchCard(localCard.id, (item) => ({ ...item, inReview: nextReview }));
            onToast({ message: nextReview ? "已加入复习队列。" : "已移出今日复习。", tone: "success" });
          }}
          className={cn(
            "rounded-full border px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5",
            localCard.inReview ? "border-[rgba(92,139,111,0.28)] bg-[rgba(92,139,111,0.1)] text-[var(--success)] shadow-sm" : "border-line bg-white/80 text-soft hover:border-accent hover:text-accent"
          )}
          aria-pressed={localCard.inReview}
        >
          {localCard.inReview ? "复习中" : "加入复习"}
        </button>

        {showDelete ? (
          <button
            type="button"
            onClick={() => {
              deleteCard(localCard.id);
              onToast({ message: "卡片已删除。", tone: "success" });
            }}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600 transition hover:-translate-y-0.5"
          >
            <TrashIcon className="h-4 w-4" />
            删除
          </button>
        ) : null}
      </div>
    </article>
  );
}
