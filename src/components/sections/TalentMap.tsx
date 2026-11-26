import { useEffect, useRef, useState } from 'react'
import { asset } from '../../router'
import { SHINE } from '../ui/shine'
import './talent-map.css'

/* «Карта талантов» — по схеме заказчика, в стиле схемы экосистемы.
   Слева путь идеи (6 шагов), справа карта: в центре «Идея», вокруг 6 талантов.
   Цвета шести кругов — как на исходной схеме. Импульсы бегут по связям от центра к узлам. */

const C = {
  red: '#ff4d5e',
  orange: '#ff8a3d',
  yellow: '#ffd23f',
  green: '#3ddc84',
  sky: '#9fd8ff',
  blue: '#5b6cff',
}

/* Путь идеи: сверху вниз */
const STEPS = [
  { text: 'Проводит в форму', color: C.red },
  { text: 'Выводит идею в свет', color: C.orange },
  { text: 'Монетизирует идею', color: C.yellow },
  { text: 'Продаёт и продвигает', color: C.green },
  { text: 'Реализует в системе', color: C.sky },
  { text: 'Масштабирует идею', color: C.blue },
]

/* Карта: координаты в системе 860×600, подписи — слева или справа от узла */
const W = 860
const H = 600
const HUB = { x: 430, y: 300 }
const NODES = [
  { id: 'vision', title: 'Видение', roles: 'инвестор, визионер / меценат, советник совета директоров', color: C.blue, x: 280, y: 150, side: 'l', pos: 'up' },
  { id: 'creative', title: 'Креатив', roles: 'сценарист, продуктолог, креативный директор', color: C.red, x: 580, y: 150, side: 'r', pos: 'up' },
  { id: 'manage', title: 'Управление', roles: 'проджект-менеджер, операционный директор, руководитель команды', color: C.sky, x: 150, y: 300, side: 'l', pos: 'up' },
  { id: 'comm', title: 'Коммуникация', roles: 'директор по маркетингу, PR-директор, бизнес-девелопер', color: C.orange, x: 710, y: 300, side: 'r', pos: 'down' },
  { id: 'promo', title: 'Продвижение', roles: 'директор по продажам, режиссёр, менеджер по развитию', color: C.green, x: 280, y: 450, side: 'l', pos: 'down' },
  { id: 'strategy', title: 'Стратегия', roles: 'CEO / продюсер, стратегический консультант, финансовый директор', color: C.yellow, x: 580, y: 450, side: 'r', pos: 'down' },
] as const

/* Связь от центра к узлу: выходит из центра горизонтально и плавно поворачивает к узлу */
const link = (n: { x: number; y: number }) =>
  `M${HUB.x},${HUB.y} C${(HUB.x + n.x) / 2},${HUB.y} ${n.x},${(HUB.y + n.y) / 2} ${n.x},${n.y}`

/* Волна пути идеи: кольца на крайних точках, касательная в них вертикальная */
const ROW = 84
const XL = 104
const XR = 216
const ringX = (i: number) => (i % 2 === 0 ? XL : XR)
const ringY = (i: number) => 42 + i * ROW
const WAVE_H = STEPS.length * ROW + 20
const wavePath = (() => {
  const k = ROW * 0.62
  let d = `M${XR},0 C${XR},${ringY(0) - k} ${XL},${ringY(0) - k} ${XL},${ringY(0)}`
  for (let i = 1; i < STEPS.length; i++) {
    d += ` C${ringX(i - 1)},${ringY(i - 1) + k} ${ringX(i)},${ringY(i) - k} ${ringX(i)},${ringY(i)}`
  }
  const last = STEPS.length - 1
  d += ` C${ringX(last)},${ringY(last) + k} ${XR},${WAVE_H - 10} ${XR},${WAVE_H}`
  return d
})()

/* Сгусток энергии: тёмная стеклянная сфера со светящимся ободком, внутри вращаются цветные всполохи,
   в центре дышит белое ядро. Нарисован в радиусе 24 и масштабируется под нужный размер. */
