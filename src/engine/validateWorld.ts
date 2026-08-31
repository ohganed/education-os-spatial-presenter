import type { KnowledgeCard, WorldManifest } from '../types/spatial'

export function validateWorld(
  world: WorldManifest,
  knowledge: Record<string, KnowledgeCard>,
): string[] {
  const issues: string[] = []

  if (!world.scenes[world.startSceneId]) {
    issues.push(`Missing start scene: ${world.startSceneId}`)
  }

  for (const scene of Object.values(world.scenes)) {
    if (!world.rooms[scene.roomId]) {
      issues.push(`Scene ${scene.id} references missing room ${scene.roomId}`)
    }

    for (const target of [scene.turnLeftSceneId, scene.turnRightSceneId]) {
      if (target && !world.scenes[target]) {
        issues.push(`Scene ${scene.id} references missing turn target ${target}`)
      }
    }

    for (const hotspot of scene.hotspots) {
      if (hotspot.targetSceneId && !world.scenes[hotspot.targetSceneId]) {
        issues.push(`Hotspot ${scene.id}/${hotspot.id} references missing scene ${hotspot.targetSceneId}`)
      }
      if (hotspot.knowledgeId && !knowledge[hotspot.knowledgeId]) {
        issues.push(`Hotspot ${scene.id}/${hotspot.id} references missing knowledge ${hotspot.knowledgeId}`)
      }
      if (hotspot.kind === 'navigation' && !hotspot.targetSceneId) {
        issues.push(`Navigation hotspot ${scene.id}/${hotspot.id} has no target scene`)
      }
    }
  }

  return issues
}
