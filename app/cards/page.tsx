"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CardItem } from "@/components/card-item";
import { SearchIcon } from "@/components/icons";
import { Toast } from "@/components/toast";
import { scenes } from "@/data/scenes";
import { useCards } from "@/lib/use-cards";
import { ToastState } from "@/lib/types";

export default function CardsPage() {
  const { cards } = useCards();
  const [query, setQuery] = useState("");
  const [sceneFilter, setSceneFilter] = useState("all");
  const [toast, setToast] = useState<ToastState | null>(null);

  const savedCards = useMemo(
    () => cards.filter((card) => card.sourceType === "user" || card.isFavorite),
    [cards]
  );

  const filteredCards = useMemo(() => {
    return savedCards.filter((card) => {
      const matchesScene = sceneFilter === "all" || card.scene === sceneFilter;
      const haystack = `${card.japanese} ${card.kana} ${card.romaji} ${card.chinese}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      return matchesScene && matchesQuery;
    });
  }, [query, savedCards, sceneFilter]);

  const userCards = filteredCards.filter((card) => card.sourceType === "user");
  const systemFavorites = filteredCards.filter((card) => card.sourceType === "system" && card.isFavorite);
  const reviewReadyCount = savedCards.filter((card) => card.inReview).length;
  const masteredCount = savedCards.filter((card) => card.masteryLevel >= 4).length;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-8 md:pt-8">
      <section className="paper-panel rounded-[32px] p-6 md:p-8">
        <Link href="/" className="text-sm text-soft transition hover:text-accent">
          ← 返回首页
        </Link>
        <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-soft">我的卡片</p>
            <h1 className="font-display text-4xl">我的随身词本</h1>
            <p className="mt-2 text-soft">把常用句、临时想学的话、旅途中真会说的话都留在这里，随时翻、随时听、随时复习。</p>
          </div>
          <Link href="/review" className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
            去今日复习
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] bg-white/72 px-4 py-4">
            <p className="text-sm text-soft">已保存</p>
            <p className="mt-2 text-3xl font-semibold">{savedCards.length}</p>
          </div>
          <div className="rounded-[24px] bg-white/72 px-4 py-4">
            <p className="text-sm text-soft">复习中</p>
            <p className="mt-2 text-3xl font-semibold">{reviewReadyCount}</p>
          </div>
          <div className="rounded-[24px] bg-white/72 px-4 py-4">
            <p className="text-sm text-soft">较熟悉</p>
            <p className="mt-2 text-3xl font-semibold">{masteredCount}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px]">
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索日语、中文、假名或罗马音"
              className="w-full rounded-2xl border border-line bg-white/75 py-3 pl-12 pr-4 outline-none focus:border-accent"
            />
          </label>

          <select
            value={sceneFilter}
            onChange={(event) => setSceneFilter(event.target.value)}
            className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none focus:border-accent"
          >
            <option value="all">全部场景</option>
            {scenes.map((scene) => (
              <option key={scene.id} value={scene.id}>
                {scene.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {filteredCards.length === 0 ? (
        <section className="paper-panel mt-6 rounded-[30px] p-8 text-center">
          <h2 className="text-2xl font-semibold">这本词本里还没有匹配内容</h2>
          <p className="mt-3 text-soft">试试换一个关键词，或者回首页添加一句你今天就想记住的表达。</p>
        </section>
      ) : (
        <section className="mt-6 space-y-8">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">我录入的句子</h2>
              <span className="text-sm text-soft">{userCards.length} 张</span>
            </div>
            {userCards.length === 0 ? (
              <div className="paper-panel rounded-[28px] p-6 text-soft">你还没有自己的句子。下一次想到“我到日本一定会说这句”，就把它先放进这本词本里。</div>
            ) : (
              <div className="space-y-4">
                {userCards.map((card) => (
                  <CardItem key={card.id} card={card} showDelete onToast={setToast} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">我收藏的系统句子</h2>
              <span className="text-sm text-soft">{systemFavorites.length} 张</span>
            </div>
            {systemFavorites.length === 0 ? (
              <div className="paper-panel rounded-[28px] p-6 text-soft">还没有收藏的场景句。去任意场景页挑几句你准备旅行时最可能会开口说的话吧。</div>
            ) : (
              <div className="space-y-4">
                {systemFavorites.map((card) => (
                  <CardItem key={card.id} card={card} onToast={setToast} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}