function EnergyOrb({ uid, x, y, r, color, delay = 0, order = 0 }: { uid: string; x: number; y: number; r: number; color: string; delay?: number; order?: number }) {
  const anim = { animationDelay: `${delay}s` }
  const wisp = `url(#${uid}-wisp)`
  return (
    <g transform={`translate(${x} ${y}) scale(${r / 24})`} className="tmap-orb" style={{ color }}>
      <defs>
        <radialGradient id={`${uid}-body`}>
          <stop offset="0" stopColor={color} stopOpacity="0.55" />
          <stop offset="0.6" stopColor={color} stopOpacity="0.18" />
          <stop offset="0.86" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`}>
          <stop offset="0.3" stopColor={color} stopOpacity="0.45" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-wisp`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-core`}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-blur`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" /></filter>
        <clipPath id={`${uid}-clip`}><circle r="23" /></clipPath>
      </defs>
      {/* появление: шар «вспыхивает» из точки (см. tmap.is-in) */}
      <g className="tmap-orb-pop" style={{ ['--o' as string]: order } as React.CSSProperties}>
      <circle r="48" fill={`url(#${uid}-halo)`} className="tmap-orb-halo" style={anim} />
      <circle r="24" fill="#15181b" />
      <circle r="24" fill={`url(#${uid}-body)`} />
      <g clipPath={`url(#${uid}-clip)`}>
        {/* Всполохи вращаются в разные стороны; прозрачный круг держит центр вращения */}
        <g className="tmap-swirl" style={anim} filter={`url(#${uid}-blur)`}>
          <circle r="24" fill="none" />
          <ellipse cx="-9" cy="-4" rx="13" ry="6" fill={wisp} transform="rotate(-30 -9 -4)" />
          <ellipse cx="8" cy="7" rx="12" ry="5" fill={wisp} transform="rotate(25 8 7)" />
        </g>
        <g className="tmap-swirl is-rev" style={anim} filter={`url(#${uid}-blur)`}>
          <circle r="24" fill="none" />
          <ellipse cx="6" cy="-10" rx="10" ry="4" fill={wisp} transform="rotate(15 6 -10)" />
          <ellipse cx="-6" cy="11" rx="9" ry="4" fill={wisp} transform="rotate(-20 -6 11)" />
        </g>
      </g>
      <circle r="9" fill={`url(#${uid}-core)`} className="tmap-core" style={anim} />
      <circle r="24" className="tmap-orb-rim" />
      <ellipse cx="-8" cy="-13" rx="7" ry="3.5" fill="#fff" opacity="0.22" transform="rotate(-30 -8 -13)" />
      </g>
    </g>
  )
}

/* Градиент импульса: прозрачно на концах → цвет → белое ядро, как в схеме экосистемы */
function PulseGrad({ id, color }: { id: string; color: string }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor={color} stopOpacity="0" />
      <stop offset="0.22" stopColor={color} stopOpacity="0.6" />
      <stop offset="0.4" stopColor={color} />
      <stop offset="0.5" stopColor={SHINE.core} />
      <stop offset="0.6" stopColor={color} />
      <stop offset="0.78" stopColor={color} stopOpacity="0.6" />
      <stop offset="1" stopColor={color} stopOpacity="0" />
    </linearGradient>
  )
}

/* Импульсы: штрих движется вдоль линии, градиент поворачивается по хорде от хвоста к голове —
   импульс плавно появляется в начале линии и растворяется в конце (как в схеме экосистемы) */
const hexRgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
/* Длина вдоль линии до ближайшей к каждой точке позиции (точки вида "x,y;x,y") */
function lengthsAt(path: SVGPathElement, points: string) {
  const len = path.getTotalLength()
  return points.split(';').map((pt) => {
    const [x, y] = pt.split(',').map(Number)
    let best = 0, bestD = Infinity
    for (let l = 0; l <= len; l += 2) {
      const p = path.getPointAtLength(l)
      const d = (p.x - x) ** 2 + (p.y - y) ** 2
      if (d < bestD) { bestD = d; best = l }
    }
    return best
  })
}

