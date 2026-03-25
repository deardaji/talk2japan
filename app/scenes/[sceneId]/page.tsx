import { SceneDetailPage } from "@/app/scenes/[sceneId]/scene-detail-page";

export default async function ScenePage({
  params
}: {
  params: Promise<{ sceneId: string }>;
}) {
  const { sceneId } = await params;
  return <SceneDetailPage sceneId={sceneId} />;
}
