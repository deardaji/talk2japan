export type Scene = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export type SourceType = "system" | "user";

export type ReviewResult = "easy" | "hard" | "again";

export type Card = {
  id: string;
  japanese: string;
  kana: string;
  romaji: string;
  chinese: string;
  scene: string;
  difficulty: number;
  sourceType: SourceType;
  isFavorite: boolean;
  masteryLevel: number;
  reviewCount: number;
  nextReviewAt: string;
  createdAt: string;
  notes?: string;
  inReview: boolean;
};

export type ToastState = {
  message: string;
  tone?: "default" | "success" | "error";
};
