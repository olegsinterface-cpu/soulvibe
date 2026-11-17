import { useRef, type CSSProperties, type ReactNode } from 'react'
import './tilt-card.css'

/* Карточка, которая наклоняется за курсором и подсвечивается бликом в точке наведения.
   Работает только на устройствах с мышью; при «уменьшении движения» эффект выключен. */

const canTilt = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Props = { className?: string; style?: CSSProperties; as?: 'div' | 'figure'; children: ReactNode }

export function TiltCard({ className = '', style, as: Tag = 'div', children }: Props) {
  const el = useRef<HTMLElement>(null)
  const shine = useRef<HTMLSpanElement>(null)
  const bounds = useRef<DOMRect | null>(null)
  const raf = useRef(0)

  const onEnter = () => {
    if (!el.current || !canTilt()) return
    bounds.current = el.current.getBoundingClientRect()
    el.current.classList.add('is-tilting')
  }

  const onMove = (e: React.PointerEvent) => {
    const b = bounds.current
    if (!b || !el.current) return
    const { clientX, clientY } = e
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      if (!el.current) return
      const x = clientX - b.left - b.width / 2
      const y = clientY - b.top - b.height / 2
      const dist = Math.max(1, Math.hypot(x, y))
      el.current.style.transform =
        `scale3d(1.04, 1.04, 1.04) rotate3d(${(y / 100).toFixed(3)}, ${(-x / 100).toFixed(3)}, 0, ${(Math.log(dist) * 1.6).toFixed(2)}deg)`
      if (shine.current) {
        shine.current.style.backgroundImage =
          `radial-gradient(circle at ${x * 2 + b.width / 2}px ${y * 2 + b.height / 2}px, rgba(255, 255, 255, 0.28), rgba(0, 0, 0, 0.06))`
      }
    })
  }

  const onLeave = () => {
    cancelAnimationFrame(raf.current)
    bounds.current = null
    if (!el.current) return
    el.current.classList.remove('is-tilting')
    el.current.style.transform = ''
    if (shine.current) shine.current.style.backgroundImage = ''
  }

  return (
    <Tag ref={el as never} className={`tilt ${className}`.trim()} style={style} onPointerEnter={onEnter} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
      <span ref={shine} className="tilt-shine" aria-hidden="true" />
    </Tag>
  )
}
