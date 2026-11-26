import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { asset } from '../../router'
import './ecosystem-beams.css'
import { SolarIcon } from '../ui/SolarIcon'
import { SHINE } from '../ui/shine'
import { triggerEdgeGlow } from '../ui/edgeGlow'

/* ---------- Иконки узлов — набор Solar Linear ---------- */
const I = {
  calc: <SolarIcon name="talent" size={20} />,
  mentor: <SolarIcon name="mentor" size={20} />,
  idea: <SolarIcon name="idea" size={20} />,
  team: <SolarIcon name="team" size={20} />,
  collab: <SolarIcon name="collab" size={20} />,
  experts: <SolarIcon name="star" size={20} />,
}

/* Цвета направлений — из карты талантов: личный путь — «Видение», идеи и команды — «Креатив»,
   развитие экосистемы — «Стратегия». Центр (общая основа) остаётся фирменным акцентом. */
const GROUP_COLOR = ['#5b6cff', '#ff4d5e', '#ffd23f'] as const
/** Светлая середина блика: цвет направления, смешанный с белым */
const tint = (c: string, t = 0.55) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
  const m = (v: number) => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0')
  return `#${m(r)}${m(g)}${m(b)}`
}
const groupVars = (g: number) => ({ '--bc': GROUP_COLOR[g], '--bc-mid': tint(GROUP_COLOR[g]) }) as CSSProperties

/* Тайминг энергии: один цикл луча и сдвиг между лучами */
const BEAM_DURATION = 4
const BEAM_STEP = 0.6
/** Длина импульса в пикселях */
const PULSE_LENGTH = 90
/** Доля цикла, за которую импульс проходит линию; остальное — пауза */
const BEAM_TRAVEL = 0.6

type NodeProps = { icon: ReactNode; title: string; caption: string; status?: string; group: number }

const Node = forwardRef<HTMLDivElement, NodeProps>(({ icon, title, caption, status, group }, ref) => (
  <div ref={ref} className="bnode edge-glow" style={groupVars(group)}>
    <span className="bnode-ico" aria-hidden="true">{icon}</span>
    <div>
      <h4>{title}</h4>
      <p>{caption}</p>
    </div>
    {status && <span className="bnode-status">{status}</span>}
  </div>
))
Node.displayName = 'Node'

/* ---------- Расчёт линий: дерево от логотипа вниз ----------
   Десктоп: ствол из-под круга с логотипом, развилка к плашкам направлений,
   от каждой плашки — ветки к её блокам (входят в блок сверху по центру).
   Телефон: ствол по оси круга вниз, к каждому блоку поворот вправо. */
const TREE_MQ = '(min-width: 1025px)'
/** К какой плашке направления относится каждый блок */
const GROUP_OF = [0, 0, 1, 1, 2, 2]

function useBeamPaths(
  container: RefObject<HTMLElement>, hub: RefObject<HTMLElement>,
  groups: RefObject<HTMLElement>[], nodes: RefObject<HTMLElement>[],
) {
  // у каждой линии — участки: на десктопе «до плашки направления» и «после неё», на телефоне один участок
  const [state, setState] = useState<{ w: number; h: number; paths: string[][] }>({ w: 0, h: 0, paths: [] })

  useLayoutEffect(() => {
    const calc = () => {
      const c = container.current
      const h = hub.current
      if (!c || !h) return
      const cr = c.getBoundingClientRect()
      const rel = (r: DOMRect) => ({
        l: r.left - cr.left, r: r.right - cr.left, t: r.top - cr.top, b: r.bottom - cr.top,
        cx: r.left - cr.left + r.width / 2, cy: r.top - cr.top + r.height / 2,
      })
      const H = rel(h.getBoundingClientRect())
      const tree = window.matchMedia(TREE_MQ).matches
      const paths = nodes.map((n, i) => {
        const g = groups[GROUP_OF[i]]?.current
        if (!n.current || !g) return [] as string[]
        const N = rel(n.current.getBoundingClientRect())
        if (tree) {
          const G = rel(g.getBoundingClientRect())
          // ствол → S-изгиб к плашке → сквозь плашку → S-изгиб к блоку
          const yA = H.b + 18
          const k1 = (G.t - yA) * 0.55
          const yB = G.b + 6
          const k2 = (N.t - yB) * 0.55
          return [
            `M${H.cx},${H.b} L${H.cx},${yA} C${H.cx},${yA + k1} ${G.cx},${G.t - k1} ${G.cx},${G.t} L${G.cx},${yB}`,
            `M${G.cx},${yB} C${G.cx},${yB + k2} ${N.cx},${N.t - k2} ${N.cx},${N.t}`,
          ]
        }
        // телефон: вниз по оси центра, затем поворот к блоку
        const x = H.cx
        const r = Math.min(16, Math.max(0, N.l - x))
        return [`M${x},${H.b} L${x},${N.cy - r} Q${x},${N.cy} ${x + r},${N.cy} L${N.l},${N.cy}`]
      })
      setState({ w: cr.width, h: cr.height, paths })
    }
    calc()
    const ro = new ResizeObserver(calc)
    if (container.current) ro.observe(container.current)
    window.addEventListener('resize', calc)
    document.fonts?.ready.then(calc)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', calc)
    }
  }, [])

  return state
}

