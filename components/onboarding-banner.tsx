"use client";

type OnboardingBannerProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
};

export function OnboardingBanner({
  title,
  description,
  actionLabel,
  onAction,
  onDismiss
}: OnboardingBannerProps) {
  return (
    <div className="paper-panel rounded-[24px] p-4 md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-2 text-sm leading-6 text-soft">{description}</p>
        </div>
        <button type="button" onClick={onDismiss} className="rounded-full border border-line px-3 py-1 text-sm text-soft">
          关闭
        </button>
      </div>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
