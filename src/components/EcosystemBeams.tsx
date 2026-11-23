import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { asset } from '../router'
import './ecosystem-beams.css'
import { SolarIcon } from './ui/SolarIcon'
import { SHINE } from './ui/shine'
import { triggerEdgeGlow } from './ui/edgeGlow'

/* ---------- Иконки узлов — набор Solar Linear ---------- */
const I = {
  calc: <SolarIcon name="talent" size={20} />,
  mentor: <SolarIcon name="mentor" size={20} />,
  idea: <SolarIcon name="idea" size={20} />,
  team: <SolarIcon name="team" size={20} />,
  collab: <SolarIcon name="collab" size={20} />,
}

/* Тайминг энергии: один цикл луча и сдвиг между лучами */
const BEAM_DURATION = 4
const BEAM_STEP = 0.6
/** Длина импульса в пикселях */
const PULSE_LENGTH = 90
/** Доля цикла, за которую импульс проходит линию; остальное — пауза */
const BEAM_TRAVEL = 0.6

type NodeProps = { icon: ReactNode; title: string; caption: string; status?: string }

const Node = forwardRef<HTMLDivElement, NodeProps>(({ icon, title, caption, status }, ref) => (
  <div ref={ref} className="bnode edge-glow">
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
const GROUP_OF = [0, 0, 1, 1, 2]

function useBeamPaths(
  container: RefObject<HTMLElement>, hub: RefObject<HTMLElement>,
  groups: RefObject<HTMLElement>[], nodes: RefObject<HTMLElement>[],
) {
  const [state, setState] = useState<{ w: number; h: number; paths: string[] }>({ w: 0, h: 0, paths: [] })

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
        if (!n.current || !g) return ''
        const N = rel(n.current.getBoundingClientRect())
        if (tree) {
          const G = rel(g.getBoundingClientRect())
          // ствол → S-изгиб к плашке → сквозь плашку → S-изгиб к блоку
          const yA = H.b + 18
          const k1 = (G.t - yA) * 0.55
          const yB = G.b + 6
          const k2 = (N.t - yB) * 0.55
          return `M${H.cx},${H.b} L${H.cx},${yA} C${H.cx},${yA + k1} ${G.cx},${G.t - k1} ${G.cx},${G.t}` +
            ` L${G.cx},${yB} C${G.cx},${yB + k2} ${N.cx},${N.t - k2} ${N.cx},${N.t}`
        }
        // телефон: вниз по оси центра, затем поворот к блоку
        const x = H.cx
        const r = Math.min(16, Math.max(0, N.l - x))
        return `M${x},${H.b} L${x},${N.cy - r} Q${x},${N.cy} ${x + r},${N.cy} L${N.l},${N.cy}`
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
  const g1 = useRef<HTMLDivElement>(null)
  const g2 = useRef<HTMLDivElement>(null)
  const g3 = useRef<HTMLDivElement>(null)
  const { w, h, paths } = useBeamPaths(container, hub, [g1, g2, g3], [n1, n2, n3, n4, n5])

  const svgRef = useRef<SVGSVGElement>(null)
  const nodeRefs = [n1, n2, n3, n4, n5]

  // Анимация импульсов. Каждый импульс — один штрих с плавным градиентом (как блик кнопки в шапке).
  // Каждый кадр штрих сдвигается вдоль линии, а градиент поворачивается по хорде от хвоста к голове
  // импульса — так цвет течёт гладко и повторяет изгибы.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !paths.length) return
    const bases = [...svg.querySelectorAll<SVGPathElement>('.beam-base')]
    const pulses = [...svg.querySelectorAll<SVGPathElement>('.beam-pulse')]
    const grads = [...svg.querySelectorAll<SVGLinearGradientElement>('.beam-pulse-grad')]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lens = bases.map((b) => b.getTotalLength())
    const nodes = nodeRefs.map((r) => r.current)
    // Точка касания импульса — конец линии; переводим её в координаты блока для свечения границы
    const cr = container.current?.getBoundingClientRect()
    nodes.forEach((node, i) => {
      if (!node || !cr || !bases[i]) return
      const end = bases[i].getPointAtLength(lens[i])
      const nr = node.getBoundingClientRect()
      node.style.setProperty('--hit-x', `${end.x - (nr.left - cr.left)}px`)
      node.style.setProperty('--hit-y', `${end.y - (nr.top - cr.top)}px`)
    })
    const lastHit = bases.map(() => -1)
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
      bases.forEach((b, i) => {
        const pulse = pulses[i], grad = grads[i], len = lens[i]
        if (!pulse || !grad || !len) return
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
        if (progress > 1) { pulse.style.opacity = '0'; return }
        const head = progress * (len + total)
        const tail = head - total
        pulse.style.opacity = '1'
        pulse.style.strokeDasharray = `${total} ${len * 3 + total}`
        pulse.style.strokeDashoffset = `${-tail}`
        const p0 = pointAt(b, len, tail), p1 = pointAt(b, len, head)
        grad.setAttribute('x1', `${p0.x}`); grad.setAttribute('y1', `${p0.y}`)
        grad.setAttribute('x2', `${p1.x}`); grad.setAttribute('y2', `${p1.y}`)
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
      className="beams"
      ref={container}
      role="img"
      aria-label="Схема экосистемы SoulVibe: общая основа — методология и игровая философия; направления — личный путь, идеи и команды, развитие экосистемы"
    >
      <svg ref={svgRef} className="beams-svg" width={w} height={h} viewBox={`0 0 ${w || 1} ${h || 1}`} aria-hidden="true">
        <defs>
          {/* Профиль блика кнопки в шапке: прозрачно → edge → mid → core → mid → edge → прозрачно */}
          {paths.map((_, i) => (
            <linearGradient key={i} id={`beam-pulse-grad-${i}`} className="beam-pulse-grad" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={SHINE.edge} stopOpacity="0" />
              <stop offset="0.22" stopColor={SHINE.edge} stopOpacity="0.6" />
              <stop offset="0.4" stopColor={SHINE.mid} />
              <stop offset="0.5" stopColor={SHINE.core} />
              <stop offset="0.6" stopColor={SHINE.mid} />
              <stop offset="0.78" stopColor={SHINE.edge} stopOpacity="0.6" />
              <stop offset="1" stopColor={SHINE.edge} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        <g className="beam-glow">{paths.map((d, i) => <path key={i} d={d} className="beam-base" />)}</g>
        {paths.map((d, i) => d && (
          <path key={`p${i}`} d={d} className="beam-pulse" stroke={`url(#beam-pulse-grad-${i})`} />
        ))}
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
          <div className="tree-label" ref={g1}>Личный путь</div>
          <Node ref={n1} icon={I.calc} title="Расчёт таланта" caption="бесплатно, на сайте · узнаёте роль" />
          <Node ref={n2} icon={I.mentor} title="ИИ-ментор" caption="Telegram-бот · узнаёте персонажа" />
        </div>
        <div className="tree-group" style={{ '--from': 4, '--span': 2 } as CSSProperties}>
          <div className="tree-label" ref={g2}>Идеи и команды</div>
          <Node ref={n3} icon={I.idea} title="SoulMind" caption="игра для идей · индивидуально или командой" />
          <Node ref={n4} icon={I.team} title="Dream Team" caption="программа для собственников и руководителей" />
          <p className="beams-note">Мероприятия проходят в форматах SoulMind и Dream Team</p>
        </div>
        <div className="tree-group is-center" style={{ '--from': 1, '--span': 5 } as CSSProperties}>
          <div className="tree-label" ref={g3}>Развитие экосистемы</div>
          <Node ref={n5} icon={I.collab} title="Коллаборации с брендами" caption="украшения, ароматы, одежда и другие направления" status="Направление открыто для обсуждения" />
        </div>
      </div>
    </div>
  )
}
