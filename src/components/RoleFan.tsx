import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, asset } from '../router'
import { ROLE_FAN } from '../content'
import { Arrow } from './Icons'
import { TiltCard } from './ui/TiltCard'
import { letters, useScrollParts } from './ui/letters'
import './role-fan.css'

/* Альтернативный вариант секции «Роль и персонаж»:
   веер карточек — в центре Королева, по бокам скрытые персонажи (сильно размыты, без имён),
   под веером — талант этой роли, заголовок и одна кнопка. */

// Порядок слева направо; 0 — центральная карточка
const SLOTS = [-2, -1, 0, 1, 2] as const
// --k — сдвиг и наклон по знаку, --a — удалённость от центра (уменьшение, опускание, слой)
const slot = (pos: number) => ({ '--k': pos, '--a': Math.abs(pos), zIndex: 3 - Math.abs(pos) }) as CSSProperties

const count = (t: string) => t.replace(/\s/g, '').length

export default function RoleFan() {
  let hidden = 0
  const ref = useRef<HTMLElement>(null)
  const fan = useRef<HTMLDivElement>(null)
  useScrollParts(ref)
  // Появление веера: главная карточка поднимается снизу, затем из-за неё в стороны
  // разлетаются остальные и встают на места. Если веер снова ушёл вниз за экран — появление повторится.
  // При уходе вверх карточки вслед за прокруткой собираются обратно за центральную (--ex из useScrollParts).
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = fan.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setShown(true)
      else if (e.boundingClientRect.top > window.innerHeight) setShown(false)
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section className="section role-fan" id="role" ref={ref}>
      <div className="role-fan-bg" aria-hidden="true" />
      <div className="wrap role-fan-inner">
        <span className="sec-label mono">Роль и персонаж</span>

        <div className={`fan fan-reveal${shown ? ' is-in' : ''}`} ref={fan} data-sp data-sp-x="-0.12" data-sp-len="0.32">
          {SLOTS.map((pos) => {
            if (pos === 0) {
              return (
                <TiltCard as="figure" className="fan-card is-main" key={pos} style={slot(pos)}>
                  <div className="fan-photo">
                    <img src={asset('/characters/queen.jpg')} alt="Персонаж Королева: девушка в голубом платье на белом троне среди облаков" width="753" height="1000" />
                    <figcaption>Королева</figcaption>
                    <div className="fan-talent">
                      <b>{ROLE_FAN.role}</b>
                      <p>{ROLE_FAN.talent}</p>
                    </div>
                  </div>
                </TiltCard>
              )
            }
            const src = asset(`/characters/hidden-${++hidden}.jpg`)
            return (
              // внешний блок держит место в веере (сдвиг и поворот), внутренний — наклоняется за курсором
              <div className={`fan-card is-hidden${Math.abs(pos) === 2 ? ' is-far' : ''}`} key={pos} style={slot(pos)} aria-hidden="true">
                <TiltCard className="fan-tilt">
                  <div className="fan-photo"><img src={src} alt="" /></div>
                </TiltCard>
              </div>
            )
          })}
        </div>

        {/* Текст по буквам — как в других секциях: входит снизу и уходит при прокрутке дальше */}
        <h2 className="sl" data-sp aria-label={ROLE_FAN.title} style={{ ['--n' as string]: count(ROLE_FAN.title) }}>
          <span aria-hidden="true">{letters(ROLE_FAN.title, 0)}</span>
        </h2>
        <p className="fan-lead sl" data-sp aria-label={ROLE_FAN.lead} style={{ ['--n' as string]: count(ROLE_FAN.lead) }}>
          <span aria-hidden="true">{letters(ROLE_FAN.lead, 0)}</span>
        </p>
        <Link to="/raschet" className="btn btn-primary">Узнать свою роль <Arrow /></Link>
      </div>
    </section>
  )
}
