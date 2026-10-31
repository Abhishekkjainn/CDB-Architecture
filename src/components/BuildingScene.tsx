import { useEffect, useRef } from 'react'
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * Scroll ranges for the five stages. Exported so the copy beside the model
 * highlights from the same numbers the geometry animates on — the text and the
 * building can never fall out of step.
 *
 *   0 Design      a blueprint of the house draws itself in the dark
 *   1 Foundation  footings and slab appear on the drawing
 *   2 Structure   frame rises, and the site is landscaped alongside it
 *   3 Exterior    cladding, balcony, garage and roof — the drawing turns real
 *   4 Interior    lights come on inside, the house is occupied, and the camera
 *                 pulls back to the finished house in its landscape
 */
export const STAGE_RANGES = [
  [0.0, 0.18],
  [0.18, 0.34],
  [0.34, 0.56],
  [0.56, 0.78],
  [0.78, 1.0],
] as const

export function stageFor(progress: number) {
  const i = STAGE_RANGES.findIndex(([a, b]) => progress >= a && progress < b)
  return i === -1 ? STAGE_RANGES.length - 1 : i
}

type Props = {
  /** 0 → 1 assembly progress, written by the parent on scroll. */
  progressRef: { current: number }
  className?: string
}

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const smooth = (t: number) => t * t * (3 - 2 * t)
/** Normalised position inside a window, eased. */
const win = (t: number, a: number, b: number) => easeOut(clamp01((t - a) / (b - a)))

/* ---------------------------------------------------------------------------
 * The house. One unit is roughly two metres, which keeps the figures, the cars
 * and the floor heights believable against each other.
 * ------------------------------------------------------------------------- */
const GF = { w: 5.0, h: 1.55, d: 3.2, x: 0, z: 0 } //        ground floor bar
const UF = { w: 3.4, h: 1.45, d: 2.9, x: -0.6, z: 0.2 } //   upper, cantilevered
const GAR = { w: 2.5, h: 1.45, d: 2.9, x: 3.75, z: -0.15 } // garage wing
const SLAB = 0.16
const GF_Y = SLAB + GF.h / 2
const UF_Y = SLAB + GF.h + UF.h / 2
const ROOF_Y = SLAB + GF.h + UF.h

/** Balcony on the front elevation of the upper volume. */
const BAL = {
  w: UF.w - 0.3,
  d: 1.0,
  y: SLAB + GF.h + 0.09,
  z: UF.z + UF.d / 2 + 0.5,
  x: UF.x,
}

const PALETTE = {
  plaster: '#e3dfd7',
  charcoal: '#3a3835',
  grey: '#9b958c',
  timber: '#9a6f45',
  concrete: '#c2bcb2',
  roof: '#7c7771',
  glass: '#26323a',
  blueprint: '#0d2036',
  line: '#63b4ff',
}

