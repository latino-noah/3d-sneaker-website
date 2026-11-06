// Shared studio setup for the sneaker.
// Used by the live 3D stage AND by the script that renders the static
// fallback/close-up images, so both look identical (same pose, light, tone).
import {
  ACESFilmicToneMapping,
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  PCFShadowMap,
  PlaneGeometry,
  PMREMGenerator,
  SRGBColorSpace,
  ShadowMaterial,
  Vector3,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export const MODEL_URL = '/model.glb'

// Hero framing: the static fallback image is rendered with exactly these
// values at a 4:3 aspect, so the live canvas can swap in without a jump.
export const HERO = {
  aspect: 4 / 3,
  fov: 19,
  camera: [0, 1.05, 6.4],
  target: [0, -0.08, 0],
  rotationY: Math.PI / 2 - 0.42,
}

export function configureRenderer(gl) {
  gl.toneMapping = ACESFilmicToneMapping
  gl.toneMappingExposure = 1.0
  gl.outputColorSpace = SRGBColorSpace
  gl.shadowMap.enabled = true
  gl.shadowMap.type = PCFShadowMap
}

// Neutral studio: soft room environment for reflections + one key light that
// casts the contact shadow, a weak fill and a warm-neutral hemisphere.
export function buildStudio(gl, scene) {
  const pmrem = new PMREMGenerator(gl)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
  scene.environment = env
  scene.environmentIntensity = 0.55

  const lights = new Group()
  const key = new DirectionalLight('#ffffff', 2.1)
  key.position.set(2.2, 6, 3.2)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.radius = 9
  key.shadow.blurSamples = 16
  key.shadow.bias = -0.0005
  const cam = key.shadow.camera
  cam.left = -1.8
  cam.right = 1.8
  cam.top = 1.8
  cam.bottom = -1.8
  cam.near = 1
  cam.far = 12
  const fill = new DirectionalLight('#f4f1ea', 0.45)
  fill.position.set(-4, 2, -3)
  const hemi = new HemisphereLight('#ffffff', '#d9d4ca', 0.35)
  lights.add(key, fill, hemi)
  scene.add(lights)
  return () => {
    scene.remove(lights)
    env.dispose()
    scene.environment = null
  }
}

// The scanned mesh ships without vertex normals, which made three.js fall back
// to faceted flat shading. Rebuild smooth normals and normalise the model:
// 2 units long, centred, sole resting on y = -height / 2.
export function prepareSneaker(root) {
  root.traverse((o) => {
    if (!o.isMesh) return
    if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals()
    o.castShadow = true
    o.material.flatShading = false
    for (const k of ['map', 'normalMap', 'roughnessMap', 'aoMap']) {
      if (o.material[k]) o.material[k].anisotropy = 8
    }
    o.material.needsUpdate = true
  })
  const box = new Box3().setFromObject(root)
  const centre = box.getCenter(new Vector3())
  const size = box.getSize(new Vector3())
  const scale = 2 / Math.max(size.x, size.y, size.z)
  root.position.sub(centre)
  const wrapper = new Group()
  wrapper.add(root)
  wrapper.scale.setScalar(scale)
  return { object: wrapper, height: size.y * scale }
}

// Invisible floor that only receives the soft shadow.
export function buildFloor(y) {
  const floor = new Mesh(new PlaneGeometry(8, 8), new ShadowMaterial({ opacity: 0.3 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = y
  floor.receiveShadow = true
  return floor
}
