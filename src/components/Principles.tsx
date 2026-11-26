import { useEffect, useRef, useState, type ReactNode } from 'react'
import { asset } from '../router'
import { TiltCard } from './ui/TiltCard'
import './principles.css'

/* Три принципа «Игровой философии»: серые карточки с приглушёнными иллюстрациями.
   У каждой свой смысловой жест — он запускается, когда карточка в середине экрана, и при наведении:
   Персонаж — по силуэту проходит светлая полоса (образ «надевается»),
   Состояние — фигура медленно «дышит», под ней пульсирует ореол,
   Выбор хода — по карте прорисовывается маршрут к отметке «Месяц 2». */

export type Principle = { title: string; text: string; img: string; pos: 'bottom' | 'top' | 'corner' }
type Gesture = 'outline' | 'breath' | 'route'
const GESTURES: Gesture[] = ['outline', 'breath', 'route']
// маршрут по линии на карте — координаты в долях картинки (viewBox 80×100 = пропорции иллюстрации)
const ROUTE = 'M22.2 55.6 L31 50.4 C35 52.2 37 52.2 39.2 51.6 C43 50.6 45 49.8 46.8 49 C50 47.6 52 45.6 53.8 43.9'

/** true, пока элемент в средней части экрана */
function useCentered<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: '-30% 0px -30% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, on] as const
}

function Card({ p, kind, i }: { p: Principle; kind: Gesture; i: number }) {
  const [ref, centered] = useCentered<HTMLDivElement>()
  const src = { ['--src' as string]: `url(${asset(p.img)})` }
  let fx: ReactNode = null
  if (kind === 'outline') fx = <span className="pr-scan" style={src} />
  if (kind === 'breath') fx = <span className="pr-halo" />
  if (kind === 'route') fx = (
    <>
      <svg className="pr-route" viewBox="0 0 80 100" aria-hidden="true">
        {/* мягкое свечение — широкая полупрозрачная линия под основной (вместо фильтра, который размывает в пиксели) */}
        <path className="glow" pathLength={1} d={ROUTE} />
        <path pathLength={1} d={ROUTE} />
      </svg>
      {/* точки — обычными элементами, а не внутри SVG: так они остаются чёткими при любом масштабе */}
      <span className="pr-dot d1" style={{ left: '27.75%', top: '55.6%' }} />
      <span className="pr-dot d2" style={{ left: '38.75%', top: '50.4%' }} />
      <span className="pr-dot d3" style={{ left: '67.25%', top: '43.9%' }} />
    </>
  )
  return (
    <div ref={ref} className={`pr-cell g-${kind}${centered ? ' is-on' : ''}`} style={{ ['--i' as string]: i }}>
      <TiltCard className={`pa-item is-${p.pos}`}>
        <div className="pr-fig" aria-hidden="true">
          <img src={asset(p.img)} alt="" loading="lazy" />
          {fx}
        </div>
        <div className="pa-panel">
          <h4>{p.title}</h4>
          <p>{p.text}</p>
        </div>
      </TiltCard>
    </div>
  )
}

export default function Principles({ items }: { items: readonly Principle[] }) {
  return (
    <div className="pa-principles sp-stagger" data-sp>
      {items.map((p, i) => <Card key={p.title} p={p} kind={GESTURES[i] ?? 'outline'} i={i} />)}
    </div>
  )
}
