import { Card, ReviewResult } from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;

export function applyReviewResult(card: Card, result: ReviewResult): Card {
  const now = Date.now();

  if (result === "again") {
    return {
      ...card,
      masteryLevel: Math.max(0, card.masteryLevel - 1),
      difficulty: Math.min(5, card.difficulty + 1),
      reviewCount: card.reviewCount + 1,
      nextReviewAt: new Date(now + 8 * 60 * 60 * 1000).toISOString()
    };
  }

  if (result === "hard") {
    const intervalDays = Math.max(1, Math.min(3, card.masteryLevel + 1));
    return {
      ...card,
      masteryLevel: Math.min(6, card.masteryLevel + 1),
      difficulty: Math.min(5, Math.max(1, card.difficulty)),
      reviewCount: card.reviewCount + 1,
      nextReviewAt: new Date(now + intervalDays * DAY).toISOString()
    };
  }

  const intervalDays = Math.min(14, Math.max(2, 2 ** Math.max(1, card.masteryLevel)));
  return {
    ...card,
    masteryLevel: Math.min(8, card.masteryLevel + 2),
    difficulty: Math.max(1, card.difficulty - 1),
    reviewCount: card.reviewCount + 1,
    nextReviewAt: new Date(now + intervalDays * DAY).toISOString()
  };
}

export function isDueToday(card: Card) {
  return card.inReview && new Date(card.nextReviewAt).getTime() <= Date.now();
}
