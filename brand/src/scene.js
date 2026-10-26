// The Darb Budokai seal in 3D: 武 (bu, "martial") in polished gold, struck into a dark stone slab
// that cracks open with ki. Procedural and seeded, so every render of a variant is identical.
//
// createScene({ canvas, w, h, variant, scale, tokens }) -> { render() }
//   variant 'tile'  slab fills the square, for app icons (scale = share of the frame the glyph fills)
//   variant 'og'    wide social card, slab on the right, night sky behind (copy is drawn by the page)
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { glyphShapes, crackPaths } from './seal.js'

export async function createScene({ canvas, w, h, variant = 'tile', scale = 0.62, tokens, font }) {
  const R = tokens.render
  const C = Object.fromEntries(Object.entries(tokens.color).map(([k, v]) => [k, new THREE.Color(v.hex)]))
  const og = variant === 'og'

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true })
  renderer.setSize(w, h, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = R.exposure
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = R.environment

  let seed = R.seed
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // night sky with the tournament's ki sunset low on the horizon (only the social card sees it)
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(60, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uTop: { value: C.night }, uMid: { value: C.forest }, uHot: { value: C.ki } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHot; varying vec3 vD;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
      void main(){ float y = vD.y;
        vec3 c = mix(uMid * .5, uTop * .45, smoothstep(-.2, .7, y));
        c += uHot * exp(-pow((y + .12) * 6., 2.)) * .4;
        c += vec3(1., .93, .8) * step(.9986, h(floor(vD * 420.))) * smoothstep(0., .6, y) * .7;
        gl_FragColor = vec4(c, 1.); }`,
  })))

  // dark tournament stone: grain, pits and a faint tile grid, painted once on a seeded canvas
  function stone(tiles) {
    const n = 1024, cv = document.createElement('canvas'); cv.width = cv.height = n
    const g = cv.getContext('2d')
    g.fillStyle = '#' + C.stone.clone().multiplyScalar(R.stoneShade).getHexString(); g.fillRect(0, 0, n, n)
    for (let i = 0; i < 26000; i++) {
      g.fillStyle = `rgba(${rnd() < .5 ? '0,0,0' : '255,246,228'},${rnd() * .08})`
      g.fillRect(rnd() * n, rnd() * n, 1 + rnd() * 3, 1 + rnd() * 3)
    }
    g.strokeStyle = 'rgba(0,0,0,.38)'; g.lineWidth = 2
    for (let i = 1; i < tiles; i++) { const p = (i / tiles) * n; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, n); g.moveTo(0, p); g.lineTo(n, p); g.stroke() }
    if (!og) {
      // the icon is all slab: fall off to night at the edges so the eye lands on the seal
      const v = g.createRadialGradient(n / 2, n / 2, n * 0.04, n / 2, n / 2, n * 0.22)
      v.addColorStop(0, 'rgba(3,17,12,0)'); v.addColorStop(1, `rgba(3,17,12,${R.vignette})`)
      g.fillStyle = v; g.fillRect(0, 0, n, n)
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
    return t
  }

  const slabSize = og ? 3.4 : 9
  const slab = new THREE.Mesh(new RoundedBoxGeometry(slabSize, 0.5, slabSize, 4, 0.05),
    new THREE.MeshStandardMaterial({ map: stone(og ? 4 : 6), roughness: 0.88, envMapIntensity: 0.35 }))
  slab.position.y = -0.25; slab.castShadow = slab.receiveShadow = true; scene.add(slab)

  // ki fissures: flat ribbons on the stone, tapering to a point, with a scorched edge and a hot core
  function ribbon(pts, width, y) {
    const pos = [], idx = []
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]
      const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1
      const half = (width / 2) * (1 - (i / (pts.length - 1)) * 0.85)
      pos.push(pts[i].x - (dz / len) * half, y, pts[i].z + (dx / len) * half, pts[i].x + (dz / len) * half, y, pts[i].z - (dx / len) * half)
      if (i) idx.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i - 1, 2 * i + 1, 2 * i)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx)
    return g
  }
  const flat = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: false, side: THREE.DoubleSide })
  const scorch = flat(0x000000, 0.6)
  const glow = flat(C.ki.clone().multiplyScalar(R.crackGlow))
  const core = flat(C.kiHot.clone().multiplyScalar(R.crackGlow * 1.3))
  const reach = og ? 1.75 : 3.2
  for (const [i, { pts, main }] of crackPaths(R.seed, R.cracks, reach).entries()) {
    const v = pts.map(([x, z]) => new THREE.Vector3(x, 0, z))
    const w0 = (og ? 0.05 : 0.055) * (main ? 1.15 - (i / (2 * R.cracks)) * 0.45 : 0.55)
    scene.add(new THREE.Mesh(ribbon(v, w0 * 2.6, 0.002), scorch))
    scene.add(new THREE.Mesh(ribbon(v, w0, 0.003), glow))
    scene.add(new THREE.Mesh(ribbon(v, w0 * 0.35, 0.004), core))
  }

  // the glyph, extruded with a bevel so its edges catch the key light
  const GLYPH = 2.1
  const geo = new THREE.ExtrudeGeometry(glyphShapes(font, '武', THREE), {
    depth: 210, bevelEnabled: true, bevelThickness: 22, bevelSize: 12, bevelSegments: 6, curveSegments: 10,
  })
  geo.computeBoundingBox()
  const bb = geo.boundingBox
  geo.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, 0)
  geo.scale(GLYPH / 1000, GLYPH / 1000, GLYPH / 1000)
  // polished face, darker struck sides: the face reads first, the depth stays gold instead of mirroring the sky
  const face = new THREE.MeshPhysicalMaterial({ color: C.gold, metalness: 1, roughness: 0.2, clearcoat: 0.5, clearcoatRoughness: 0.12 })
  const sides = new THREE.MeshStandardMaterial({ color: C.gold.clone().lerp(C.goldDeep, 0.55), metalness: 1, roughness: 0.38, envMapIntensity: 0.6 })
  const glyph = new THREE.Mesh(geo, [face, sides])
  glyph.rotation.x = -Math.PI / 2; glyph.position.y = 0.02; glyph.castShadow = true; scene.add(glyph)

  // light: warm key from top left, ki glowing up from the cracks, a cool forest fill
  const key = new THREE.DirectionalLight(C.goldLight, R.key)
  key.position.set(-4, 8, 4); key.castShadow = true
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 })
  scene.add(key)
  const ki = new THREE.PointLight(C.ki, R.kiLight, 10, 1.6); ki.position.set(0, 0.55, 1.5); scene.add(ki)
  const rim = new THREE.DirectionalLight(C.ki, R.key * 0.5); rim.position.set(5, 2, -6); scene.add(rim)
  scene.add(new THREE.HemisphereLight(C.forest, C.night, 0.35))

  const camera = new THREE.PerspectiveCamera(og ? 30 : 24, w / h, 0.1, 200)
  if (og) {
    camera.position.set(1.0, 7.0, 6.0); camera.lookAt(0, -0.15, 0.15)
    // push the slab into the right half of the card; the page draws the copy on the left
    camera.setViewOffset(w, h, -w * 0.27, 0, w, h)
  } else {
    // a slight tilt keeps the glyph's depth visible; distance makes it fill `scale` of the frame
    const fov = THREE.MathUtils.degToRad(camera.fov)
    const d = GLYPH / scale / (2 * Math.tan(fov / 2))
    const tilt = THREE.MathUtils.degToRad(R.tilt)
    camera.position.set(0, Math.cos(tilt) * d, Math.sin(tilt) * d); camera.lookAt(0, 0, 0.04)
  }
  camera.updateProjectionMatrix()

  const composer = new EffectComposer(renderer)
  composer.setSize(w, h)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), R.bloom.strength, R.bloom.radius, R.bloom.threshold))
  composer.addPass(new OutputPass())
  return { render: () => composer.render() }
}
