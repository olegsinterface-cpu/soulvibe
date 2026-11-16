import { useLayoutEffect, useRef, type CSSProperties, type ElementType } from 'react'
import './text-animate.css'

type Props = {
  children: string
  /** Делить по символам или по словам */
  by?: 'character' | 'word'
  animation?: 'slideLeft'
  /** Задержка старта, с */
  delay?: number
  /** Шаг между элементами, с */
  stagger?: number
  /** Длительность появления одного элемента, с */
  duration?: number
  as?: ElementType
  className?: string
  /** Градиент сайта на тексте — один цельный на всю строку */
  gradient?: boolean
}

/** Длительность всей анимации — чтобы следующий элемент стартовал после */
export function textAnimateEnd(text: string, { by = 'character', delay = 0, stagger, duration = 0.3 }: Partial<Props> = {}) {
  const step = stagger ?? (by === 'character' ? 0.012 : 0.035)
  const count = by === 'character' ? text.replace(/\s/g, '').length : text.split(/\s+/).length
  return delay + count * step + duration
}

export function TextAnimate({
  children, by = 'character', animation = 'slideLeft', delay = 0, stagger, duration = 0.3, as: Tag = 'span', className = '', gradient = false,
}: Props) {
  const root = useRef<HTMLElement>(null)

  // Каждой букве — кусок общего градиента по её смещению (offsetLeft не учитывает transform анимации)
  useLayoutEffect(() => {
    if (!gradient) return
    const apply = () => {
      const el = root.current
      if (!el) return
      const w = el.offsetWidth
      el.querySelectorAll<HTMLElement>('.ta-item').forEach((it) => {
        let x = 0
        let n: HTMLElement | null = it
        while (n && n !== el) { x += n.offsetLeft; n = n.offsetParent as HTMLElement | null; if (n === el) break }
        it.style.backgroundSize = `${w}px 100%`
        it.style.backgroundPosition = `${-x}px 0`
      })
    }
    apply()
    document.fonts?.ready.then(apply)
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [gradient, children])

  const step = stagger ?? (by === 'character' ? 0.012 : 0.035)
  const words = children.split(/(\s+)/)
  let i = 0
  const item = (content: string, key: string | number) => {
    const style = { animationDelay: `${(delay + i++ * step).toFixed(3)}s`, animationDuration: `${duration}s` } as CSSProperties
    return <span key={key} className={`ta-item ta-${animation}`} style={style}>{content}</span>
  }

  return (
    <Tag ref={root} className={`ta ${gradient ? 'ta-grad ' : ''}${className}`.trim()} aria-label={children}>
      {words.map((w, wi) => {
        if (/^\s+$/.test(w)) return <span key={wi} aria-hidden="true">{w}</span>
        if (by === 'word') return <span key={wi} aria-hidden="true">{item(w, wi)}</span>
        return (
          <span key={wi} className="ta-word" aria-hidden="true">
            {[...w].map((ch, ci) => item(ch, ci))}
          </span>
        )
      })}
    </Tag>
  )
}
