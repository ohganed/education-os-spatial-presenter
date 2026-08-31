import { useMemo, useState } from 'react'
import { knowledge, world } from './data/demo'
import { validateWorld } from './engine/validateWorld'
import type { Hotspot } from './types/spatial'

export default function App() {
  const [currentSceneId, setCurrentSceneId] = useState(world.startSceneId)
  const [studentGuide, setStudentGuide] = useState(false)
  const [teacherGuide, setTeacherGuide] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)

  const worldIssues = useMemo(() => validateWorld(world, knowledge), [])
  const scene = world.scenes[currentSceneId]
  const room = world.rooms[scene.roomId]
  const selectedKnowledge = selectedHotspot?.knowledgeId ? knowledge[selectedHotspot.knowledgeId] : null

  const knowledgeHotspots = useMemo(
    () => scene.hotspots.filter((hotspot) => hotspot.knowledgeId),
    [scene],
  )

  const navigationHotspots = useMemo(
    () => scene.hotspots.filter((hotspot) => hotspot.kind === 'navigation' && hotspot.targetSceneId),
    [scene],
  )

  const goToScene = (sceneId?: string) => {
    if (!sceneId || !world.scenes[sceneId]) return
    setCurrentSceneId(sceneId)
    setSelectedHotspot(null)
  }

  const handleHotspot = (hotspot: Hotspot) => {
    if (hotspot.kind === 'navigation' && hotspot.targetSceneId) {
      goToScene(hotspot.targetSceneId)
      return
    }
    setSelectedHotspot(hotspot)
  }

  const backgroundStyle = scene.asset
    ? { backgroundImage: `url(${scene.asset})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{world.title.toUpperCase()} · {world.version.toUpperCase()} · SCENE GRAPH</p>
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

      <section className={`scene ${scene.visualClass}`} style={backgroundStyle} aria-label={scene.title}>
        {!scene.asset && (
          <div className="room-art" aria-hidden="true">
            <div className="window" />
            <div className="shelf"><span /><span /><span /><span /><span /></div>
            <div className="desk"><div className="desk-book" /></div>
            <div className="bed" />
            <div className="rug" />
            <div className="toy" />
          </div>
        )}

        {scene.hotspots.map((hotspot) => {
          const visible = studentGuide && (Boolean(hotspot.knowledgeId) || hotspot.kind === 'navigation')
          return (
            <button
              key={hotspot.id}
              className={`hotspot ${visible ? 'student-visible' : ''} ${hotspot.kind === 'navigation' ? 'navigation-hotspot' : ''}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, width: `${hotspot.width}%`, height: `${hotspot.height}%` }}
              onClick={() => handleHotspot(hotspot)}
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
            <span>Role: {scene.role}</span>
            <span>Knowledge: {knowledgeHotspots.map((h) => h.label).join(' / ') || 'none'}</span>
            <span>Routes: {navigationHotspots.map((h) => h.label).join(' / ') || 'none'}</span>
            <span>{room.lockedLocation ? 'WORLD LOCK: this room location is fixed.' : 'EXPANSION AREA: new rooms may be attached here.'}</span>
            <span>GRAPH CHECK: {worldIssues.length === 0 ? 'PASS' : `${worldIssues.length} issue(s)`}</span>
          </aside>
        )}

        {(scene.turnLeftSceneId || scene.turnRightSceneId) && (
          <nav className="turn-controls" aria-label="View direction controls">
            <button disabled={!scene.turnLeftSceneId} onClick={() => goToScene(scene.turnLeftSceneId)}>← 左を見る</button>
            <div className="direction-indicator">{scene.view.toUpperCase()}</div>
            <button disabled={!scene.turnRightSceneId} onClick={() => goToScene(scene.turnRightSceneId)}>右を見る →</button>
          </nav>
        )}
      </section>

      <footer className="statusbar">
        <span>WORLD: {world.title} {world.version}</span>
        <span>ROOM: {room.title}</span>
        <span>SCENE: {scene.id}</span>
        <span>VIEW: {scene.view.toUpperCase()}</span>
        <span>{room.lockedLocation ? '🔒 LOCATION LOCKED' : '＋ EXPANDABLE'}</span>
        <span>GRAPH: {worldIssues.length === 0 ? 'PASS' : 'FAIL'}</span>
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
                <p>Nothing is stored here yet. This place can remain empty or receive content later without changing the room layout.</p>
              </>
            )}
            <button className="return-button" onClick={() => setSelectedHotspot(null)}>同じ場所へ戻る</button>
          </article>
        </div>
      )}
    </main>
  )
}
