import { useMemo, useState } from 'react'
import { directions, knowledge, scenes } from './data/demo'
import type { Direction, Hotspot } from './types/spatial'

export default function App() {
  const [direction, setDirection] = useState<Direction>('north')
  const [studentGuide, setStudentGuide] = useState(false)
  const [teacherGuide, setTeacherGuide] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)

  const scene = scenes[direction]
  const selectedKnowledge = selectedHotspot?.knowledgeId ? knowledge[selectedHotspot.knowledgeId] : null

  const directionIndex = directions.indexOf(direction)
  const turn = (delta: number) => {
    const next = directions[(directionIndex + delta + directions.length) % directions.length]
    setDirection(next)
    setSelectedHotspot(null)
  }

  const knowledgeHotspots = useMemo(
    () => scene.hotspots.filter((hotspot) => hotspot.knowledgeId),
    [scene],
  )

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">JAPANESE HOUSE · v1 · WORLD LOCK DEMO</p>
          <h1>{scene.title}</h1>
        </div>
        <div className="guide-controls">
          <button className={studentGuide ? 'active' : ''} onClick={() => setStudentGuide((v) => !v)}>
            生徒カンペ
          </button>
          <button className={teacherGuide ? 'active teacher' : 'teacher'} onClick={() => setTeacherGuide((v) => !v)}>
            先生カンペ
          </button>
        </div>
      </header>

      <section className={`scene ${scene.visualClass}`} aria-label={scene.title}>
        <div className="room-art" aria-hidden="true">
          <div className="window" />
          <div className="shelf"><span /><span /><span /><span /><span /></div>
          <div className="desk"><div className="desk-book" /></div>
          <div className="bed" />
          <div className="rug" />
          <div className="toy" />
        </div>

        {scene.hotspots.map((hotspot) => {
          const visible = studentGuide && Boolean(hotspot.knowledgeId)
          return (
            <button
              key={hotspot.id}
              className={`hotspot ${visible ? 'student-visible' : ''}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, width: `${hotspot.width}%`, height: `${hotspot.height}%` }}
              onClick={() => setSelectedHotspot(hotspot)}
              aria-label={hotspot.label}
            >
              {visible && <span>{hotspot.label}</span>}
            </button>
          )
        })}

        {teacherGuide && (
          <aside className="teacher-overlay">
            <strong>TEACHER GUIDE</strong>
            <span>Current: {scene.title}</span>
            <span>Knowledge spots: {knowledgeHotspots.map((h) => h.label).join(' / ') || 'none'}</span>
            <span>NEXT: tap a known object or turn the view.</span>
          </aside>
        )}

        <nav className="turn-controls" aria-label="View direction controls">
          <button onClick={() => turn(-1)}>← 左を見る</button>
          <div className="direction-indicator">{direction.toUpperCase()}</div>
          <button onClick={() => turn(1)}>右を見る →</button>
        </nav>
      </section>

      <footer className="statusbar">
        <span>WORLD: Japanese House v1</span>
        <span>ROOM: Bedroom</span>
        <span>VIEW: {direction.toUpperCase()}</span>
      </footer>

      {selectedHotspot && (
        <div className="modal-backdrop" onClick={() => setSelectedHotspot(null)}>
          <article className="knowledge-card" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setSelectedHotspot(null)}>×</button>
            {selectedKnowledge ? (
              <>
                <p className="eyebrow">{selectedHotspot.kind.toUpperCase()}</p>
                <h2>{selectedKnowledge.title}</h2>
                <p>{selectedKnowledge.body}</p>
                {teacherGuide && selectedKnowledge.teacherCue && (
                  <div className="teacher-cue">{selectedKnowledge.teacherCue}</div>
                )}
              </>
            ) : (
              <>
                <p className="eyebrow">EXPLORATION</p>
                <h2>{selectedHotspot.label}</h2>
                <p>Nothing is stored here. Not every interesting object should reveal knowledge.</p>
              </>
            )}
            <button className="return-button" onClick={() => setSelectedHotspot(null)}>同じ場所へ戻る</button>
          </article>
        </div>
      )}
    </main>
  )
}
