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
  },
  'living-overview': {
    id: 'living-overview',
    title: 'The Big Picture',
    body: 'The living room is the overview space of the Memory Palace: a place to connect individual ideas into one larger structure.',
    teacherCue: 'CONNECT: Return here when students need to see how the current idea fits the whole topic.'
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
    'living-room': { id: 'living-room', title: 'Living Room', lockedLocation: true },
    'future-hall-b': { id: 'future-hall-b', title: 'Future Hall B', lockedLocation: false }
  },
  scenes: {
    'entrance-a': {
      id: 'entrance-a', roomId: 'entrance-hall-a', view: 'entrance', role: 'hub',
      title: 'Entrance', visualClass: 'scene-photo', asset: '/world-assets/entrance.webp',
      objectMapAsset: '/world-assets/object-maps/entrance.json',
      hotspots: [
        { id: 'door-study', label: 'Study Room', x: 10, y: 12, width: 18, height: 63, kind: 'navigation', targetSceneId: 'study-entry' },
        { id: 'door-kitchen', label: 'Kitchen', x: 30, y: 15, width: 15, height: 58, kind: 'navigation', targetSceneId: 'kitchen-entry' },
        { id: 'door-living', label: 'Living Room', x: 62, y: 15, width: 14, height: 58, kind: 'navigation', targetSceneId: 'living-entry' }
      ]
    },
    'study-entry': {
      id: 'study-entry', roomId: 'study-room', view: 'entry', role: 'explore',
      title: 'Study Room', visualClass: 'scene-photo', asset: '/world-assets/study-entry.webp',
      objectMapAsset: '/world-assets/object-maps/study-entry.json',
      turnLeftSceneId: 'study-exit', turnRightSceneId: 'study-exit',
      hotspots: [
        {
          id: 'study-blue-book', label: 'Blue Book', x: 20.9, y: 54.0, width: 3.2, height: 7.2,
          kind: 'knowledge', knowledgeId: 'newton-second-law',
          points: [[21.1,54.2],[23.1,54.0],[24.0,55.0],[23.8,60.7],[22.9,61.2],[21.4,60.5],[20.9,58.1]],
          objectRef: 'book-blue'
        },
        {
          id: 'study-desk-book', label: 'Open Book', x: 49.4, y: 48.6, width: 7.0, height: 4.8,
          kind: 'knowledge', knowledgeId: 'normal-force',
          points: [[49.4,50.2],[51.0,48.8],[53.0,49.1],[54.7,48.8],[56.2,50.1],[55.7,52.5],[53.1,52.2],[51.2,52.6]],
          objectRef: 'book-open'
        },
        {
          id: 'study-teddy', label: 'Teddy Bear', x: 85.7, y: 51.4, width: 4.6, height: 8.3,
          kind: 'empty',
          points: [[87.0,51.5],[88.2,52.0],[89.1,53.6],[89.0,55.0],[90.0,56.1],[89.5,58.5],[88.3,59.6],[86.7,59.1],[85.9,57.5],[86.2,55.5],[85.7,54.1]],
          objectRef: 'teddy-bear'
        }
      ]
    },
    'study-exit': {
      id: 'study-exit', roomId: 'study-room', view: 'exit', role: 'exit',
      title: 'Study Room', visualClass: 'scene-photo', asset: '/world-assets/study-exit.webp',
      objectMapAsset: '/world-assets/object-maps/study-exit.json',
      turnLeftSceneId: 'study-entry', turnRightSceneId: 'study-entry',
      hotspots: [
        { id: 'study-door-out', label: 'Entranceへ戻る', x: 29, y: 7, width: 23, height: 66, kind: 'navigation', targetSceneId: 'entrance-a' }
      ]
    },
    'kitchen-entry': {
      id: 'kitchen-entry', roomId: 'kitchen', view: 'entry', role: 'explore',
      title: 'Kitchen', visualClass: 'scene-photo', asset: '/world-assets/kitchen-entry.webp',
      objectMapAsset: '/world-assets/object-maps/kitchen-entry.json',
      turnLeftSceneId: 'kitchen-exit', turnRightSceneId: 'kitchen-exit',
      hotspots: [
        {
          id: 'kitchen-stove', label: 'Stove', x: 65, y: 30, width: 20, height: 38,
          kind: 'knowledge', knowledgeId: 'kitchen-energy',
          points: [[66,35],[81,34],[84,40],[84,62],[81,67],[68,67],[65,60],[65,42]],
          objectRef: 'stove'
        },
        {
          id: 'kitchen-table-book', label: 'Book on Table', x: 50, y: 52, width: 18, height: 14,
          kind: 'knowledge', knowledgeId: 'normal-force',
          points: [[51,55],[56,52.5],[63,53],[67,57],[64,62],[57,62],[52,60]],
          objectRef: 'book-table'
        }
      ]
    },
    'kitchen-exit': {
      id: 'kitchen-exit', roomId: 'kitchen', view: 'exit', role: 'exit',
      title: 'Kitchen', visualClass: 'scene-photo', asset: '/world-assets/kitchen-exit.webp',
      objectMapAsset: '/world-assets/object-maps/kitchen-exit.json',
      turnLeftSceneId: 'kitchen-entry', turnRightSceneId: 'kitchen-entry',
      hotspots: [
        { id: 'kitchen-door-out', label: 'Entranceへ戻る', x: 32, y: 6, width: 27, height: 68, kind: 'navigation', targetSceneId: 'entrance-a' }
      ]
    },
    'living-entry': {
      id: 'living-entry', roomId: 'living-room', view: 'entry', role: 'explore',
      title: 'Living Room', visualClass: 'scene-photo', asset: '/world-assets/living-entry.webp',
      objectMapAsset: '/world-assets/object-maps/living-entry.json',
      turnLeftSceneId: 'living-exit', turnRightSceneId: 'living-exit',
      hotspots: [
        { id: 'living-coffee-table', label: 'Overview Table', x: 36, y: 55, width: 28, height: 22, kind: 'knowledge', knowledgeId: 'living-overview' },
        { id: 'living-bookshelf', label: 'Living Room Books', x: 73, y: 12, width: 15, height: 48, kind: 'knowledge', knowledgeId: 'living-overview' }
      ]
    },
    'living-exit': {
      id: 'living-exit', roomId: 'living-room', view: 'exit', role: 'exit',
      title: 'Living Room', visualClass: 'scene-photo', asset: '/world-assets/living-exit.webp',
      objectMapAsset: '/world-assets/object-maps/living-exit.json',
      turnLeftSceneId: 'living-entry', turnRightSceneId: 'living-entry',
      hotspots: [
        { id: 'living-door-out', label: 'Entranceへ戻る', x: 30, y: 7, width: 25, height: 64, kind: 'navigation', targetSceneId: 'entrance-a' }
      ]
    },
    'future-hall-b': {
      id: 'future-hall-b', roomId: 'future-hall-b', view: 'transit', role: 'transit',
      title: 'Future Hall B', visualClass: 'scene-photo', hotspots: []
    }
  }
}
