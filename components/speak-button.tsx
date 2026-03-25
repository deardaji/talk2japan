"use client";

import { useEffect, useState } from "react";
import { SpeakerIcon } from "@/components/icons";
import { getSpeechSupport, speakJapanese } from "@/lib/tts";
import { cn } from "@/lib/utils";

type SpeakButtonProps = {
  text: string;
  onUnsupported?: () => void;
  compact?: boolean;
};

export function SpeakButton({ text, onUnsupported, compact = false }: SpeakButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supportState, setSupportState] = useState(() => getSpeechSupport());

  useEffect(() => {
    const syncSupport = () => setSupportState(getSpeechSupport());

    syncSupport();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.addEventListener("voiceschanged", syncSupport);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", syncSupport);
    };
  }, []);

  const handleSpeak = () => {
    const played = speakJapanese(text, {
      slow: true,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false)
    });

    if (!played) {
      onUnsupported?.();
    }
  };

  const supportLabel =
    supportState.reason === "no-voices"
      ? "无可用语音"
      : supportState.reason === "no-japanese-voice"
        ? "无日语语音"
        : supportState.reason === "unsupported"
          ? "不支持朗读"
          : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSpeak}
        disabled={!supportState.supported}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full border border-line bg-white/82 text-ink transition hover:-translate-y-0.5 hover:border-accent/50 hover:bg-white hover:text-accent disabled:cursor-not-allowed disabled:border-line/70 disabled:bg-white/60 disabled:text-soft disabled:hover:translate-y-0 disabled:hover:border-line/70 disabled:hover:text-soft",
          compact ? "h-10 w-10" : "h-11 w-11"
        )}
        aria-label="播放发音"
        aria-disabled={!supportState.supported}
        title={supportLabel ?? "播放发音"}
      >
        {isPlaying ? <span className="absolute inset-0 rounded-full border border-accent animate-pulseRing" /> : null}
        <SpeakerIcon className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </button>
      {supportLabel ? <span className="text-[11px] text-soft">{supportLabel}</span> : null}
    </div>
  );
}
