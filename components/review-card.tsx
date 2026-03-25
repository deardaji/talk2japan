"use client";

import { useEffect, useState } from "react";
import { Card, ToastState } from "@/lib/types";
import { SpeakButton } from "@/components/speak-button";

type ReviewCardProps = {
  card: Card;
  sceneName: string;
  onToast: (toast: ToastState) => void;
};

export function ReviewCard({ card, sceneName, onToast }: ReviewCardProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [card.id]);

  return (
    <button
      type="button"
      onClick={() => setFlipped((value) => !value)}
      className="relative h-[360px] w-full text-left [perspective:1200px]"
    >
      <div className={`review-flip relative h-full w-full ${flipped ? "is-flipped" : ""}`}>
        <div className="review-face paper-panel absolute inset-0 rounded-[32px] p-6 md:p-7">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="mb-3 text-sm text-soft">轻点翻面</p>
              <span className="rounded-full bg-warm px-3 py-1 text-xs text-accentStrong">{sceneName}</span>
            </div>
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.18em] text-soft">Front</p>
              <h2 className="text-[2rem] font-semibold leading-tight md:text-[2.15rem]">{card.chinese}</h2>
            </div>
            <p className="text-sm leading-6 text-soft">先在心里说一遍，再翻面确认答案。</p>
          </div>
        </div>

        <div className="review-face review-back paper-panel absolute inset-0 rounded-[32px] p-6 md:p-7">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="rounded-full bg-warm px-3 py-1 text-xs text-accentStrong">{sceneName}</span>
                <h2 className="mt-4 text-[1.7rem] font-semibold leading-9 md:text-[1.85rem]">{card.japanese}</h2>
                <p className="mt-2 text-sm leading-6 text-soft">{card.kana}</p>
                <p className="text-sm leading-6 text-soft">{card.romaji}</p>
              </div>
              <SpeakButton
                text={card.japanese}
                onUnsupported={() => onToast({ message: "当前浏览器暂不支持语音播放。", tone: "error" })}
              />
            </div>
            <div className="paper-card rounded-[24px] p-4">
              <p className="text-sm text-soft">中文</p>
              <p className="mt-1 text-base">{card.chinese}</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
