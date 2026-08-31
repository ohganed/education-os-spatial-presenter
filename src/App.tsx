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

  return (
    <main className="app-shell classroom-mode">
      <header className="topbar">
        <div>
          <p className="eyebrow">MEMORY PALACE PRESENTER</p>
          <h1>{scene.title}</h1>
        </div>
        <div className="guide-controls">
          <button className={studentGuide ? 'active' : ''} onClick={() => setStudentGuide((v) => !v)}>生徒カンペ</button>
          <button className={teacherGuide ? 'active teacher' : 'teacher'} onClick={() => setTeacherGuide((v) => !v)}>先生カンペ</button>
        </div>
      </header>

      <section className="scene scene-photo" aria-label={scene.title}>
        {scene.asset ? (
          <img className="scene-image" src={scene.asset} alt="" draggable={false} />
        ) : (
          <div className="asset-pending">このSceneの画像を準備中</div>
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
            <strong>先生カンペ</strong>
            <span>{room.title}</span>
            <span>{scene.role === 'exit' ? 'ここは退出専用。知識は置かない。' : '必要な場所をタップして授業を進める。'}</span>
            {worldIssues.length > 0 && <span>内部データに要確認箇所があります。</span>}
          </aside>
        )}

        {(scene.turnLeftSceneId || scene.turnRightSceneId) && (
          <nav className="turn-controls" aria-label="視点を変える">
            <button disabled={!scene.turnLeftSceneId} onClick={() => goToScene(scene.turnLeftSceneId)}>← 反対を見る</button>
            <button disabled={!scene.turnRightSceneId} onClick={() => goToScene(scene.turnRightSceneId)}>反対を見る →</button>
          </nav>
        )}
      </section>

      {selectedHotspot && (
        <div className="modal-backdrop" onClick={() => setSelectedHotspot(null)}>
          <article className="knowledge-card" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setSelectedHotspot(null)}>×</button>
            {selectedKnowledge ? (
              <>
                <h2>{selectedKnowledge.title}</h2>
                <p>{selectedKnowledge.body}</p>
                {teacherGuide && selectedKnowledge.teacherCue && <div className="teacher-cue">{selectedKnowledge.teacherCue}</div>}
              </>
            ) : (
              <>
                <h2>{selectedHotspot.label}</h2>
                <p>ここにはまだ知識は入っていません。</p>
              </>
            )}
            <button className="return-button" onClick={() => setSelectedHotspot(null)}>同じ場所へ戻る</button>
          </article>
        </div>
      )}
    </main>
  )
}
