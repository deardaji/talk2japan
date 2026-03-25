"use client";

import Link from "next/link";
import { scenes } from "@/data/scenes";
import { saveOnboardingState } from "@/lib/onboarding";

export function OnboardingHome() {
  const recommendedScenes = scenes.slice(0, 3);

  return (
    <div className="paper-panel fixed right-4 top-4 z-40 w-[min(360px,calc(100vw-2rem))] rounded-[28px] p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-soft">第一次来，先这样开始</p>
          <h2 className="mt-1 text-2xl font-semibold">20 秒进入状态</h2>
        </div>
        <button
          type="button"
          onClick={() => saveOnboardingState({ stage: "dismissed" })}
          className="rounded-full border border-line px-3 py-1 text-sm text-soft"
        >
          跳过
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="paper-card rounded-[22px] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-soft">Step 1</p>
          <p className="mt-2 text-sm leading-6">先挑一个场景，不用想太多，选你最近最可能会用到的。</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {recommendedScenes.map((scene) => (
              <Link
                key={scene.id}
                href={`/scenes/${scene.id}`}
                onClick={() => saveOnboardingState({ stage: "scene-picked", selectedScene: scene.id })}
                className="rounded-full border border-line bg-white/80 px-3 py-2 text-sm text-soft transition hover:border-accent hover:text-accent"
              >
                {scene.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="paper-card rounded-[22px] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-soft">Step 2</p>
          <p className="mt-2 text-sm leading-6">到场景页后，先收藏一句你今天最可能会说的话。想继续的话，再顺手刷一张复习卡。</p>
        </div>
      </div>
    </div>
  );
}
