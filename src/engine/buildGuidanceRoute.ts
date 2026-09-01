import type { WorldManifest } from '../types/spatial'

export type GuidanceRouteStep = {
  sceneId: string
  hotspotId: string
  kind: 'navigation' | 'target'
}

/**
 * Build a deterministic route from the current scene to one target object.
 * Navigation is derived from the world's existing navigation hotspots, so the
 * presenter remains independent from any presentation application.
 */
export function buildGuidanceRoute(
  world: WorldManifest,
  fromSceneId: string,
  targetSceneId: string,
  targetHotspotId: string
): GuidanceRouteStep[] {
  if (!world.scenes[fromSceneId] || !world.scenes[targetSceneId]) return []

  if (fromSceneId === targetSceneId) {
    return [{ sceneId: targetSceneId, hotspotId: targetHotspotId, kind: 'target' }]
  }

  const queue: Array<{ sceneId: string; path: GuidanceRouteStep[] }> = [
    { sceneId: fromSceneId, path: [] }
  ]
  const visited = new Set<string>([fromSceneId])

  while (queue.length > 0) {
    const current = queue.shift()!
    const scene = world.scenes[current.sceneId]

    for (const hotspot of scene.hotspots) {
      if (hotspot.kind !== 'navigation' || !hotspot.targetSceneId) continue
      if (!world.scenes[hotspot.targetSceneId]) continue

      const nextPath: GuidanceRouteStep[] = [
        ...current.path,
        { sceneId: current.sceneId, hotspotId: hotspot.id, kind: 'navigation' }
      ]

      if (hotspot.targetSceneId === targetSceneId) {
        return [
          ...nextPath,
          { sceneId: targetSceneId, hotspotId: targetHotspotId, kind: 'target' }
        ]
      }

      if (!visited.has(hotspot.targetSceneId)) {
        visited.add(hotspot.targetSceneId)
        queue.push({ sceneId: hotspot.targetSceneId, path: nextPath })
      }
    }
  }

  return []
}
