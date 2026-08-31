export type Direction = 'north' | 'east' | 'south'

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
}

export interface Scene {
  id: string
  roomId: string
  direction: Direction
  title: string
  asset?: string
  visualClass: string
  hotspots: Hotspot[]
}