function usePulses(root: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = root.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = [...el.querySelectorAll<SVGPathElement>('.tmap-pulse')].map((path) => ({
      path,
      grad: el.querySelector<SVGLinearGradientElement>(`#${path.dataset.grad}`),
      len: path.getTotalLength(),
      size: Number(path.dataset.size) || 90,
      travel: Number(path.dataset.travel) || 2.6, // секунды на проход
      cycle: Number(path.dataset.cycle) || 4.6, // период повтора
      delay: Number(path.dataset.delay) || 0,
      // Для волны: цвета шаров и их положение вдоль линии — импульс берёт цвет шара, из которого вышел;
      // первая точка — начало линии: до первого шара импульс акцентного цвета
      colors: path.dataset.colors ? path.dataset.colors.split(',').map(hexRgb) : null,
      marks: path.dataset.points ? lengthsAt(path, path.dataset.points) : [],
    }))
    const stopsOf = (g: SVGLinearGradientElement | null) =>
      g ? [...g.querySelectorAll('stop')].filter((st) => st.getAttribute('offset') !== '0.5') : []
    const stops = items.map((it) => (it.colors ? stopsOf(it.grad) : []))
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
    let raf = 0, running = false
    const start = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const t = (now - start) / 1000
      for (const it of items) {
        if (!it.grad || !it.len) continue
        const total = Math.min(it.size, it.len * 0.6)
        let phase = ((t - it.delay) % it.cycle) / it.travel
        if (phase < 0) phase += it.cycle / it.travel
        if (phase > 1) { it.path.style.opacity = '0'; continue }
        const ease = phase < 0.5 ? 2 * phase * phase : 1 - Math.pow(-2 * phase + 2, 2) / 2
        const head = ease * (it.len + total)
        const tail = head - total
        it.path.style.opacity = '1'
        it.path.style.strokeDasharray = `${total} ${it.len * 3 + total}`
        it.path.style.strokeDashoffset = `${-tail}`
        if (it.colors && it.marks.length) {
          const mid = (head + tail) / 2
          let k = 0
          while (k + 1 < it.marks.length && mid > it.marks[k + 1] - 14) k++
          // мягкий переход цвета, пока импульс проходит через шар
          const next = Math.min(k + 1, it.colors.length - 1)
          const t = next === k ? 0 : Math.min(1, Math.max(0, (mid - (it.marks[next] - 14)) / 28))
          const c = it.colors[k].map((v, j) => Math.round(v + (it.colors![next][j] - v) * t))
          const css = `rgb(${c.join(',')})`
          for (const st of stops[items.indexOf(it)]) st.setAttribute('stop-color', css)
        }
        const p0 = pointAt(it.path, it.len, tail), p1 = pointAt(it.path, it.len, head)
        it.grad.setAttribute('x1', `${p0.x}`); it.grad.setAttribute('y1', `${p0.y}`)
        it.grad.setAttribute('x2', `${p1.x}`); it.grad.setAttribute('y2', `${p1.y}`)
      }
    }
    const play = () => { if (!running) { running = true; raf = requestAnimationFrame(frame) } }
    const stop = () => { running = false; cancelAnimationFrame(raf) }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : stop()))
    io.observe(el)
    const onVis = () => (document.hidden ? stop() : play())
    document.addEventListener('visibilitychange', onVis)
    return () => { stop(); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [root])
}

