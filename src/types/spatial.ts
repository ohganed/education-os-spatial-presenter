export type ViewKey = 'entrance' | 'entry' | 'exit' | 'north' | 'east' | 'south' | 'west' | 'transit'

export type SceneRole = 'hub' | 'explore' | 'exit' | 'transit'

export type HotspotKind = 'knowledge' | 'question' | 'navigation' | 'empty'

export interface KnowledgeCard {
  id: string
  title: string
  body: string
  teacherCue?: string
}

export interface Hotspot {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  kind: HotspotKind
  knowledgeId?: string
  targetSceneId?: string
}

export interface Scene {
  id: string
  roomId: string
  view: ViewKey
  role: SceneRole
  title: string
  asset?: string
  visualClass: string
  hotspots: Hotspot[]
  turnLeftSceneId?: string
  turnRightSceneId?: string
}

export interface RoomDefinition {
  id: string
  title: string
  lockedLocation?: boolean
}

export interface WorldManifest {
  id: string
  title: string
  version: string
  startSceneId: string
  rooms: Record<string, RoomDefinition>
  scenes: Record<string, Scene>
}
