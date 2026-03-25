"use client";

export type OnboardingStage = "welcome" | "scene-picked" | "saved-first" | "completed" | "dismissed";

export type OnboardingState = {
  stage: OnboardingStage;
  selectedScene?: string;
};

const STORAGE_KEY = "talk2japan.onboarding.v1";
const EVENT_NAME = "talk2japan:onboarding-updated";

function isAutomationEnv() {
  return typeof navigator !== "undefined" && navigator.webdriver;
}

export function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined" || isAutomationEnv()) {
    return { stage: "completed" };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { stage: "welcome" };
  }

  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return { stage: "welcome" };
  }
}

export function saveOnboardingState(state: OnboardingState) {
  if (typeof window === "undefined" || isAutomationEnv()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function updateOnboardingState(next: Partial<OnboardingState>) {
  const current = getOnboardingState();
  saveOnboardingState({ ...current, ...next });
}

export function subscribeOnboarding(listener: () => void) {
  if (typeof window === "undefined" || isAutomationEnv()) {
    return () => undefined;
  }

  window.addEventListener(EVENT_NAME, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT_NAME, listener);
    window.removeEventListener("storage", listener);
  };
}
