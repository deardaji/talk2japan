"use client";

import { useEffect, useState } from "react";
import { Card } from "@/lib/types";
import { getStoredCards, subscribeCards } from "@/lib/storage";

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setCards(getStoredCards());
      setReady(true);
    };

    sync();
    return subscribeCards(sync);
  }, []);

  return { cards, ready };
}
