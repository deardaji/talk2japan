export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatRelativeSceneLabel(sceneName: string) {
  return `${sceneName}场景`;
}

export function formatDateLabel(dateValue: string) {
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
