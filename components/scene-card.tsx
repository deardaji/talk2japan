import Link from "next/link";
import { Scene } from "@/lib/types";

type SceneCardProps = {
  scene: Scene;
  count: number;
};

export function SceneCard({ scene, count }: SceneCardProps) {
  return (
    <Link
      href={`/scenes/${scene.id}`}
      className="paper-panel group rounded-[26px] p-4 transition duration-200 hover:-translate-y-1 hover:border-accent/35 hover:shadow-soft md:p-5"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-warm text-lg font-semibold text-accentStrong shadow-sm">
          {scene.icon}
        </span>
        <span className="rounded-full bg-white/75 px-2.5 py-1 text-xs text-soft">{count} 句</span>
      </div>
      <h3 className="mb-1.5 text-[1.05rem] font-semibold leading-6">{scene.name}</h3>
      <p className="text-sm leading-6 text-soft">{scene.description}</p>
      <p className="mt-5 text-sm text-accentStrong transition group-hover:translate-x-1">进入场景 →</p>
    </Link>
  );
}
