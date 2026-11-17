import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from '../router'
import { DIALOG, FORMATS, LINKS, type FormatId } from '../content'
import { Arrow } from './Icons'
import './formats-tabs.css'

/* Облегчённый вариант секции «Форматы работы»:
   сверху выбор хода (вкладки), ниже — один формат за раз.
   В карточке: название, задача, три коротких пункта, одна кнопка и ссылка на кейс; справа — простая схема. */

const IDS: FormatId[] = ['mentor', 'soulmind', 'dreamteam']

export default function FormatsTabs() {
  const { hash } = useLocation()
  const fromHash = IDS.find((id) => hash === `format-${id}`)
  const [active, setActive] = useState<FormatId>(fromHash ?? 'mentor')
  // Переход по ссылке /#format-… (например, из схемы экосистемы) открывает нужную вкладку
  useEffect(() => { if (fromHash) setActive(fromHash) }, [fromHash])

  const f = FORMATS[active]

  // Переключатель: светлый бегунок встаёт под выбранную вкладку
  const segRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState<React.CSSProperties>({ opacity: 0 })
  useLayoutEffect(() => {
    const box = segRef.current
    if (!box) return
    const place = () => {
      const btn = box.querySelector<HTMLElement>(`[data-id="${active}"]`)
      if (btn) setThumb({ width: btn.offsetWidth, height: btn.offsetHeight, transform: `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)` })
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(box)
    return () => ro.disconnect()
  }, [active])

  const cta = active === 'mentor'
    ? <a href={LINKS.bot} target="_blank" rel="noreferrer" className="btn btn-primary">{f.cta} <Arrow /></a>
    : <Link to="/#contacts" className="btn btn-primary">{f.cta} <Arrow /></Link>


  return (
    <section className="section" id="formats">
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-label mono">Форматы работы</span>
          <h2>Выберите формат под свою задачу</h2>
          <p className="sub">Все форматы опираются на одну методологию — начните с того, что вам сейчас нужно.</p>
        </div>

        <div className="ft-seg-row">
          {IDS.map((id) => <span key={id} id={`format-${id}`} className="ft-anchor" aria-hidden="true" />)}
          <span className="ft-seg-label">Ваш ход</span>
          {/* Переключатель: светлый «бегунок» переезжает под выбранную вкладку */}
          <div className="ft-seg" role="tablist" aria-label="Ваш ход" ref={segRef}>
            <span className="ft-seg-thumb" aria-hidden="true" style={thumb} />
            {IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`ft-tab-${id}`}
                data-id={id}
                aria-selected={active === id}
                aria-controls="ft-panel"
                className={`ft-seg-btn${active === id ? ' is-active' : ''}`}
                onClick={() => setActive(id)}
              >
                {FORMATS[id].move}
              </button>
            ))}
          </div>
          <Link to="/#brands" className="ft-brand">
            <span><span className="ft-brand-k">Мы бренд</span>Сотрудничество</span>
            <span className="go"><Arrow /></span>
          </Link>
        </div>

        <article className="ft-panel" id="ft-panel" role="tabpanel" aria-labelledby={`ft-tab-${active}`} key={active}>
          <div className="ft-main ft-info">
            <div className="ft-top">
              <span className="ft-eyebrow"><b className="gt">{f.name}</b><span>{f.kind}</span></span>
              <Link to={`/#${f.caseId}`} className="ft-case-chip" aria-label={f.caseLabel}>Кейс <Arrow size={14} /></Link>
            </div>
            <h3>{f.title}</h3>
            <dl className="ft-pair">
              {f.rows.slice(0, 2).map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <div className="ft-bottom">
              <div className="ft-btns">
                {cta}
                {f.cta2 && <Link to="/#contacts" className="btn btn-ghost">{f.cta2}</Link>}
              </div>
              <p className="ft-cond">{f.rows[2]?.[1]}{f.note && <> {f.note}.</>}</p>
            </div>
          </div>

          <div className="ft-visual">
            {active === 'mentor' ? (
              <>
                <span className="ft-visual-label">Пример диалога · демонстрация</span>
                <div className="ft-chat">
                  {DIALOG.slice(0, 3).map((m, i) => <p key={i} className={`ft-bubble ${m.from}`}>{m.text}</p>)}
                </div>
              </>
            ) : (
              <>
                <span className="ft-visual-label">{f.stepsLabel}</span>
                <ol className="ft-steps">
                  {f.steps.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
                </ol>
              </>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
