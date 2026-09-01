import { useEffect, useMemo, useState } from 'react'
import { knowledge, world } from './data/demo'
import { buildGuidanceRoute } from './engine/buildGuidanceRoute'
import { validateWorld } from './engine/validateWorld'
import type { Hotspot } from './types/spatial'

type LearningMode = 'explore' | 'guided'

type GuideStep = {
  sceneId: string
  hotspotId: string
  title: string
}

const guideRoute: GuideStep[] = [
  { sceneId: 'study-entry', hotspotId: 'study-blue-book', title: 'Newton’s Second Law' },
  { sceneId: 'study-entry', hotspotId: 'study-desk-book', title: 'Normal Force' },
  { sceneId: 'kitchen-entry', hotspotId: 'kitchen-stove', title: 'Energy Transfer' }
]

export default function App() {
  const [currentSceneId, setCurrentSceneId] = useState(world.startSceneId)
  const [learningMode, setLearningMode] = useState<LearningMode>('explore')
  const [learningGuide, setLearningGuide] = useState(false)
  const [teacherGuide, setTeacherGuide] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [guideStepIndex, setGuideStepIndex] = useState(0)
  const [routeCursor, setRouteCursor] = useState(0)

  const worldIssues = useMemo(() => validateWorld(world, knowledge), [])
  const scene = world.scenes[currentSceneId]
  const room = world.rooms[scene.roomId]
  const selectedKnowledge = selectedHotspot?.knowledgeId ? knowledge[selectedHotspot.knowledgeId] : null

  const activeGuideStep = learningMode === 'guided' ? guideRoute[guideStepIndex] : undefined
  const spatialRoute = useMemo(() => {
    if (!activeGuideStep) return []
    return buildGuidanceRoute(
      world,
      world.startSceneId,
      activeGuideStep.sceneId,
      activeGuideStep.hotspotId
    )
  }, [activeGuideStep])
  const activeRouteStep = learningMode === 'guided' ? spatialRoute[routeCursor] : undefined
  const activeGuideHotspot = activeRouteStep?.sceneId === currentSceneId
    ? scene.hotspots.find((hotspot) => hotspot.id === activeRouteStep.hotspotId)
    : undefined

  const setMode = (mode: LearningMode) => {
    setLearningMode(mode)
    setLearningGuide(mode === 'guided')
    setSelectedHotspot(null)
    setCurrentSceneId(world.startSceneId)
    setRouteCursor(0)
  }

  const goToScene = (sceneId?: string) => {
    if (!sceneId || !world.scenes[sceneId]) return
    setCurrentSceneId(sceneId)
    setSelectedHotspot(null)
  }

  const handleHotspot = (hotspot: Hotspot) => {
    if (hotspot.kind === 'navigation' && hotspot.targetSceneId) {
      goToScene(hotspot.targetSceneId)
      if (learningMode === 'guided' && activeRouteStep?.hotspotId === hotspot.id) {
        setRouteCursor((cursor) => Math.min(cursor + 1, spatialRoute.length - 1))
      }
      return
    }
    setSelectedHotspot(hotspot)
  }

  const finishKnowledge = () => {
    setSelectedHotspot(null)
    if (learningMode === 'guided' && activeGuideHotspot?.id === selectedHotspot?.id) {
      setGuideStepIndex((index) => Math.min(index + 1, guideRoute.length - 1))
      setCurrentSceneId(world.startSceneId)
      setRouteCursor(0)
    }
  }

  useEffect(() => {
    setRouteCursor(0)
    if (learningMode === 'guided') setCurrentSceneId(world.startSceneId)
  }, [guideStepIndex, learningMode])

  useEffect(() => {
    if (learningMode !== 'guided' || selectedHotspot) return
    if (!activeRouteStep || activeRouteStep.kind !== 'navigation') return
    if (!activeGuideHotspot?.targetSceneId) return

    const timer = window.setTimeout(() => {
      goToScene(activeGuideHotspot.targetSceneId)
      setRouteCursor((cursor) => Math.min(cursor + 1, spatialRoute.length - 1))
    }, 1600)

    return () => window.clearTimeout(timer)
  }, [
    learningMode,
    selectedHotspot,
    activeRouteStep,
    activeGuideHotspot,
    spatialRoute.length
  ])

  const oppositeSceneId = scene.turnRightSceneId ?? scene.turnLeftSceneId
  const oppositeLabel = scene.role === 'exit' ? '部屋を見る' : '出口側を見る'
  const imageSrc = scene.asset ? `${scene.asset}?scene=${encodeURIComponent(scene.id)}` : undefined

  const polygonHotspots = scene.hotspots.filter((hotspot) => hotspot.points && hotspot.points.length >= 3)
  const rectangleHotspots = scene.hotspots.filter((hotspot) => !hotspot.points || hotspot.points.length < 3)

  return (
    <main className="app-shell classroom-mode">
      <header className="topbar">
        <div>
          <p className="eyebrow">MEMORY PALACE PRESENTER</p>
          <h1>{scene.title}</h1>
        </div>
        <div className="guide-controls">
          <div className="mode-switch" aria-label="学習モード">
            <button className={learningMode === 'explore' ? 'active' : ''} onClick={() => setMode('explore')}>探索モード</button>
            <button className={learningMode === 'guided' ? 'active guided' : ''} onClick={() => setMode('guided')}>ガイドモード</button>
          </div>
          <button className={learningGuide ? 'active' : ''} onClick={() => setLearningGuide((v) => !v)}>学習ガイド</button>
          <button className={teacherGuide ? 'active teacher' : 'teacher'} onClick={() => setTeacherGuide((v) => !v)}>教師ガイド</button>
        </div>
      </header>

      <section className="scene scene-photo" aria-label={scene.title}>
        {imageSrc ? (
          <img key={scene.id} className="scene-image" src={imageSrc} alt="" draggable={false} />
        ) : (
          <div className="asset-pending">このSceneの画像を準備中</div>
        )}

        {rectangleHotspots.map((hotspot) => {
          const isGuideTarget = learningMode === 'guided' && activeGuideHotspot?.id === hotspot.id && !selectedHotspot
          const visible = learningGuide && (Boolean(hotspot.knowledgeId) || hotspot.kind === 'navigation')
          return (
            <button
              key={hotspot.id}
              className={`hotspot ${visible ? 'student-visible' : ''} ${hotspot.kind === 'navigation' ? 'navigation-hotspot' : ''} ${isGuideTarget ? 'guide-target' : ''}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, width: `${hotspot.width}%`, height: `${hotspot.height}%` }}
              onClick={() => handleHotspot(hotspot)}
              aria-label={hotspot.label}
            >
              {visible && <span>{hotspot.label}</span>}
            </button>
          )
        })}

        {polygonHotspots.length > 0 && (
          <svg className="object-hotspot-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="物体選択レイヤー">
            {polygonHotspots.map((hotspot) => {
              const isGuideTarget = learningMode === 'guided' && activeGuideHotspot?.id === hotspot.id && !selectedHotspot
              const visible = learningGuide && (Boolean(hotspot.knowledgeId) || hotspot.kind === 'navigation')
              const points = hotspot.points!.map(([x, y]) => `${x},${y}`).join(' ')
              return (
                <polygon
                  key={hotspot.id}
                  points={points}
                  className={`object-hotspot ${visible ? 'object-visible' : ''} ${isGuideTarget ? 'object-guide-target' : ''} ${hotspot.kind === 'navigation' ? 'object-navigation' : ''}`}
                  onClick={() => handleHotspot(hotspot)}
                  role="button"
                  tabIndex={0}
                  aria-label={hotspot.label}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') handleHotspot(hotspot)
                  }}
                />
              )
            })}
          </svg>
        )}

        {learningMode === 'guided' && activeGuideHotspot && !selectedHotspot && (
          <div
            className="butterfly-guide"
            style={{
              left: `${activeGuideHotspot.x + activeGuideHotspot.width / 2}%`,
              top: `${activeGuideHotspot.y - 3}%`
            }}
            aria-hidden="true"
          >
            <span className="butterfly">🦋</span>
            {learningGuide && (
              <span className="guide-caption">
                {activeRouteStep?.kind === 'navigation' ? 'この部屋へ進みます' : 'ここにプレゼンがあります'}
              </span>
            )}
          </div>
        )}

        {learningMode === 'guided' && learningGuide && !activeGuideHotspot && !selectedHotspot && activeGuideStep && (
          <aside className="route-hint">
            <strong>次の学習場所</strong>
            <span>{world.scenes[activeGuideStep.sceneId]?.title ?? activeGuideStep.sceneId}</span>
            <span>案内ルートを確認しています</span>
          </aside>
        )}

        {teacherGuide && (
          <aside className="teacher-overlay">
            <strong>教師ガイド</strong>
            <span>{room.title}</span>
            <span>{scene.role === 'exit' ? 'ここは退出専用。知識は置かない。' : '必要な場所をタップして授業を進める。'}</span>
            {learningMode === 'guided' && activeGuideStep && <span>次: {activeGuideStep.title}</span>}
            {worldIssues.length > 0 && <span>内部データに要確認箇所があります。</span>}
          </aside>
        )}

        {oppositeSceneId && (
          <nav className="turn-controls" aria-label="視点を変える">
            <button onClick={() => goToScene(oppositeSceneId)}>{oppositeLabel}</button>
          </nav>
        )}
      </section>

      {selectedHotspot && (
        <div className="modal-backdrop" onClick={finishKnowledge}>
          <article className="knowledge-card" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={finishKnowledge}>×</button>
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
            <button className="return-button" onClick={finishKnowledge}>学習を終えて部屋へ戻る</button>
          </article>
        </div>
      )}
    </main>
  )
}