/* withPath — показывать ли слева путь идеи (в «Игровой философии» — только карта) */
export default function TalentMap({ withPath = true }: { withPath?: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  usePulses(root)
  // Появление схемы, когда она входит в экран: линии прорисовываются, центр проявляется,
  // шары по очереди вспыхивают, затем подписи. Если схема снова ушла вниз за экран — повторится.
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = root.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setShown(true)
      else if (e.boundingClientRect.top > window.innerHeight) setShown(false)
    }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className={`tmap tmap-reveal${shown ? ' is-in' : ''}${withPath ? '' : ' is-map-only'}`} ref={root}>
      <h2 className="tmap-title">Карта талантов</h2>
      {/* Путь идеи */}
      {withPath && (
      <div className="tmap-path">
        <span className="tmap-pill">Идея</span>
        <div className="tmap-wave" style={{ height: WAVE_H }}>
          <svg viewBox={`0 0 320 ${WAVE_H}`} width="320" height={WAVE_H} aria-hidden="true">
            <path d={wavePath} className="tmap-line tmap-glow" pathLength={1} />
            <defs><PulseGrad id="tm-pulse-wave" color={SHINE.mid} /></defs>
            <path d={wavePath} className="tmap-pulse" stroke="url(#tm-pulse-wave)"
              data-grad="tm-pulse-wave" data-size="120" data-travel="6" data-cycle="8"
              data-colors={['#bdffff', ...STEPS.map((x) => x.color)].join(',')}
              data-points={[`${XR},0`, ...STEPS.map((_, i) => `${ringX(i)},${ringY(i)}`)].join(';')} />
            {STEPS.map((s, i) => (
              <EnergyOrb key={s.text} uid={`tw-${i}`} x={ringX(i)} y={ringY(i)} r={13} color={s.color} delay={i * -1.3} order={i} />
            ))}
          </svg>
          <ol className="tmap-steps">
            {STEPS.map((s, i) => (
              <li key={s.text} className={i % 2 === 0 ? 'is-l' : 'is-r'} style={{ ['--o' as string]: i, top: ringY(i), left: i % 2 === 0 ? XL + 26 : undefined, right: i % 2 === 0 ? undefined : 320 - XR + 26 }}>
                {s.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
      )}

      {/* Карта талантов */}
      <div className="tmap-map">
        <div className="tmap-canvas" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              {NODES.map((n) => <PulseGrad key={n.id} id={`tm-pulse-${n.id}`} color={n.color} />)}
              <radialGradient id="tm-hub" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#bdffff" stopOpacity="0.45" />
                <stop offset="0.45" stopColor="#1787b3" stopOpacity="0.28" />
                <stop offset="1" stopColor="#1787b3" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Каркас: сетка и рамки через узлы */}
            <g className="tmap-grid">
              {[150, 280, 430, 580, 710].map((x) => <line key={`v${x}`} x1={x} y1="60" x2={x} y2="540" />)}
              {[150, 300, 450].map((y) => <line key={`h${y}`} x1="90" y1={y} x2="770" y2={y} />)}
            </g>
            <g className="tmap-line tmap-glow">
              <rect x="280" y="150" width="300" height="300" rx="56" pathLength={1} />
              <rect x="150" y="80" width="560" height="440" rx="72" pathLength={1} />
              <circle cx={HUB.x} cy={HUB.y} r="170" pathLength={1} />
              <path d={`M280,150 Q${HUB.x},${HUB.y} 580,450`} pathLength={1} />
              <path d={`M580,150 Q${HUB.x},${HUB.y} 280,450`} pathLength={1} />
              {NODES.map((n) => <path key={n.id} d={link(n)} pathLength={1} />)}
            </g>
            {/* Импульсы от центра к узлам — цветом узла */}
            {NODES.map((n, i) => (
              <path key={n.id} d={link(n)} className="tmap-pulse" stroke={`url(#tm-pulse-${n.id})`}
                data-grad={`tm-pulse-${n.id}`} data-size="90" data-travel="2.4" data-cycle="4.8" data-delay={i * 0.8} />
            ))}

            {/* Центр */}
            <circle cx={HUB.x} cy={HUB.y} r="120" fill="url(#tm-hub)" />

            {/* Узлы: сгустки энергии цветов исходной схемы */}
            {NODES.map((n, i) => <EnergyOrb key={n.id} uid={`tm-${n.id}`} x={n.x} y={n.y} r={24} color={n.color} delay={i * -1.7} order={i} />)}
          </svg>

          {/* Центр: круг с логотипом и подпись «Идея» */}
          <div className="tmap-hub" style={{ left: `${(HUB.x / W) * 100}%`, top: `${(HUB.y / H) * 100}%` }}>
            <span className="tmap-hub-mark" aria-hidden="true"><img src={asset('/logo.svg')} alt="" /></span>
          </div>
          <span className="tmap-pill tmap-hub-pill" style={{ left: `${(HUB.x / W) * 100}%`, top: `${((HUB.y + 74) / H) * 100}%` }}>Идея</span>

          {/* Подписи узлов */}
          {NODES.map((n) => (
            <div key={n.id} className={`tmap-label is-${n.side} is-${n.pos}`} style={{
              ['--o' as string]: NODES.indexOf(n),
              /* Тултип над или под узлом, уголок указывает на шар */
              ...(n.pos === 'up'
                ? { bottom: `${((H - n.y + 40) / H) * 100}%` }
                : { top: `${((n.y + 40) / H) * 100}%` }),
              ...(n.side === 'l'
                ? { right: `${((W - n.x - 30) / W) * 100}%` }
                : { left: `${((n.x - 30) / W) * 100}%` }),
              ['--c' as string]: n.color,
            }}>
              <b>{n.title}</b>
              {/* Каждая должность — своей строкой */}
              <span>{n.roles.split(', ').map((r) => <span key={r}>{r}</span>)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
