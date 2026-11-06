// Everything that needs three.js lives here so it can be code-split and
// loaded only after the page (and its static product image) has rendered.
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Component, Suspense, useEffect, useMemo, useRef } from 'react'
import { Vector3 } from 'three'
import { HERO, MODEL_URL, buildFloor, buildStudio, configureRenderer, prepareSneaker } from './studio.js'

const GL = { antialias: true, alpha: true, powerPreference: 'high-performance' }

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError?.()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Studio() {
  const { gl, scene, invalidate } = useThree()
  useEffect(() => {
    const dispose = buildStudio(gl, scene)
    invalidate()
    return dispose
  }, [gl, scene, invalidate])
  return null
}

// Model + floor. Calls onReady once the first frame with the model is drawn.
function Sneaker({ spinRef, onReady }) {
  const gltf = useGLTF(MODEL_URL, false, true)
  const { object, height } = useMemo(() => prepareSneaker(gltf.scene.clone(true)), [gltf])
  const floor = useMemo(() => buildFloor(-height / 2), [height])
  const { invalidate } = useThree()

  useEffect(() => {
    invalidate()
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => onReady?.())
    })
    return () => cancelAnimationFrame(raf)
  }, [invalidate, onReady])

  return (
    <>
      <group ref={spinRef} rotation-y={HERO.rotationY}>
        <primitive object={object} />
      </group>
      <primitive object={floor} />
    </>
  )
}

// Eases the sneaker's Y rotation towards the drag target; only renders while moving.
function DragSpin({ spinRef, targetRef }) {
  useFrame((state, delta) => {
    const g = spinRef.current
    if (!g) return
    const diff = targetRef.current - g.rotation.y
    if (Math.abs(diff) < 0.0005) return
    g.rotation.y += diff * (1 - Math.exp(-delta * 9))
    state.invalidate()
  })
  return null
}

function onCreated({ gl, camera }) {
  configureRenderer(gl)
  camera.lookAt(...HERO.target)
}

/* ---------- Hero stage: horizontal drag only, page scroll stays free ---------- */
export function HeroStage({ onReady, onError, rotateBy }) {
  const spinRef = useRef()
  const targetRef = useRef(HERO.rotationY)
  const dragRef = useRef({ id: null, x: 0 })

  // Keyboard / external rotation requests (from the wrapper's arrow keys).
  useEffect(() => {
    if (rotateBy) targetRef.current += rotateBy.delta
  }, [rotateBy])

  const handlers = {
    onPointerDown: (e) => {
      const drag = dragRef.current
      drag.id = e.pointerId
      drag.x = e.clientX
      if (e.pointerType !== 'touch') e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e) => {
      const drag = dragRef.current
      if (drag.id !== e.pointerId) return
      targetRef.current += (e.clientX - drag.x) * 0.012
      drag.x = e.clientX
    },
    onPointerUp: () => (dragRef.current.id = null),
    onPointerCancel: () => (dragRef.current.id = null),
  }

  return (
    <Boundary onError={onError}>
      <div className="stage3d-input" {...handlers}>
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          gl={GL}
          shadows="percentage"
          camera={{ fov: HERO.fov, position: HERO.camera, near: 0.1, far: 50 }}
          onCreated={onCreated}
        >
          <Studio />
          <Suspense fallback={null}>
            <Sneaker spinRef={spinRef} onReady={onReady} />
          </Suspense>
          <DragSpin spinRef={spinRef} targetRef={targetRef} />
        </Canvas>
      </div>
    </Boundary>
  )
}

/* ---------- Viewer: orbit + zoom + camera presets ---------- */
// Camera directions in world space. The model sits rotated by HERO.rotationY,
// so its lateral side faces roughly +z and the toe points towards +x.
const PRESETS = {
  hero: HERO.camera,
  lateral: [-2.6, 0.5, 5.8],
  medial: [2.6, 0.5, -5.8],
  toe: [5.8, 0.9, 2.6],
  heel: [-5.8, 0.9, -2.6],
  sole: [0.3, -6.3, 0.6],
}

function PresetRig({ preset, controlsRef }) {
  const { camera, invalidate } = useThree()
  const goal = useRef(null)
  useEffect(() => {
    if (!preset) return
    goal.current = new Vector3(...PRESETS[preset.name]).setLength(camera.position.length())
    invalidate()
  }, [preset, camera, invalidate])

  useEffect(() => {
    const c = controlsRef.current
    if (!c) return
    const stop = () => (goal.current = null)
    c.addEventListener('start', stop)
    return () => c.removeEventListener('start', stop)
  }, [controlsRef])

  useFrame((state, delta) => {
    if (!goal.current) return
    const len = camera.position.length()
    camera.position.lerp(goal.current, 1 - Math.exp(-delta * 6)).setLength(len)
    controlsRef.current?.update()
    if (camera.position.distanceTo(goal.current) < 0.005) goal.current = null
    state.invalidate()
  })
  return null
}

export function ViewerStage({ onReady, onError, preset, autoRotate }) {
  const controlsRef = useRef()
  const spinRef = useRef()
  return (
    <Boundary onError={onError}>
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        gl={GL}
        shadows="percentage"
        camera={{ fov: HERO.fov + 4, position: HERO.camera, near: 0.1, far: 50 }}
        onCreated={onCreated}
      >
        <Studio />
        <Suspense fallback={null}>
          <Sneaker spinRef={spinRef} onReady={onReady} />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={HERO.target}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={10}
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
        />
        <PresetRig preset={preset} controlsRef={controlsRef} />
      </Canvas>
    </Boundary>
  )
}
