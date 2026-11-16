import { useEffect, useRef, type CSSProperties } from 'react'
import type * as THREE_NS from 'three'

/**
 * ThreeCanvas — обёртка для three.js-сцен на сайте SoulVibe.
 * Берёт на себя: ленивую загрузку three, размер и DPR, паузу вне экрана и в фоновой вкладке,
 * prefers-reduced-motion (один статичный кадр), отсутствие WebGL и полную очистку памяти.
 */

export type SceneContext = {
  THREE: typeof THREE_NS
  scene: THREE_NS.Scene
  camera: THREE_NS.PerspectiveCamera
  renderer: THREE_NS.WebGLRenderer
  /** Контейнер сцены — для чтения размеров и т. п. */
  host: HTMLElement
  isMobile: boolean
  reducedMotion: boolean
}

export type SceneHooks = {
  /** t — секунды с начала (только пока сцена видна), dt — шаг кадра, не больше 0.05 с */
  update?: (t: number, dt: number) => void
  /** Ширина и высота контейнера в CSS-пикселях */
  resize?: (width: number, height: number) => void
  /** Освободить то, что не лежит в scene (текстуры вне материалов, слушатели window и т. п.) */
  dispose?: () => void
}

export type SceneSetup = (ctx: SceneContext) => SceneHooks | void

type Props = {
  setup: SceneSetup
  className?: string
  style?: CSSProperties
  /** Описание для скринридеров; если не задано — canvas скрыт от них как декоративный */
  label?: string
  fov?: number
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function ThreeCanvas({ setup, className = '', style, label, fov = 35 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let cleanup = () => {}

    ;(async () => {
      if (!hasWebGL()) {
        hostRef.current?.setAttribute('data-webgl', 'off')
        return
      }
      const THREE = await import('three')
      const host = hostRef.current
      if (cancelled || !host) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isMobile = window.matchMedia('(max-width: 720px)').matches

      const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setClearColor(0x000000, 0)
      const canvas = renderer.domElement
      canvas.style.display = 'block'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      if (!label) canvas.setAttribute('aria-hidden', 'true')
      host.appendChild(canvas)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100)
      camera.position.set(0, 0, 6)

      const hooks = setup({ THREE, scene, camera, renderer, host, isMobile, reducedMotion }) || {}

      const render = () => renderer.render(scene, camera)
      let raf = 0
      let running = false
      let inView = true
      let t = 0
      let last = 0

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame)
        const dt = Math.min((now - last) / 1000, 0.05)
        last = now
        t += dt
        hooks.update?.(t, dt)
        render()
      }
      const start = () => {
        if (running || reducedMotion || !inView || document.hidden) return
        running = true
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
      const stop = () => {
        running = false
        cancelAnimationFrame(raf)
      }

      const resize = () => {
        const w = host.clientWidth || 1
        const h = host.clientHeight || 1
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        hooks.resize?.(w, h)
        if (!running) render()
      }

      const ro = new ResizeObserver(resize)
      ro.observe(host)
      const io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting
        inView ? start() : stop()
      }, { rootMargin: '100px' })
      io.observe(host)
      const onVisibility = () => (document.hidden ? stop() : start())
      document.addEventListener('visibilitychange', onVisibility)

      resize()
      if (reducedMotion) {
        hooks.update?.(0, 0)
        render()
      } else {
        start()
      }

      cleanup = () => {
        stop()
        ro.disconnect()
        io.disconnect()
        document.removeEventListener('visibilitychange', onVisibility)
        hooks.dispose?.()
        scene.traverse((obj) => {
          const o = obj as THREE_NS.Mesh
          o.geometry?.dispose()
          const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
          mats.forEach((m) => {
            Object.values(m).forEach((v) => {
              if (v && typeof v === 'object' && 'isTexture' in v) (v as THREE_NS.Texture).dispose()
            })
            m.dispose()
          })
        })
        renderer.dispose()
        canvas.remove()
      }
    })()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [setup, fov, label])

  return (
    <div
      ref={hostRef}
      className={className}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
