import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from '../router'
import { Arrow } from './Icons'
import './cases-carousel.css'

/* Карусель кейсов в объёме: активная карточка по центру, две другие — повёрнуты к ней, размыты и позади.
   Переключение: стрелки, точки, клик по боковой карточке, свайп, клавиши ← →.
   Ссылки /#case-… открывают нужный кейс. */

const Chevron = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export type CaseCard = {
  id: string
  label: string
  title: string
  rows: [string, string][]
  /** визуализация «было → стало» (SoulMind) */
  stages?: { k: string; v: string }[]
  quote?: { text: string; by: string }
  /** to — переход внутри сайта, href — внешняя ссылка */
  cta: { text: string; to?: string; href?: string }
}

export default function CasesCarousel({ items }: { items: CaseCard[] }) {
  const n = items.length
  const { hash } = useLocation()
  const fromHash = items.findIndex((c) => c.id === hash)
  const [active, setActive] = useState(fromHash >= 0 ? fromHash : 0)
  useEffect(() => { if (fromHash >= 0) setActive(fromHash) }, [fromHash])

  const go = (i: number) => setActive(((i % n) + n) % n)
  const prev = () => go(active - 1)
  const next = () => go(active + 1)

  // Свайп на телефоне и перетаскивание мышью
  const drag = useRef<{ x: number; y: number } | null>(null)
  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, y: e.clientY } }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - d.y)) (dx < 0 ? next : prev)()
  }

  // Положение карточки относительно активной: 0 — центр, -1 — слева, 1 — справа
  const offset = (i: number) => {
    let o = i - active
    if (o > n / 2) o -= n
    if (o < -n / 2) o += n
    return o
  }

  return (
    <div
      className="cc"
      role="region"
      aria-roledescription="карусель"
      aria-label="Примеры"
      onKeyDown={(e) => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next() }}
    >
      {/* Якоря для ссылок /#case-…: прокрутка к карусели */}
      {items.map((c) => <span key={c.id} id={c.id} className="cc-anchor" aria-hidden="true" />)}

      <div className="cc-stage" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { drag.current = null }}>
        {/* Стрелки поверх боковых карточек */}
        <button type="button" className="cc-arrow is-prev" onClick={prev} aria-label="Предыдущий пример"><Chevron /></button>
        <button type="button" className="cc-arrow is-next" onClick={next} aria-label="Следующий пример"><Chevron /></button>
        {items.map((c, i) => {
          const o = offset(i)
          const isActive = o === 0
          return (
            <article
              key={c.id}
              className={`cc-card${isActive ? ' is-active' : ''}`}
              style={{ '--o': o, '--a': Math.abs(o) } as React.CSSProperties}
              aria-roledescription="слайд"
              aria-label={`${i + 1} из ${n}: ${c.title}`}
              aria-hidden={!isActive}
              onClick={isActive ? undefined : () => go(i)}
            >
              <span className="cc-label">{c.label}</span>
              <h3>{c.title}</h3>
              <dl className="cc-rows">
                {c.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
              {c.stages && (
                <div className="cc-stages">
                  {c.stages.map((st, j) => (
                    <div key={st.k} style={{ display: 'contents' }}>
                      {j > 0 && <span className="cc-stage-arrow" aria-hidden="true"><Arrow size={18} /></span>}
                      <div className={`cc-stage-box${j === c.stages!.length - 1 ? ' is-last' : ''}`}>
                        <span>{st.k}</span>
                        <b>{st.v}</b>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {c.quote && (
                <figure className="cc-quote">
                  {/* Цитата как выделенный текст: подложка по строкам и курсоры выделения по краям */}
                  <blockquote>
                    <span className="cc-caret is-start" aria-hidden="true" />
                    <mark className="cc-hl">{c.quote.text}</mark>
                    <span className="cc-caret is-end" aria-hidden="true" />
                  </blockquote>
                  <figcaption>
                    {c.quote.by}
                  </figcaption>
                </figure>
              )}
              {c.cta.href
                ? <a href={c.cta.href} target="_blank" rel="noreferrer" className="btn btn-primary cc-cta" tabIndex={isActive ? 0 : -1}>{c.cta.text} <Arrow /></a>
                : <Link to={c.cta.to || '/#contacts'} className="btn btn-primary cc-cta" tabIndex={isActive ? 0 : -1}>{c.cta.text} <Arrow /></Link>}
            </article>
          )
        })}
      </div>

      <div className="cc-nav">
        <div className="cc-dots">
          {items.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`cc-dot${i === active ? ' is-on' : ''}`}
              onClick={() => go(i)}
              aria-label={c.title}
              aria-current={i === active}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