export default function EcosystemBeams() {
  const container = useRef<HTMLDivElement>(null)
  const hub = useRef<HTMLDivElement>(null)
  const n1 = useRef<HTMLDivElement>(null)
  const n2 = useRef<HTMLDivElement>(null)
  const n3 = useRef<HTMLDivElement>(null)
  const n4 = useRef<HTMLDivElement>(null)
  const n5 = useRef<HTMLDivElement>(null)
  const n6 = useRef<HTMLDivElement>(null)
  const g1 = useRef<HTMLDivElement>(null)
  const g2 = useRef<HTMLDivElement>(null)
  const g3 = useRef<HTMLDivElement>(null)
  const { w, h, paths } = useBeamPaths(container, hub, [g1, g2, g3], [n1, n2, n3, n4, n5, n6])

  // Появление схемы: когда она входит в экран — класс is-in (центр проявляется, линии прорисовываются,
  // затем направления и блоки). Если схема снова целиком ушла вниз за экран — класс снимается,
  // и при следующем входе появление повторится. Сдвигов (transform) нет: они сбили бы расчёт линий.
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = container.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setShown(true)
      else if (e.boundingClientRect.top > window.innerHeight) setShown(false)
    }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const svgRef = useRef<SVGSVGElement>(null)
  const nodeRefs = [n1, n2, n3, n4, n5, n6]

  // Анимация импульсов. Каждый импульс — один штрих с плавным градиентом (как блик кнопки в шапке).
  // Каждый кадр штрих сдвигается вдоль линии, а градиент поворачивается по хорде от хвоста к голове
  // импульса — так цвет течёт гладко и повторяет изгибы.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !paths.length) return
    // участки линии i: базовые пути, импульсы и градиенты — по атрибутам data-i / data-k
    const q = <T extends Element>(sel: string, i: number) =>
      [...svg.querySelectorAll<T>(`${sel}[data-i="${i}"]`)].sort((a, b) => Number(a.getAttribute('data-k')) - Number(b.getAttribute('data-k')))
    const lines = paths.map((_, i) => {
      const segs = q<SVGPathElement>('.beam-base', i)
      const lens = segs.map((b) => b.getTotalLength())
      return { segs, lens, len: lens.reduce((x, y) => x + y, 0), pulses: q<SVGPathElement>('.beam-pulse', i), grads: q<SVGLinearGradientElement>('.beam-pulse-grad', i) }
    })
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const nodes = nodeRefs.map((r) => r.current)
    // Точка касания импульса — конец линии; переводим её в координаты блока для свечения границы
    const cr = container.current?.getBoundingClientRect()
    nodes.forEach((node, i) => {
      const L = lines[i]
      const last = L?.segs[L.segs.length - 1]
      if (!node || !cr || !last) return
      const end = last.getPointAtLength(L.lens[L.lens.length - 1])
      const nr = node.getBoundingClientRect()
      node.style.setProperty('--hit-x', `${end.x - (nr.left - cr.left)}px`)
      node.style.setProperty('--hit-y', `${end.y - (nr.top - cr.top)}px`)
    })
    const lastHit = lines.map(() => -1)
    // Точка на линии; за её концами — продолжение по касательной, чтобы градиент не сжимался на входе и выходе
    const pointAt = (b: SVGPathElement, len: number, p: number) => {
      if (p < 0) {
        const a = b.getPointAtLength(0), c = b.getPointAtLength(Math.min(1, len))
        return { x: a.x + (c.x - a.x) * p, y: a.y + (c.y - a.y) * p }
      }
      if (p > len) {
        const a = b.getPointAtLength(len), c = b.getPointAtLength(Math.max(0, len - 1))
        const e = p - len
        return { x: a.x + (a.x - c.x) * e, y: a.y + (a.y - c.y) * e }
      }
      return b.getPointAtLength(p)
    }

    let raf = 0
    let running = false
    const start = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const t = (now - start) / 1000
      lines.forEach((L, i) => {
        const len = L.len
        if (!len) return
        const total = Math.min(PULSE_LENGTH, len * 0.6)
        const cyclePos = (t - i * BEAM_STEP) / BEAM_DURATION
        const cycle = Math.floor(cyclePos)
        let phase = cyclePos % 1
        if (phase < 0) phase += 1
        const progress = phase / BEAM_TRAVEL
        // Голова импульса дошла до блока — вспышка границы, один раз за цикл.
        // Проверяем до выхода из функции, чтобы не пропустить касание, если кадр пришёл с опозданием.
        if (progress * (len + total) >= len && lastHit[i] !== cycle && cyclePos >= 0) {
          lastHit[i] = cycle
          triggerEdgeGlow(nodes[i])
        }
        const head = progress * (len + total)
        const tail = head - total
        // импульс — по каждому участку свой штрих: на стыке он переходит из одного цвета в другой
        let offset = 0
        L.segs.forEach((seg, k) => {
          const pulse = L.pulses[k], grad = L.grads[k], sl = L.lens[k]
          const h = head - offset, tl = tail - offset
          offset += sl
          if (!pulse || !grad) return
          if (progress > 1 || h <= 0 || tl >= sl) { pulse.style.opacity = '0'; return }
          pulse.style.opacity = '1'
          pulse.style.strokeDasharray = `${total} ${sl * 3 + total}`
          pulse.style.strokeDashoffset = `${-tl}`
          const p0 = pointAt(seg, sl, tl), p1 = pointAt(seg, sl, h)
          grad.setAttribute('x1', `${p0.x}`); grad.setAttribute('y1', `${p0.y}`)
          grad.setAttribute('x2', `${p1.x}`); grad.setAttribute('y2', `${p1.y}`)
        })
      })
    }
    const play = () => { if (!running) { running = true; raf = requestAnimationFrame(frame) } }
    const stop = () => { running = false; cancelAnimationFrame(raf) }

    // Пауза, когда схема вне экрана или вкладка свёрнута
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : stop()))
    io.observe(svg)
    const onVis = () => (document.hidden ? stop() : play())
    document.addEventListener('visibilitychange', onVis)
    return () => { stop(); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [paths, w, h]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`beams beams-reveal${shown ? ' is-in' : ''}`}
      ref={container}
      role="img"
      aria-label="Схема экосистемы SoulVibe: общая основа — методология и игровая философия; направления — личный путь, идеи и команды, развитие экосистемы"
    >
      <svg ref={svgRef} className="beams-svg" width={w} height={h} viewBox={`0 0 ${w || 1} ${h || 1}`} aria-hidden="true">
        <defs>
          {/* Профиль блика кнопки в шапке: прозрачно → edge → mid → core → mid → edge → прозрачно */}
          {/* Профиль блика: участок до плашки направления — фирменный (как блик кнопки в шапке),
              после плашки — в цвете направления: край — цвет, середина светлее, центр белый */}
          {paths.flatMap((parts, i) => parts.map((_, k) => {
            const accent = parts.length > 1 && k === 0
            const edge = accent ? SHINE.edge : GROUP_COLOR[GROUP_OF[i]]
            const mid = accent ? SHINE.mid : tint(edge)
            return (
              <linearGradient key={`${i}-${k}`} id={`beam-pulse-grad-${i}-${k}`} className="beam-pulse-grad" data-i={i} data-k={k} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={edge} stopOpacity="0" />
                <stop offset="0.22" stopColor={edge} stopOpacity="0.6" />
                <stop offset="0.4" stopColor={mid} />
                <stop offset="0.5" stopColor={SHINE.core} />
                <stop offset="0.6" stopColor={mid} />
                <stop offset="0.78" stopColor={edge} stopOpacity="0.6" />
                <stop offset="1" stopColor={edge} stopOpacity="0" />
              </linearGradient>
            )
          }))}
        </defs>
        {/* is-accent — участок от логотипа до плашки направления: в фирменном цвете */}
        <g className="beam-glow">
          {paths.flatMap((parts, i) => parts.map((d, k) => (
            <path key={`${i}-${k}`} d={d} className={`beam-base${parts.length > 1 && k === 0 ? ' is-accent' : ''}`} data-i={i} data-k={k} pathLength={1} style={groupVars(GROUP_OF[i])} />
          )))}
        </g>
        {paths.flatMap((parts, i) => parts.map((d, k) => (
          <path key={`p${i}-${k}`} d={d} className={`beam-pulse${parts.length > 1 && k === 0 ? ' is-accent' : ''}`} data-i={i} data-k={k} stroke={`url(#beam-pulse-grad-${i}-${k})`} style={groupVars(GROUP_OF[i])} />
        )))}
      </svg>

      <div className="beams-hub-wrap">
        <div className="beams-hub-text">
          <span className="mono">Общая основа</span>
          <b>Методология и игровая философия</b>
        </div>
        <div className="beams-hub" ref={hub}>
          <span className="beams-hub-mark" aria-hidden="true"><img src={asset('/logo.svg')} alt="" /></span>
        </div>
      </div>

      {/* На десктопе группы «растворяются» (display: contents) и раскладываются в одну сетку:
          личный путь слева, идеи и команды справа, между ними проходит ствол;
          развитие экосистемы — внизу по центру, на продолжении ствола */}
      <div className="beams-tree">
        <div className="tree-group" style={{ '--from': 1, '--span': 2 } as CSSProperties}>
          <div className="tree-label" ref={g1} style={groupVars(0)}>Личный путь</div>
          <Node ref={n1} group={0} icon={I.calc} title="Расчёт таланта" caption="бесплатно, на сайте · узнаёте роль" />
          <Node ref={n2} group={0} icon={I.mentor} title="ИИ-ментор" caption="Telegram-бот · узнаёте персонажа" />
        </div>
        <div className="tree-group" style={{ '--from': 4, '--span': 2 } as CSSProperties}>
          <div className="tree-label" ref={g2} style={groupVars(1)}>Идеи и команды</div>
          <Node ref={n3} group={1} icon={I.idea} title="SoulMind" caption="игра для идей · индивидуально или командой" />
          <Node ref={n4} group={1} icon={I.team} title="Dream Team" caption="программа для собственников и руководителей" />
          <p className="beams-note">Мероприятия проходят в форматах SoulMind и Dream Team</p>
        </div>
        <div className="tree-group is-center" style={{ '--from': 1, '--span': 5 } as CSSProperties}>
          <div className="tree-label" ref={g3} style={groupVars(2)}>Развитие экосистемы</div>
          <Node ref={n5} group={2} icon={I.collab} title="Коллаборации с брендами" caption="украшения, ароматы, одежда и другие направления" status="Направление открыто для обсуждения" />
          <Node ref={n6} group={2} icon={I.experts} title="Коллаборации с лидерами мнений, экспертами" caption="Совместные продукты и партнёрская программа с вознаграждением 50% за привлечённых пользователей." />
        </div>
      </div>
    </div>
  )
}
