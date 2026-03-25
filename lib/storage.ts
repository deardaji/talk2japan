"use client";

import { systemCards } from "@/data/scenes";
import { Card } from "@/lib/types";
import { isDueToday } from "@/lib/srs";

const STORAGE_KEY = "talk2japan.cards.v1";
const EVENT_NAME = "talk2japan:cards-updated";

function sortCards(cards: Card[]) {
  return [...cards].sort((a, b) => {
    const favoriteDelta = Number(b.isFavorite) - Number(a.isFavorite);
    if (favoriteDelta !== 0) {
      return favoriteDelta;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getStoredCards() {
  if (typeof window === "undefined") {
    return systemCards;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(systemCards));
    return systemCards;
  }

  try {
    const parsed = JSON.parse(raw) as Card[];
    return sortCards(parsed);
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(systemCards));
    return systemCards;
  }
}

export function saveCards(cards: Card[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribeCards(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(EVENT_NAME, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT_NAME, listener);
    window.removeEventListener("storage", listener);
  };
}

export function upsertCard(card: Card) {
  const cards = getStoredCards();
  const next = [card, ...cards.filter((item) => item.id !== card.id)];
  saveCards(sortCards(next));
}

export function patchCard(cardId: string, updater: (card: Card) => Card) {
  const cards = getStoredCards();
  const next = cards.map((card) => (card.id === cardId ? updater(card) : card));
  saveCards(sortCards(next));
}

export function deleteCard(cardId: string) {
  const cards = getStoredCards().filter((card) => card.id !== cardId);
  saveCards(sortCards(cards));
}

export function getReviewQueue() {
  return getStoredCards().filter(isDueToday);
}
