import { Card } from "@/lib/types";

type MockCardSeed = Pick<Card, "japanese" | "kana" | "romaji" | "chinese">;

const knownMappings: Record<string, MockCardSeed> = {
  "请给我这个": {
    japanese: "これをお願いします。",
    kana: "これをおねがいします。",
    romaji: "Kore o onegaishimasu.",
    chinese: "请给我这个。"
  },
  "我想打包带走": {
    japanese: "持ち帰りでお願いします。",
    kana: "もちかえりでおねがいします。",
    romaji: "Mochikaeri de onegaishimasu.",
    chinese: "我想打包带走。"
  },
  "请问洗手间在哪里": {
    japanese: "トイレはどこですか。",
    kana: "といれはどこですか。",
    romaji: "Toire wa doko desu ka.",
    chinese: "请问洗手间在哪里？"
  },
  "我有预约": {
    japanese: "予約しています。",
    kana: "よやくしています。",
    romaji: "Yoyaku shiteimasu.",
    chinese: "我有预约。"
  }
};

export function generateJapaneseCard(chinese: string): MockCardSeed {
  const trimmed = chinese.trim();
  if (knownMappings[trimmed]) {
    return knownMappings[trimmed];
  }

  return {
    japanese: `「${trimmed}」を日本語にしたいです。`,
    kana: `「${trimmed}」をにほんごにしたいです。`,
    romaji: `"${trimmed}" o nihongo ni shitai desu.`,
    chinese: trimmed
  };
}
