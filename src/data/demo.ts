import type { KnowledgeCard, WorldManifest } from '../types/spatial'

export const knowledge: Record<string, KnowledgeCard> = {
  'newton-second-law': {
    id: 'newton-second-law',
    title: 'Newton’s Second Law',
    body: 'Force changes motion. In a simple model, the net force on an object equals mass × acceleration: F = ma.',
    teacherCue: 'ASK: If the same force acts on two masses, which accelerates more?'
  },
  'normal-force': {
    id: 'normal-force',
    title: 'Normal Force',
    body: 'The normal force is a contact force exerted perpendicular to a surface. It is not always equal to weight.',
    teacherCue: 'SHOW: Compare a horizontal desk with an inclined plane.'
  },
  'kitchen-energy': {
    id: 'kitchen-energy',
    title: 'Energy Transfer',
    body: 'A kitchen gives many concrete examples of energy transfer: heating, cooling, phase change, and mechanical work.',
    teacherCue: 'ASK: Where can students find three different energy transfers in this room?'
  }
}

export const world: WorldManifest = {
  id: 'japanese-house-v1',
  title: 'Memory Palace House',
  version: 'v1',
  startSceneId: 'entrance-a',
  rooms: {
    'entrance-hall-a': { id: 'entrance-hall-a', title: 'Entrance', lockedLocation: true },
    'study-room': { id: 'study-room', title: 'Study Room', lockedLocation: true },
    'kitchen': { id: 'kitchen', title: 'Kitchen', lockedLocation: true },
    'future-hall-b': { id: 'future-hall-b', title: 'Future Hall B', lockedLocation: false }
  },
  scenes: {
    'entrance-a': {
      id: 'entrance-a', roomId: 'entrance-hall-a', view: 'entrance', role: 'hub',
      title: 'Entrance', visualClass: 'scene-photo', asset: '/world-assets/entrance.webp',
      hotspots: [
        { id: 'door-study', label: 'Study Room', x: 10, y: 12, width: 18, height: 63, kind: 'navigation', targetSceneId: 'study-entry' },
        { id: 'door-kitchen', label: 'Kitchen', x: 30, y: 15, width: 15, height: 58, kind: 'navigation', targetSceneId: 'kitchen-entry' }
      ]
    },
    'study-entry': {
      id: 'study-entry', roomId: 'study-room', view: 'entry', role: 'explore',
      title: 'Study Room', visualClass: 'scene-photo', asset: '/world-assets/study-entry.webp',
      turnLeftSceneId: 'study-exit', turnRightSceneId: 'study-exit',
      hotspots: [
        // Fine-grained hotspots aligned to individual visible objects.
        // Shifted slightly left after visual calibration against the fixed 3:2 scene.
        { id: 'study-blue-book', label: 'Blue Book', x: 20.9, y: 54.0, width: 3.2, height: 7.2, kind: 'knowledge', knowledgeId: 'newton-second-law' },
        { id: 'study-desk-book', label: 'Open Book', x: 49.4, y: 48.6, width: 7.0, height: 4.8, kind: 'knowledge', knowledgeId: 'normal-force' },
        { id: 'study-teddy', label: 'Teddy Bear', x: 85.7, y: 51.4, width: 4.6, height: 8.3, kind: 'empty' }
      ]
    },
    'study-exit': {
      id: 'study-exit', roomId: 'study-room', view: 'exit', role: 'exit',
      title: 'Study Room', visualClass: 'scene-photo', asset: '/world-assets/study-exit.webp',
      turnLeftSceneId: 'study-entry', turnRightSceneId: 'study-entry',
      hotspots: [
        { id: 'study-door-out', label: 'Entranceへ戻る', x: 29, y: 7, width: 23, height: 66, kind: 'navigation', targetSceneId: 'entrance-a' }
      ]
    },
    'kitchen-entry': {
      id: 'kitchen-entry', roomId: 'kitchen', view: 'entry', role: 'explore',
      title: 'Kitchen', visualClass: 'scene-photo', asset: '/world-assets/kitchen-entry.webp',
      turnLeftSceneId: 'kitchen-exit', turnRightSceneId: 'kitchen-exit',
      hotspots: [
        { id: 'kitchen-stove', label: 'Stove', x: 65, y: 30, width: 20, height: 38, kind: 'knowledge', knowledgeId: 'kitchen-energy' },
        { id: 'kitchen-table-book', label: 'Book on Table', x: 50, y: 52, width: 18, height: 14, kind: 'knowledge', knowledgeId: 'normal-force' }
      ]
    },
    'kitchen-exit': {
      id: 'kitchen-exit', roomId: 'kitchen', view: 'exit', role: 'exit',
      title: 'Kitchen', visualClass: 'scene-photo', asset: '/world-assets/kitchen-exit.webp',
      turnLeftSceneId: 'kitchen-entry', turnRightSceneId: 'kitchen-entry',
      hotspots: [
        { id: 'kitchen-door-out', label: 'Entranceへ戻る', x: 32, y: 6, width: 27, height: 68, kind: 'navigation', targetSceneId: 'entrance-a' }
      ]
    },
    'future-hall-b': {
      id: 'future-hall-b', roomId: 'future-hall-b', view: 'transit', role: 'transit',
      title: 'Future Hall B', visualClass: 'scene-photo', hotspots: []
    }
  }
}
