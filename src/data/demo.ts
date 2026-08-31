import type { Direction, KnowledgeCard, Scene } from '../types/spatial'

export const directions: Direction[] = ['north', 'east', 'south']

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
  'retrieval-question': {
    id: 'retrieval-question',
    title: 'Retrieval Check',
    body: 'Without looking at notes: where in this room did we place Newton’s Second Law?',
    teacherCue: 'WAIT: Give students several seconds to reconstruct the location.'
  }
}

export const scenes: Record<Direction, Scene> = {
  north: {
    id: 'japanese-house-bedroom-north',
    roomId: 'bedroom',
    direction: 'north',
    title: 'Bedroom · North',
    visualClass: 'scene-north',
    hotspots: [
      { id: 'blue-book', label: 'Blue Book', x: 18, y: 29, width: 18, height: 34, kind: 'knowledge', knowledgeId: 'newton-second-law' },
      { id: 'clock', label: 'Clock', x: 71, y: 16, width: 12, height: 18, kind: 'empty' }
    ]
  },
  east: {
    id: 'japanese-house-bedroom-east',
    roomId: 'bedroom',
    direction: 'east',
    title: 'Bedroom · East',
    visualClass: 'scene-east',
    hotspots: [
      { id: 'desk-book', label: 'Book on Desk', x: 56, y: 57, width: 22, height: 16, kind: 'knowledge', knowledgeId: 'normal-force' },
      { id: 'snack-bag', label: 'Opened Snack Bag', x: 21, y: 69, width: 17, height: 16, kind: 'empty' }
    ]
  },
  south: {
    id: 'japanese-house-bedroom-south',
    roomId: 'bedroom',
    direction: 'south',
    title: 'Bedroom · South',
    visualClass: 'scene-south',
    hotspots: [
      { id: 'stuffed-toy', label: 'Stuffed Toy', x: 62, y: 43, width: 18, height: 26, kind: 'question', knowledgeId: 'retrieval-question' },
      { id: 'slippers', label: 'Slippers', x: 30, y: 77, width: 20, height: 12, kind: 'empty' }
    ]
  }
}
