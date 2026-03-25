"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { scenes } from "@/data/scenes";
import { generateJapaneseCard } from "@/lib/mock-generator";
import { getOnboardingState, saveOnboardingState } from "@/lib/onboarding";
import { Card, ToastState } from "@/lib/types";
import { upsertCard } from "@/lib/storage";

type AddCardModalProps = {
  open: boolean;
  defaultScene?: string;
  onClose: () => void;
  onToast: (toast: ToastState) => void;
};

export function AddCardModal({ open, defaultScene, onClose, onToast }: AddCardModalProps) {
  const [chinese, setChinese] = useState("");
  const [japanese, setJapanese] = useState("");
  const [scene, setScene] = useState(defaultScene ?? scenes[0].id);
  const [notes, setNotes] = useState("");

  const canSubmit = useMemo(() => chinese.trim() || japanese.trim(), [chinese, japanese]);
  const preview = useMemo(() => {
    if (!chinese.trim()) {
      return null;
    }
    return generateJapaneseCard(chinese.trim());
  }, [chinese]);

  useEffect(() => {
    if (open) {
      setScene(defaultScene ?? scenes[0].id);
    }
  }, [defaultScene, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const generated = chinese.trim()
      ? generateJapaneseCard(chinese.trim())
      : {
          japanese: japanese.trim(),
          kana: japanese.trim(),
          romaji: "Romaji 待补充",
          chinese: chinese.trim() || "自定义日语卡片"
        };

    const card: Card = {
      id: `user-${Date.now()}`,
      japanese: japanese.trim() || generated.japanese,
      kana: generated.kana,
      romaji: generated.romaji,
      chinese: chinese.trim() || generated.chinese,
      scene,
      difficulty: 2,
      sourceType: "user",
      isFavorite: true,
      masteryLevel: 0,
      reviewCount: 0,
      nextReviewAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: notes.trim(),
      inReview: true
    };

    upsertCard(card);
    const onboarding = getOnboardingState();
    if (onboarding.stage === "welcome" || onboarding.stage === "scene-picked") {
      saveOnboardingState({ ...onboarding, stage: "saved-first", selectedScene: scene });
    }
    onToast({ message: "已加入我的卡片，今天就能开始复习。", tone: "success" });
    setChinese("");
    setJapanese("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/30 px-3 py-4 backdrop-blur-sm md:items-center md:justify-center">
      <div className="paper-panel w-full max-w-xl rounded-[28px] p-5 animate-rise">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-soft">添加新句子</p>
            <h2 className="font-display text-2xl">保存一条今天想学的话</h2>
            <p className="mt-2 text-sm text-soft">保存后会自动进入“我的卡片”，并默认加入今日复习。</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-line px-3 py-1 text-sm text-soft">
            关闭
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm text-soft" id="add-card-chinese-label">中文句子</span>
            <textarea
              id="add-card-chinese"
              aria-labelledby="add-card-chinese-label"
              value={chinese}
              onChange={(event) => setChinese(event.target.value)}
              placeholder="比如：请问洗手间在哪里"
              className="min-h-24 w-full rounded-2xl border border-line bg-white/70 px-4 py-3 outline-none ring-0 placeholder:text-soft/70 focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-soft" id="add-card-japanese-label">或直接输入日语</span>
            <input
              id="add-card-japanese"
              aria-labelledby="add-card-japanese-label"
              value={japanese}
              onChange={(event) => setJapanese(event.target.value)}
              placeholder="比如：すみません、写真を撮ってもいいですか。"
              className="w-full rounded-2xl border border-line bg-white/70 px-4 py-3 outline-none placeholder:text-soft/70 focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-soft" id="add-card-scene-label">场景</span>
            <select
              id="add-card-scene"
              aria-labelledby="add-card-scene-label"
              value={scene}
              onChange={(event) => setScene(event.target.value)}
              className="w-full rounded-2xl border border-line bg-white/70 px-4 py-3 outline-none focus:border-accent"
            >
              {scenes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          {preview ? (
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-sm text-soft">预览生成结果</p>
              <p className="mt-2 text-lg font-semibold">{preview.japanese}</p>
              <p className="text-sm text-soft">{preview.kana}</p>
              <p className="text-sm text-soft">{preview.romaji}</p>
            </div>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-sm text-soft" id="add-card-notes-label">备注</span>
            <input
              id="add-card-notes"
              aria-labelledby="add-card-notes-label"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="可选，例如：下个月东京旅行会用到"
              className="w-full rounded-2xl border border-line bg-white/70 px-4 py-3 outline-none placeholder:text-soft/70 focus:border-accent"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-accent px-4 py-3 font-medium text-white transition hover:bg-accentStrong disabled:cursor-not-allowed disabled:opacity-50"
          >
            生成并保存
          </button>
        </form>
      </div>
    </div>
  );
}
