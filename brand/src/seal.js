// Shared geometry for the seal, used by the 3D scene (browser) and the flat SVG marks (Node).
// Both read the same font and the same seeded cracks, so the flat mark and the render always agree.

/** Contours of `char` in font units (y up), each with its signed area. */
export function glyphContours(font, char) {
  const contours = []
  let cur = null
  for (const c of font.getPath(char, 0, 0, 1000).commands) {
    if (c.type === 'M') contours.push((cur = [c]))
    else if (c.type !== 'Z') cur.push(c)
  }
  const area = (cs) => cs.reduce((a, p, i) => { const q = cs[(i + 1) % cs.length]; return a + (p.x * -q.y - q.x * -p.y) }, 0)
  return contours.map((cs) => ({ cmds: cs, area: area(cs) }))
}

/** THREE.Shape list for an extrusion: the outer winding becomes shapes, the opposite winding holes. */
export function glyphShapes(font, char, THREE) {
  const contours = glyphContours(font, char)
  const outer = Math.sign(contours.reduce((m, c) => (Math.abs(c.area) > Math.abs(m.area) ? c : m)).area)
  const shapes = []
  for (const { cmds, area } of contours) {
    const p = new THREE.Path()
    for (const c of cmds) {
      if (c.type === 'M') p.moveTo(c.x, -c.y)
      else if (c.type === 'L') p.lineTo(c.x, -c.y)
      else if (c.type === 'Q') p.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y)
      else if (c.type === 'C') p.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y)
    }
    if (Math.sign(area) === outer) shapes.push(new THREE.Shape(p.getPoints(12)))
    else shapes.at(-1)?.holes.push(new THREE.Path(p.getPoints(12)))
  }
  return shapes
}

/** Jagged crack polylines radiating from the centre, with short side branches, as [x, z] points. Seeded. */
export function crackPaths(seed, n, reach) {
  let s = seed
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const walk = (x, z, a, L, steps, turn) => {
    const pts = [[x, z]]
    for (let k = 0; k < steps; k++) {
      a += (rnd() - 0.5) * turn
      x += (Math.cos(a) * L) / steps
      z += (Math.sin(a) * L) / steps
      pts.push([x, z])
    }
    return pts
  }
  const out = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * 0.5
    const r0 = 0.55 // starts under the glyph's strokes, so the cores never pile up into a hot spot in its counters
    const main = walk(Math.cos(a) * r0, Math.sin(a) * r0, a, reach * (0.6 + rnd() * 0.5), 14, 0.9)
    out.push({ pts: main, main: true })
    const at = main[5 + Math.floor(rnd() * 5)]
    out.push({ pts: walk(at[0], at[1], a + (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 0.5), reach * 0.25, 6, 0.8), main: false })
  }
  return out
}
