let activeUtterance: SpeechSynthesisUtterance | null = null;

function getVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

function getJapaneseVoice() {
  const voices = getVoices();
  return voices.find((voice) => voice.lang.toLowerCase().startsWith("ja")) ?? null;
}

export function canUseSpeech() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getSpeechSupport() {
  if (!canUseSpeech()) {
    return {
      supported: false,
      reason: "unsupported" as const
    };
  }

  const voices = getVoices();
  const japaneseVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("ja"));

  if (voices.length === 0) {
    return {
      supported: false,
      reason: "no-voices" as const
    };
  }

  if (!japaneseVoice) {
    return {
      supported: false,
      reason: "no-japanese-voice" as const
    };
  }

  return {
    supported: true,
    reason: "ready" as const
  };
}

export function speakJapanese(
  text: string,
  options?: {
    slow?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
  }
) {
  if (!canUseSpeech()) {
    return false;
  }

  const support = getSpeechSupport();
  if (!support.supported) {
    return false;
  }

  if (activeUtterance) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getJapaneseVoice();
  utterance.lang = "ja-JP";
  utterance.rate = options?.slow ? 0.82 : 1;
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => {
    activeUtterance = utterance;
    options?.onStart?.();
  };
  utterance.onend = () => {
    activeUtterance = null;
    options?.onEnd?.();
  };
  utterance.onerror = () => {
    activeUtterance = null;
    options?.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}