export function BuildingScene({ progressRef, className }: Props) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = host.current
    if (!mount) return

    let disposed = false
    let cleanup: (() => void) | undefined

    void (async () => {
      const THREE = await import('three')
      if (disposed || !mount) return

      let renderer: import('three').WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
      } catch {
        return // No WebGL. The written stages carry the section on their own.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      mount.appendChild(renderer.domElement)
      Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, 1, 0.08, 400)
      const world = new THREE.Group()
      scene.add(world)

      const disposables: { dispose(): void }[] = []
      const NIGHT = new THREE.Color('#04060b')
      const DAY_TOP = new THREE.Color('#9dc4e8')
      const DAY_LOW = new THREE.Color('#e8e2d6')

      /* --- sky ------------------------------------------------------------
       * A gradient dome rather than a flat clear colour: it is what makes the
       * daylight at the end read as sky instead of a grey backdrop, and a
       * single uniform takes it from blueprint night to a sunlit morning. */
      const skyUniforms = {
        uTop: { value: NIGHT.clone() },
        uBottom: { value: NIGHT.clone() },
      }
      const sky = new THREE.Mesh(
        new THREE.SphereGeometry(160, 24, 16),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          depthWrite: false,
          uniforms: skyUniforms,
          vertexShader: `
            varying float vH;
            void main() {
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vH = normalize(wp.xyz).y;
              gl_Position = projectionMatrix * viewMatrix * wp;
            }`,
          fragmentShader: `
            uniform vec3 uTop;
            uniform vec3 uBottom;
            varying float vH;
            void main() {
              gl_FragColor = vec4(mix(uBottom, uTop, smoothstep(-0.05, 0.6, vH)), 1.0);
            }`,
        }),
      )
      scene.add(sky)
      disposables.push(sky.geometry, sky.material as unknown as { dispose(): void })

      /* ------------------------------------------------------------------
       * Parts. Every solid carries the colour it has while it is still a
       * drawing and the colour it takes once the house is real, and lerps
       * between them in the loop — that one mechanism is the "colouring".
       * ---------------------------------------------------------------- */
      type Reveal = 'rise' | 'grow' | 'fly' | 'fade'
      type Part = {
        mesh: import('three').Mesh
        t0: number
        t1: number
        reveal: Reveal
        rest: import('three').Vector3
        from?: import('three').Vector3
        draft: import('three').Color
        built: import('three').Color
        /** Never existed as a drawing, so it arrives already finished. */
        builtOnly?: boolean
        /** Glazing: stays part-transparent so the interior reads through it. */
        glass?: boolean
      }
      const parts: Part[] = []
      const lines: { line: import('three').LineSegments; t0: number; t1: number }[] = []

      const geo = {
        box: new THREE.BoxGeometry(1, 1, 1),
        cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 14),
        cone: new THREE.ConeGeometry(0.5, 1, 12),
        sphere: new THREE.SphereGeometry(0.5, 14, 12),
      }
      disposables.push(...Object.values(geo))

      type SolidOpts = {
        size: [number, number, number]
        at: [number, number, number]
        t0: number
        t1: number
        reveal?: Reveal
        from?: [number, number, number]
        draft?: string
        built: string
        shape?: keyof typeof geo
        rotX?: number
        rotY?: number
        rotZ?: number
        builtOnly?: boolean
        glass?: boolean
        /** Self-lit accent, e.g. head and tail lamps. */
        emissive?: string
        metalness?: number
        roughness?: number
        parent?: import('three').Object3D
        noShadow?: boolean
      }

      function solid(o: SolidOpts) {
        const draft = o.draft ?? PALETTE.blueprint
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(draft),
          roughness: o.roughness ?? 0.9,
          metalness: o.metalness ?? 0,
          transparent: true,
          opacity: 0,
          // Glazing carries the warm interior glow once the lights go on.
          ...(o.glass
            ? { emissive: new THREE.Color('#ffb570'), emissiveIntensity: 0 }
            : null),
          ...(o.emissive
            ? { emissive: new THREE.Color(o.emissive), emissiveIntensity: 0.9 }
            : null),
        })
        disposables.push(mat)
        const mesh = new THREE.Mesh(geo[o.shape ?? 'box'], mat)
        mesh.scale.set(...o.size)
        mesh.position.set(...o.at)
        if (o.rotX) mesh.rotation.x = o.rotX
        if (o.rotY) mesh.rotation.y = o.rotY
        if (o.rotZ) mesh.rotation.z = o.rotZ
        mesh.castShadow = !o.noShadow
        mesh.receiveShadow = !o.noShadow
        ;(o.parent ?? world).add(mesh)
        parts.push({
          mesh,
          t0: o.t0,
          t1: o.t1,
          reveal: o.reveal ?? 'fade',
          rest: mesh.position.clone(),
          from: o.from ? new THREE.Vector3(...o.from) : undefined,
          draft: new THREE.Color(draft),
          built: new THREE.Color(o.built),
          builtOnly: o.builtOnly,
          glass: o.glass,
        })
        return mesh
      }

      /** Glowing blueprint edges for a volume. */
      function wire(
        size: [number, number, number],
        at: [number, number, number],
        t0: number,
        t1: number,
        color = PALETTE.line,
      ) {
        const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(...size))
        const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 })
        disposables.push(g, m)
        const line = new THREE.LineSegments(g, m)
        line.position.set(...at)
        world.add(line)
        lines.push({ line, t0, t1 })
      }

      // The design stage runs on the literal line timings below.
      const [, sFound, sStruct, sExt, sInt] = STAGE_RANGES

      /* --- 01 · the drawing ------------------------------------------------ */
      const grid = new THREE.GridHelper(60, 60, 0x2b6ea8, 0x14334f)
      ;(grid.material as import('three').Material).transparent = true
      ;(grid.material as import('three').Material).opacity = 0
      grid.position.y = 0.002
      world.add(grid)
      disposables.push(grid.geometry, grid.material as unknown as { dispose(): void })

      wire([GF.w, 0.001, GF.d], [GF.x, 0.004, GF.z], 0.01, 0.06)
      wire([GAR.w, 0.001, GAR.d], [GAR.x, 0.004, GAR.z], 0.03, 0.08)
      wire([GF.w, GF.h, GF.d], [GF.x, GF_Y, GF.z], 0.06, 0.12)
      wire([UF.w, UF.h, UF.d], [UF.x, UF_Y, UF.z], 0.09, 0.15)
      wire([GAR.w, GAR.h, GAR.d], [GAR.x, SLAB + GAR.h / 2, GAR.z], 0.11, 0.16)
      wire([BAL.w, 0.001, BAL.d], [BAL.x, BAL.y, BAL.z], 0.13, 0.17, '#4e9ddb')
      wire([GF.w + 0.7, 0.001, GF.d + 0.7], [GF.x, ROOF_Y + 0.12, GF.z], 0.14, 0.18, '#3d8fd0')

      /* --- 02 · foundation -------------------------------------------------- */
      const footX = [-GF.w / 2 + 0.3, -GF.w / 6, GF.w / 6, GF.w / 2 - 0.3]
      const footZ = [-GF.d / 2 + 0.3, GF.d / 2 - 0.3]
      footX.forEach((x, i) =>
        footZ.forEach((z, j) => {
          const at = sFound[0] + ((i * 2 + j) / 8) * 0.09
          solid({
            size: [0.44, 0.4, 0.44],
            at: [x, -0.2, z],
            t0: at,
            t1: at + 0.045,
            reveal: 'rise',
            built: '#8f8a82',
          })
        }),
      )
      ;[
        { w: GF.w + 0.4, d: GF.d + 0.4, x: GF.x, z: GF.z, at: sFound[0] + 0.07 },
        { w: GAR.w + 0.3, d: GAR.d + 0.3, x: GAR.x, z: GAR.z, at: sFound[0] + 0.1 },
      ].forEach((p) =>
        solid({
          size: [p.w, SLAB, p.d],
          at: [p.x, SLAB / 2, p.z],
          t0: p.at,
          t1: sFound[1],
          reveal: 'rise',
          draft: '#123a5c',
          built: PALETTE.concrete,
        }),
      )

      /* --- 03 · structure --------------------------------------------------- */
      footX.forEach((x, i) =>
        footZ.forEach((z, j) => {
          const at = sStruct[0] + ((i * 2 + j) / 8) * 0.08
          solid({
            size: [0.14, GF.h, 0.14],
            at: [x, GF_Y, z],
            t0: at,
            t1: at + 0.055,
            reveal: 'grow',
            draft: '#1b4e78',
            built: '#4a4642',
            metalness: 0.4,
            roughness: 0.5,
          })
        }),
      )
      footZ.forEach((z) =>
        solid({
          size: [GF.w, 0.14, 0.14],
          at: [GF.x, SLAB + GF.h, z],
          t0: sStruct[0] + 0.07,
          t1: sStruct[0] + 0.12,
          reveal: 'fly',
          from: [GF.x, SLAB + GF.h, z * 5],
          draft: '#1b4e78',
          built: '#4a4642',
          metalness: 0.4,
        }),
      )
      solid({
        size: [UF.w, 0.12, UF.d],
        at: [UF.x, SLAB + GF.h + 0.06, UF.z],
        t0: sStruct[0] + 0.11,
        t1: sStruct[0] + 0.17,
        reveal: 'fly',
        from: [UF.x, SLAB + GF.h + 2.4, UF.z],
        draft: '#15456b',
        built: PALETTE.concrete,
      })
      ;[-UF.w / 2 + 0.25, UF.w / 2 - 0.25].forEach((dx, i) =>
        [-UF.d / 2 + 0.25, UF.d / 2 - 0.25].forEach((dz, j) => {
          const at = sStruct[0] + 0.14 + ((i * 2 + j) / 8) * 0.07
          solid({
            size: [0.13, UF.h, 0.13],
            at: [UF.x + dx, UF_Y, UF.z + dz],
            t0: at,
            t1: at + 0.055,
            reveal: 'grow',
            draft: '#1b4e78',
            built: '#4a4642',
            metalness: 0.4,
          })
        }),
      )

      /* --- the site, landscaped alongside the frame -------------------------- */
      solid({
        size: [220, 0.02, 220],
        at: [0, -0.012, 0],
        t0: sStruct[0],
        t1: sStruct[0] + 0.07,
        draft: '#071626',
        built: '#8d9c7a',
        noShadow: true,
      }).receiveShadow = true

      // Lawn terrace the house sits on, then the driveway up to the garage.
      solid({
        size: [16, 0.04, 12],
        at: [0.6, 0.005, 1.2],
        t0: sStruct[0] + 0.02,
        t1: sStruct[0] + 0.09,
        draft: '#08203a',
        built: '#7e9068',
        noShadow: true,
      })
      solid({
        size: [2.6, 0.05, 9.5],
        at: [GAR.x, 0.03, GAR.d / 2 + 4.3],
        t0: sStruct[0] + 0.04,
        t1: sStruct[0] + 0.11,
        draft: '#0b2135',
        built: '#b0aba3',
      })
      // Entrance path and front steps.
      solid({
        size: [1.5, 0.06, 2.4],
        at: [UF.x + 0.2, 0.04, GF.d / 2 + 1.3],
        t0: sStruct[0] + 0.05,
        t1: sStruct[0] + 0.12,
        draft: '#0b2135',
        built: '#bdb8b0',
      })

      /* Trees, built from stacked ellipsoids rather than cones — a cone reads
       * as a diagram, a cluster reads as planting. */
      const trees: { x: number; z: number; h: number; kind: 'round' | 'conifer' }[] = [
        { x: -6.2, z: 2.6, h: 2.5, kind: 'round' },
        { x: -7.0, z: -1.6, h: 2.0, kind: 'conifer' },
        { x: -4.6, z: 5.6, h: 2.2, kind: 'round' },
        { x: 7.4, z: 3.4, h: 2.6, kind: 'round' },
        { x: 8.6, z: -1.0, h: 2.1, kind: 'conifer' },
        { x: 2.0, z: -5.6, h: 2.4, kind: 'round' },
        { x: -2.4, z: -6.2, h: 1.9, kind: 'conifer' },
        { x: 10.2, z: 5.2, h: 2.3, kind: 'round' },
        { x: -9.4, z: 5.0, h: 2.0, kind: 'round' },
      ]
      trees.forEach((t, i) => {
        const at = sStruct[0] + 0.06 + (i / trees.length) * 0.12
        const trunk = t.h * 0.42
        solid({
          size: [0.13, trunk, 0.13],
          at: [t.x, trunk / 2, t.z],
          t0: at,
          t1: at + 0.045,
          reveal: 'grow',
          shape: 'cyl',
          draft: '#13395c',
          built: '#6b5744',
        })
        if (t.kind === 'conifer') {
          for (let k = 0; k < 3; k++) {
            const r = 1.15 - k * 0.3
            solid({
              size: [r, t.h * 0.42, r],
              at: [t.x, trunk + t.h * 0.2 + k * t.h * 0.26, t.z],
              t0: at + 0.015 + k * 0.008,
              t1: at + 0.07 + k * 0.008,
              reveal: 'grow',
              shape: 'cone',
              draft: '#17496f',
              built: k === 0 ? '#44603f' : '#50704a',
            })
          }
        } else {
          const crown: [number, number, number, number][] = [
            [0, trunk + t.h * 0.34, 0, 1.5],
            [0.42, trunk + t.h * 0.52, 0.2, 1.1],
            [-0.4, trunk + t.h * 0.5, -0.22, 1.0],
          ]
          crown.forEach(([dx, y, dz, r], k) => {
            solid({
              size: [r * t.h * 0.5, r * t.h * 0.42, r * t.h * 0.5],
              at: [t.x + dx, y, t.z + dz],
              t0: at + 0.015 + k * 0.01,
              t1: at + 0.075 + k * 0.01,
              reveal: 'grow',
              shape: 'sphere',
              draft: '#17496f',
              built: ['#4e6b43', '#5a7a4c', '#46603d'][k]!,
            })
          })
        }
      })

      // Low hedges flanking the entrance.
      ;[-1, 1].forEach((s, i) =>
        solid({
          size: [0.5, 0.42, 2.2],
          at: [UF.x + 0.2 + s * 1.25, 0.21, GF.d / 2 + 1.4],
          t0: sStruct[0] + 0.15 + i * 0.01,
          t1: sStruct[0] + 0.2,
          reveal: 'grow',
          draft: '#14395c',
          built: '#4a6540',
        }),
      )

      /* --- cars -------------------------------------------------------------
       * Assembled from a body, a separate greenhouse with raked glazing, alloys
       * inside the tyres and lit lamps. A box on four cylinders reads as a
       * diagram; the rake of the screens is what makes it read as a car. */
      function car(x: number, z: number, rotY: number, t0: number, body: string) {
        const g = new THREE.Group()
        g.position.set(x, 0, z)
        g.rotation.y = rotY
        world.add(g)

        const o = { parent: g, t0, t1: t0 + 0.05, reveal: 'rise' as const }
        const paint = { built: body, metalness: 0.72, roughness: 0.28 }
        const glazing = { built: '#1b1f24', metalness: 0.5, roughness: 0.08 }

        // Body: sill, main volume, bonnet, nose, boot.
        solid({ ...o, size: [1.0, 0.16, 2.26], at: [0, 0.22, 0], built: '#212427', roughness: 0.7 })
        solid({ ...o, size: [1.02, 0.22, 2.3], at: [0, 0.37, 0], ...paint })
        solid({ ...o, size: [0.94, 0.09, 0.8], at: [0, 0.49, 0.7], ...paint })
        solid({ ...o, size: [0.98, 0.18, 0.18], at: [0, 0.33, 1.16], ...paint })
        solid({ ...o, size: [0.94, 0.09, 0.56], at: [0, 0.5, -0.88], ...paint })

        // Greenhouse: roof, raked windscreen and backlight, side glazing.
        solid({ ...o, size: [0.8, 0.06, 0.8], at: [0, 0.69, -0.1], ...paint })
        solid({ ...o, size: [0.82, 0.3, 0.03], at: [0, 0.59, 0.33], rotX: -0.7, ...glazing })
        solid({ ...o, size: [0.82, 0.26, 0.03], at: [0, 0.6, -0.52], rotX: 0.62, ...glazing })
        ;[-1, 1].forEach((side) => {
          solid({ ...o, size: [0.03, 0.17, 0.78], at: [side * 0.44, 0.6, -0.09], ...glazing })
          // Door mirrors.
          solid({ ...o, size: [0.11, 0.05, 0.06], at: [side * 0.55, 0.6, 0.24], ...paint })
        })

        // Wheels: tyre with an alloy set inside it.
        ;[
          [-1, 0.74],
          [1, 0.74],
          [-1, -0.76],
          [1, -0.76],
        ].forEach(([side, wz], i) => {
          const at: [number, number, number] = [side! * 0.49, 0.18, wz!]
          solid({
            ...o,
            size: [0.16, 0.36, 0.36],
            at,
            rotZ: Math.PI / 2,
            shape: 'cyl',
            built: '#17191b',
            roughness: 0.85,
            t0: t0 + 0.012 + i * 0.002,
          })
          solid({
            ...o,
            size: [0.17, 0.23, 0.23],
            at: [side! * 0.505, at[1], at[2]],
            rotZ: Math.PI / 2,
            shape: 'cyl',
            built: '#b9bcc0',
            metalness: 0.8,
            roughness: 0.3,
            t0: t0 + 0.016 + i * 0.002,
          })
        })

        // Lamps.
        ;[-1, 1].forEach((side) => {
          solid({ ...o, size: [0.24, 0.06, 0.04], at: [side * 0.29, 0.44, 1.24], built: '#f3efe6', emissive: '#fff4e0', t0: t0 + 0.02 })
          solid({ ...o, size: [0.22, 0.05, 0.04], at: [side * 0.3, 0.47, -1.16], built: '#8f2b22', emissive: '#ff5a4a', t0: t0 + 0.022 })
        })

        return g
      }

      // One on the driveway, one parked in the garage.
      car(GAR.x + 0.05, GAR.d / 2 + 3.1, 0, sStruct[0] + 0.16, '#2f3134')
      car(GAR.x, GAR.z + 0.1, 0, sExt[0] + 0.16, '#b9b4ac')

      /* --- figures -----------------------------------------------------------
       * Proportioned off a 1.76 m adult at this scale, with two-segment arms
       * and legs. The knee and elbow joints are what sell the walk — a figure
       * with straight limbs reads as a mannequin no matter how it is animated.
       * ----------------------------------------------------------------------- */
      type Figure = {
        group: import('three').Group
        hipL: import('three').Object3D
        hipR: import('three').Object3D
        kneeL: import('three').Object3D
        kneeR: import('three').Object3D
        shoulderL: import('three').Object3D
        shoulderR: import('three').Object3D
        elbowL: import('three').Object3D
        elbowR: import('three').Object3D
        torso: import('three').Object3D
        /** Keeps each figure's stride out of step with the others. */
        phase: number
      }
      const figures: { fig: Figure; t0: number }[] = []

      function figure(
        x: number,
        y: number,
        z: number,
        t0: number,
        coat: string,
        trousers: string,
        skin = '#c99b7d',
        hair = '#2e2721',
      ): Figure {
        const g = new THREE.Group()
        g.position.set(x, y, z)
        world.add(g)
        const o = { parent: g, t0, t1: t0 + 0.05, builtOnly: true as const }

        const joint = (parent: import('three').Object3D, px: number, py: number) => {
          const p = new THREE.Group()
          p.position.set(px, py, 0)
          parent.add(p)
          return p
        }

        // Torso carries the bob and sway; limbs hang off their own joints.
        const torso = joint(g, 0, 0)
        const hipL = joint(torso, -0.075, 0.44)
        const hipR = joint(torso, 0.075, 0.44)
        const kneeL = joint(hipL, 0, -0.22)
        const kneeR = joint(hipR, 0, -0.22)
        const shoulderL = joint(torso, -0.16, 0.72)
        const shoulderR = joint(torso, 0.16, 0.72)
        const elbowL = joint(shoulderL, 0, -0.2)
        const elbowR = joint(shoulderR, 0, -0.2)

        // Legs: thigh, shin, shoe.
        ;[
          [hipL, kneeL],
          [hipR, kneeR],
        ].forEach(([hip, knee]) => {
          solid({ ...o, parent: hip!, size: [0.105, 0.23, 0.12], at: [0, -0.11, 0], shape: 'cyl', built: trousers })
          solid({ ...o, parent: knee!, size: [0.09, 0.2, 0.1], at: [0, -0.1, 0], shape: 'cyl', built: trousers })
          solid({ ...o, parent: knee!, size: [0.09, 0.05, 0.2], at: [0, -0.2, 0.04], built: '#1f1d1b' })
        })

        // Arms: upper arm, forearm, hand.
        ;[
          [shoulderL, elbowL],
          [shoulderR, elbowR],
        ].forEach(([shoulder, elbow]) => {
          solid({ ...o, parent: shoulder!, size: [0.075, 0.21, 0.085], at: [0, -0.1, 0], shape: 'cyl', built: coat })
          solid({ ...o, parent: elbow!, size: [0.065, 0.19, 0.075], at: [0, -0.09, 0], shape: 'cyl', built: coat })
          solid({ ...o, parent: elbow!, size: [0.07, 0.08, 0.07], at: [0, -0.2, 0], shape: 'sphere', built: skin })
        })

        // Hips, chest, shoulders, neck, head, hair.
        solid({ ...o, parent: torso, size: [0.27, 0.16, 0.16], at: [0, 0.49, 0], built: trousers })
        solid({ ...o, parent: torso, size: [0.3, 0.22, 0.17], at: [0, 0.63, 0], built: coat })
        solid({ ...o, parent: torso, size: [0.36, 0.07, 0.17], at: [0, 0.72, 0], shape: 'cyl', rotZ: Math.PI / 2, built: coat })
        solid({ ...o, parent: torso, size: [0.075, 0.07, 0.075], at: [0, 0.76, 0], shape: 'cyl', built: skin })
        solid({ ...o, parent: torso, size: [0.155, 0.19, 0.17], at: [0, 0.83, 0], shape: 'sphere', built: skin })
        solid({ ...o, parent: torso, size: [0.165, 0.15, 0.175], at: [0, 0.865, -0.012], shape: 'sphere', built: hair })

        const fig: Figure = {
          group: g,
          hipL,
          hipR,
          kneeL,
          kneeR,
          shoulderL,
          shoulderR,
          elbowL,
          elbowR,
          torso,
          phase: figures.length * 1.9,
        }
        figures.push({ fig, t0 })
        return fig
      }

      /**
       * One walk cycle, driven off a single phase. The knee only ever bends
       * backwards and the elbow keeps a resting bend, which is what stops the
       * legs hyper-extending and the arms swinging like planks.
       */
      function stride(fig: Figure, phase: number, speed = 1) {
        const p = phase
        const swing = Math.sin(p) * 0.5 * speed
        fig.hipL.rotation.x = swing
        fig.hipR.rotation.x = -swing
        fig.kneeL.rotation.x = -Math.max(0, Math.sin(p + 1.0)) * 0.95 * speed
        fig.kneeR.rotation.x = -Math.max(0, Math.sin(p + 1.0 + Math.PI)) * 0.95 * speed
        fig.shoulderL.rotation.x = -swing * 0.65
        fig.shoulderR.rotation.x = swing * 0.65
        fig.elbowL.rotation.x = -0.25 - Math.max(0, -Math.sin(p)) * 0.35
        fig.elbowR.rotation.x = -0.25 - Math.max(0, Math.sin(p)) * 0.35
        // Bob is twice stride frequency; the sway is once.
        fig.torso.position.y = Math.abs(Math.sin(p)) * 0.014 * speed
        fig.torso.rotation.y = Math.sin(p) * 0.06 * speed
        fig.torso.rotation.z = Math.sin(p) * 0.02 * speed
      }

      // The resident on the balcony, plus two people on the approach.
      const balconyFigure = figure(
        BAL.x,
        BAL.y + 0.05,
        BAL.z - 0.2,
        sExt[0] + 0.14,
        '#2c3138',
        '#6d6660',
      )
      const walkers = [
        figure(-2.2, 0, GF.d / 2 + 2.0, sStruct[0] + 0.18, '#59544d', '#35332f', '#a9815f', '#201c18'),
        figure(1.9, 0, GF.d / 2 + 3.2, sStruct[0] + 0.19, '#7d766c', '#2b2a27', '#d6ad8c', '#4a3a2c'),
      ]

      /* --- 04 · exterior ----------------------------------------------------- */
      type Panel = {
        size: [number, number, number]
        at: [number, number, number]
        tone: string
        glass?: boolean
      }
      const panels: Panel[] = []
      const bayW = GF.w / 3

      // Front elevation of the ground floor: two glazed bays and one solid.
      for (let i = 0; i < 3; i++) {
        const x = GF.x - GF.w / 2 + bayW / 2 + i * bayW
        const glass = i !== 2
        panels.push({
          size: [bayW - 0.05, GF.h - 0.12, 0.09],
          at: [x, GF_Y, GF.z + GF.d / 2],
          glass,
          tone: glass ? PALETTE.glass : PALETTE.plaster,
        })
      }
      // Rear elevation: solid, with one charcoal bay for relief.
      for (let i = 0; i < 3; i++) {
        const x = GF.x - GF.w / 2 + bayW / 2 + i * bayW
        panels.push({
          size: [bayW - 0.05, GF.h - 0.12, 0.09],
          at: [x, GF_Y, GF.z - GF.d / 2],
          tone: i === 1 ? PALETTE.charcoal : PALETTE.plaster,
        })
      }
      panels.push({
        size: [0.09, GF.h - 0.12, GF.d - 0.1],
        at: [GF.x - GF.w / 2, GF_Y, GF.z],
        tone: PALETTE.timber,
      })
      // Upper volume: glazed to the balcony, charcoal elsewhere.
      panels.push({
        size: [UF.w - 0.08, UF.h - 0.34, 0.09],
        at: [UF.x, UF_Y + 0.05, UF.z + UF.d / 2],
        glass: true,
        tone: PALETTE.glass,
      })
      panels.push({
        size: [UF.w - 0.08, UF.h - 0.12, 0.09],
        at: [UF.x, UF_Y, UF.z - UF.d / 2],
        tone: PALETTE.charcoal,
      })
      ;[-1, 1].forEach((s) =>
        panels.push({
          size: [0.09, UF.h - 0.12, UF.d - 0.08],
          at: [UF.x + (s * UF.w) / 2, UF_Y, UF.z],
          tone: s === 1 ? PALETTE.charcoal : PALETTE.grey,
        }),
      )

      /* Garage: solid on three sides, with a header and two piers on the front
       * so the opening stays clear and the parked car reads from outside. */
      const openW = 1.7
      const pier = (GAR.w - openW) / 2
      panels.push({
        size: [GAR.w - 0.06, GAR.h - 0.12, 0.09],
        at: [GAR.x, SLAB + GAR.h / 2, GAR.z - GAR.d / 2],
        tone: PALETTE.plaster,
      })
      ;[-1, 1].forEach((s) =>
        panels.push({
          size: [0.09, GAR.h - 0.12, GAR.d - 0.06],
          at: [GAR.x + (s * GAR.w) / 2, SLAB + GAR.h / 2, GAR.z],
          tone: s === 1 ? PALETTE.plaster : PALETTE.grey,
        }),
      )
      ;[-1, 1].forEach((s) =>
        panels.push({
          size: [pier, GAR.h - 0.12, 0.12],
          at: [GAR.x + s * (openW / 2 + pier / 2), SLAB + GAR.h / 2, GAR.z + GAR.d / 2],
          tone: PALETTE.plaster,
        }),
      )
      panels.push({
        size: [openW, 0.34, 0.12],
        at: [GAR.x, SLAB + GAR.h - 0.2, GAR.z + GAR.d / 2],
        tone: PALETTE.charcoal,
      })

      panels.forEach((p, i) => {
        const at = sExt[0] + (i / panels.length) * 0.12
        const outward = new THREE.Vector3(p.at[0], p.at[1], p.at[2])
          .sub(new THREE.Vector3(GF.x, GF_Y, GF.z))
          .normalize()
          .multiplyScalar(2.4)
        solid({
          size: p.size,
          at: p.at,
          t0: at,
          t1: at + 0.065,
          reveal: 'fly',
          from: [p.at[0] + outward.x, p.at[1] + 0.6, p.at[2] + outward.z],
          draft: p.glass ? '#0b2b45' : '#10324e',
          built: p.tone,
          glass: p.glass,
          metalness: p.glass ? 0.5 : 0,
          roughness: p.glass ? 0.1 : 0.85,
        })
      })

      /* Balcony: slab, glass balustrade, slim top rail. */
      solid({
        size: [BAL.w, 0.1, BAL.d],
        at: [BAL.x, BAL.y, BAL.z],
        t0: sExt[0] + 0.1,
        t1: sExt[0] + 0.15,
        reveal: 'fly',
        from: [BAL.x, BAL.y + 1.6, BAL.z],
        draft: '#15456b',
        built: PALETTE.concrete,
      })
      solid({
        size: [BAL.w, 0.5, 0.04],
        at: [BAL.x, BAL.y + 0.3, BAL.z + BAL.d / 2],
        t0: sExt[0] + 0.13,
        t1: sExt[0] + 0.18,
        reveal: 'grow',
        draft: '#0b2b45',
        built: '#4d5a63',
        glass: true,
        metalness: 0.5,
        roughness: 0.1,
      })
      solid({
        size: [BAL.w, 0.05, 0.1],
        at: [BAL.x, BAL.y + 0.57, BAL.z + BAL.d / 2],
        t0: sExt[0] + 0.14,
        t1: sExt[0] + 0.19,
        reveal: 'fade',
        draft: '#1b4e78',
        built: '#3c3a36',
        metalness: 0.5,
        roughness: 0.4,
      })
      ;[-1, 1].forEach((s) =>
        solid({
          size: [0.04, 0.5, BAL.d],
          at: [BAL.x + (s * BAL.w) / 2, BAL.y + 0.3, BAL.z],
          t0: sExt[0] + 0.15,
          t1: sExt[0] + 0.2,
          reveal: 'grow',
          draft: '#0b2b45',
          built: '#4d5a63',
          glass: true,
          metalness: 0.5,
          roughness: 0.1,
        }),
      )

      // Roofs with overhang, and the soffit over the entrance.
      solid({
        size: [UF.w + 0.5, 0.14, UF.d + 0.5],
        at: [UF.x, ROOF_Y + 0.07, UF.z],
        t0: sExt[0] + 0.13,
        t1: sExt[0] + 0.18,
        reveal: 'fly',
        from: [UF.x, ROOF_Y + 2.6, UF.z],
        draft: '#15456b',
        built: PALETTE.roof,
      })
      solid({
        size: [GAR.w + 0.5, 0.13, GAR.d + 0.5],
        at: [GAR.x, SLAB + GAR.h + 0.065, GAR.z],
        t0: sExt[0] + 0.15,
        t1: sExt[0] + 0.19,
        reveal: 'fly',
        from: [GAR.x, SLAB + GAR.h + 2.2, GAR.z],
        draft: '#15456b',
        built: PALETTE.roof,
      })
      solid({
        size: [GF.w - UF.w + 0.3, 0.12, UF.d - 0.5],
        at: [GF.x + GF.w / 2 - (GF.w - UF.w) / 2 + 0.15, SLAB + GF.h + 0.06, UF.z],
        t0: sExt[0] + 0.17,
        t1: sExt[1] - 0.02,
        reveal: 'fade',
        draft: '#15456b',
        built: PALETTE.concrete,
      })

      /* --- 05 · interior ------------------------------------------------------
       * Read through the glazing from outside rather than flown into: the
       * interior is built, lit and furnished, and the camera pulls back. */
      const INT = sInt[0]
      solid({
        size: [GF.w - 0.3, 0.05, GF.d - 0.3],
        at: [GF.x, SLAB + 0.03, GF.z],
        t0: INT,
        t1: INT + 0.03,
        built: '#a2957f',
        builtOnly: true,
      })
      const interiorKit: SolidOpts[] = [
        { size: [0.08, GF.h - 0.2, 1.9], at: [0.9, GF_Y, -0.5], t0: INT + 0.02, t1: INT + 0.06, reveal: 'grow', built: '#efece6', builtOnly: true },
        { size: [1.8, 0.16, 0.8], at: [-1.4, SLAB + 0.5, 0.3], t0: INT + 0.04, t1: INT + 0.08, reveal: 'rise', built: '#2f2d2a', builtOnly: true },
        { size: [1.9, 0.42, 0.85], at: [0.5, SLAB + 0.26, 0.9], t0: INT + 0.05, t1: INT + 0.09, reveal: 'rise', built: '#b7b1a7', builtOnly: true },
        { size: [1.0, 0.07, 0.6], at: [0.5, SLAB + 0.4, 0.1], t0: INT + 0.06, t1: INT + 0.1, reveal: 'rise', built: '#6a6158', builtOnly: true },
        { size: [0.1, 0.95, 0.1], at: [-2.0, SLAB + 0.55, -0.9], t0: INT + 0.07, t1: INT + 0.11, reveal: 'grow', built: '#3a3835', builtOnly: true },
        { size: [1.6, 0.3, 2.0], at: [UF.x - 0.5, SLAB + GF.h + 0.3, UF.z - 0.4], t0: INT + 0.08, t1: INT + 0.12, reveal: 'rise', built: '#c6c0b6', builtOnly: true },
      ]
      interiorKit.forEach((o) => solid(o))

      /* --- lighting ------------------------------------------------------------ */
      const ambient = new THREE.HemisphereLight(0xdceaff, 0x8a9472, 0.35)
      scene.add(ambient)
      const sun = new THREE.DirectionalLight(0xfff1dc, 0)
      sun.position.set(9, 11, 7)
      sun.castShadow = true
      sun.shadow.mapSize.set(2048, 2048)
      Object.assign(sun.shadow.camera, { near: 1, far: 60, left: -16, right: 16, top: 14, bottom: -8 })
      sun.shadow.camera.updateProjectionMatrix()
      sun.shadow.bias = -0.0008
      scene.add(sun)
      const bounce = new THREE.DirectionalLight(0xcfe0f2, 0.25)
      bounce.position.set(-8, 4, -7)
      scene.add(bounce)
      // Cold rim that only exists while the house is still a drawing.
      const rim = new THREE.DirectionalLight(0x4ea2ff, 1.1)
      rim.position.set(-5, 3, 7)
      scene.add(rim)
      const interiorLight = new THREE.PointLight(0xffc17a, 0, 10, 2)
      interiorLight.position.set(-0.4, SLAB + GF.h * 0.7, 0.2)
      scene.add(interiorLight)

      /* --- camera path ---------------------------------------------------------
       * Ends on a wide establishing shot of the finished house in its
       * landscape. No fly-through: the interior is read through the glazing. */
      const keys: { t: number; pos: [number, number, number]; look: [number, number, number] }[] = [
        { t: 0.0, pos: [8.5, 9.4, 12.5], look: [0, 0.3, 0] },
        { t: 0.18, pos: [10.5, 5.8, 11.0], look: [0, 0.7, 0] },
        { t: 0.34, pos: [11.0, 3.6, 9.6], look: [0.4, 1.0, 0] },
        { t: 0.56, pos: [8.0, 2.8, 10.2], look: [0.2, 1.3, 0] },
        { t: 0.78, pos: [2.2, 2.3, 9.0], look: [-0.3, 1.5, 0] },
        { t: 0.88, pos: [0.4, 2.0, 8.2], look: [-0.5, 1.6, 0] },
        { t: 1.0, pos: [4.0, 7.0, 19.5], look: [0.6, 1.2, -0.5] },
      ]
      const camPos = new THREE.Vector3()
      const camLook = new THREE.Vector3()
      const kA = new THREE.Vector3()
      const kB = new THREE.Vector3()

      function sampleCamera(t: number, fit: number) {
        let i = 0
        while (i < keys.length - 2 && t > keys[i + 1]!.t) i++
        const a = keys[i]!
        const b = keys[i + 1]!
        const local = smooth(clamp01((t - a.t) / (b.t - a.t)))
        kA.set(...a.pos)
        kB.set(...b.pos)
        camPos.lerpVectors(kA, kB, local)
        kA.set(...a.look)
        kB.set(...b.look)
        camLook.lerpVectors(kA, kB, local)
        // Narrow frames pull back along the view axis so the house still fills
        // the canvas edge to edge instead of leaving dead margin.
        if (fit !== 1) camPos.sub(camLook).multiplyScalar(fit).add(camLook)
      }

      /* --- sizing -------------------------------------------------------------
       * Split in two, because the two halves cost wildly different amounts.
       * Reframing is a matrix update; resizing the drawing buffer reallocates
       * it on the GPU. During the finale's size transition the element changes
       * on every frame, so only the cheap half runs that often.
       *
       * The canvas is CSS-sized at 100%, so a buffer that is briefly the wrong
       * shape is simply stretched to fit — and because the projection is
       * already correct for the new shape, the stretch cancels it out and the
       * image stays geometrically true while it catches up.
       * ----------------------------------------------------------------------- */
      let fit = 1
      let resizeTimer = 0

      const reframe = () => {
        const { clientWidth: w, clientHeight: h } = mount
        if (!w || !h) return
        camera.aspect = w / h
        fit = Math.min(1.8, Math.max(0.9, 1.08 / camera.aspect))
        camera.updateProjectionMatrix()
      }

      const resizeBuffer = () => {
        const { clientWidth: w, clientHeight: h } = mount
        if (!w || !h) return
        renderer.setSize(w, h, false)
      }

      reframe()
      resizeBuffer()

      const ro = new ResizeObserver(() => {
        reframe()
        window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(resizeBuffer, 140)
      })
      ro.observe(mount)

      /* --- loop ---------------------------------------------------------------- */
      const reduced = prefersReducedMotion()
      let eased = reduced ? 1 : 0
      let raf = 0
      let visible = true
      let time = 0
      const tmpColor = new THREE.Color()
      const clock = new THREE.Clock()

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = !!entry?.isIntersecting
        },
        { rootMargin: '160px' },
      )
      io.observe(mount)

      parts.forEach((p) => {
        p.mesh.geometry.computeBoundingBox()
        p.mesh.userData.baseScaleY = p.mesh.scale.y
      })

      const tick = () => {
        raf = requestAnimationFrame(tick)
        if (!visible) {
          clock.getDelta()
          return
        }
        time += clock.getDelta()

        const target = reduced ? 1 : progressRef.current
        eased += (target - eased) * 0.085

        // How real the building is: drives colour, sky, light and the drawing
        // fading out from under it.
        const built = smooth(win(eased, sExt[0] + 0.08, sExt[1]))
        const lit = win(eased, INT, INT + 0.1)

        for (const p of parts) {
          const t = win(eased, p.t0, p.t1)
          const mat = p.mesh.material as import('three').MeshStandardMaterial
          // Glazing settles translucent so the finished interior reads through it.
          const cap = p.glass ? 0.4 + 0.45 * (1 - built) : 1
          mat.opacity = t * cap
          mat.transparent = mat.opacity < 0.995
          p.mesh.visible = mat.opacity > 0.002
          mat.color.copy(
            p.builtOnly ? p.built : tmpColor.copy(p.draft).lerp(p.built, built),
          )
          if (p.glass) mat.emissiveIntensity = lit * 0.5

          switch (p.reveal) {
            case 'rise':
              p.mesh.position.y = p.rest.y - (1 - t) * 0.7
              break
            case 'grow': {
              const base = p.mesh.userData.baseScaleY as number
              const half = (p.mesh.geometry.boundingBox?.max.y ?? 0.5) * base
              p.mesh.scale.y = Math.max(0.0001, base * t)
              p.mesh.position.y = p.rest.y - (1 - t) * half
              break
            }
            case 'fly':
              if (p.from) p.mesh.position.lerpVectors(p.from, p.rest, t)
              break
            case 'fade':
              break
          }
        }

        /* Figures. The resident paces the balcony; the two on the approach
         * walk the path. Limbs swing from their joints off one sine. */
        for (const { fig, t0 } of figures) {
          const alive = win(eased, t0, t0 + 0.05)
          fig.group.visible = alive > 0.01
          if (alive <= 0.01) continue
          fig.group.scale.setScalar(alive)
        }

        /* The resident walks the balcony, turning at each end. Heading is
         * eased rather than flipped, so the turn is a pivot instead of a snap. */
        const balTravel = Math.sin(time * 0.38)
        const balSpeed = Math.abs(Math.cos(time * 0.38))
        stride(balconyFigure, time * 2.2, 0.35 + balSpeed * 0.75)
        balconyFigure.group.position.x = BAL.x + balTravel * (BAL.w / 2 - 0.4)
        balconyFigure.group.rotation.y =
          (Math.PI / 2) * Math.tanh(Math.cos(time * 0.38) * 4)

        walkers.forEach((w, i) => {
          const t = time * 0.26 + i * 2.2
          const along = Math.sin(t)
          const speed = Math.abs(Math.cos(t))
          stride(w, time * 2.0 + w.phase, 0.3 + speed * 0.8)
          w.group.position.z = GF.d / 2 + 2.0 + i * 1.3 + along * 1.8
          // Walking along Z, so face down the path rather than across it.
          w.group.rotation.y = Math.cos(t) > 0 ? 0 : Math.PI
        })

        for (const l of lines) {
          const t = win(eased, l.t0, l.t1)
          const mat = l.line.material as import('three').LineBasicMaterial
          mat.opacity = t * (1 - built * 0.97)
          l.line.visible = mat.opacity > 0.01
        }

        const gridMat = grid.material as import('three').Material
        gridMat.opacity = win(eased, 0, 0.05) * (1 - built * 0.92)

        // Blueprint night becomes a sunlit morning.
        skyUniforms.uTop.value.copy(tmpColor.copy(NIGHT).lerp(DAY_TOP, built))
        skyUniforms.uBottom.value.copy(tmpColor.copy(NIGHT).lerp(DAY_LOW, built))
        sun.intensity = built * 2.9
        ambient.intensity = 0.35 + built * 0.95
        rim.intensity = 1.1 * (1 - built)
        interiorLight.intensity = lit * 7

        sampleCamera(eased, fit)
        camera.position.copy(camPos)
        camera.lookAt(camLook)

        renderer.render(scene, camera)
      }

      tick()

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.clearTimeout(resizeTimer)
        io.disconnect()
        ro.disconnect()
        disposables.forEach((d) => d.dispose())
        renderer.dispose()
        renderer.domElement.remove()
      }
      ScrollTrigger.refresh()
    })()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [progressRef])

  return <div ref={host} aria-hidden="true" className={className} />
}
