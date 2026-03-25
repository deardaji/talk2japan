"use client";

import { useEffect, useState } from "react";
import { getOnboardingState, subscribeOnboarding, type OnboardingState } from "@/lib/onboarding";

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({ stage: "completed" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setState(getOnboardingState());
      setReady(true);
    };

    sync();
    return subscribeOnboarding(sync);
  }, []);

  return { onboarding: state, ready };
}
