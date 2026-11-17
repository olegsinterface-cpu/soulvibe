import type { CSSProperties } from 'react'
import { Link } from '../router'
import { ROLE_FAN } from '../content'
import { Arrow } from './Icons'
import { TiltCard } from './ui/TiltCard'
import './role-fan.css'

/* Альтернативный вариант секции «Роль и персонаж»:
   веер карточек — в центре Королева, по бокам скрытые персонажи (сильно размыты, без имён),
   под веером — талант этой роли, заголовок и одна кнопка. */

// Порядок слева направо; 0 — центральная карточка
const SLOTS = [-2, -1, 0, 1, 2] as const
// --k — сдвиг и наклон по знаку, --a — удалённость от центра (уменьшение, опускание, слой)
const slot = (pos: number) => ({ '--k': pos, '--a': Math.abs(pos), zIndex: 3 - Math.abs(pos) }) as CSSProperties

export default function RoleFan() {
  let hidden = 0
  return (
    <section className="section role-fan" id="role">
      <div className="role-fan-bg" aria-hidden="true" />
      <div className="wrap role-fan-inner">
        <span className="sec-label mono">Роль и персонаж</span>

        <div className="fan">
          {SLOTS.map((pos) => {
            if (pos === 0) {
              return (
                <TiltCard as="figure" className="fan-card is-main" key={pos} style={slot(pos)}>
                  <div className="fan-photo">
                    <img src="/characters/queen.jpg" alt="Персонаж Королева: девушка в голубом платье на белом троне среди облаков" width="753" height="1000" />
                    <figcaption>Королева</figcaption>
                    <div className="fan-talent">
                      <b>{ROLE_FAN.role}</b>
                      <p>{ROLE_FAN.talent}</p>
                    </div>
                  </div>
                </TiltCard>
              )
            }
            const src = `/characters/hidden-${++hidden}.jpg`
            return (
              <div className={`fan-card is-hidden${Math.abs(pos) === 2 ? ' is-far' : ''}`} key={pos} style={slot(pos)} aria-hidden="true">
                <div className="fan-photo"><img src={src} alt="" /></div>
              </div>
            )
          })}
        </div>

        <h2>{ROLE_FAN.title}</h2>
        <p className="fan-lead">{ROLE_FAN.lead}</p>
        <Link to="/raschet" className="btn btn-primary">Узнать свою роль <Arrow /></Link>
      </div>
    </section>
  )
}
