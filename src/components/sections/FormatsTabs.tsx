import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, asset, useLocation } from '../../router'
import { DIALOG, FORMATS, LINKS, type FormatId } from '../../content'
import { Arrow } from '../ui/Icons'
import { SolarIcon } from '../ui/SolarIcon'
import { letters, useScrollParts } from '../ui/letters'
import './formats-tabs.css'

/* Облегчённый вариант секции «Форматы работы»:
   сверху выбор хода (вкладки), ниже — один формат за раз.
   В карточке: название, задача, три коротких пункта, одна кнопка и ссылка на кейс; справа — простая схема. */

const IDS: FormatId[] = ['mentor', 'soulmind', 'dreamteam']
const TITLE = 'Выберите формат под свою задачу'
const SUB = 'Все форматы опираются на одну методологию — начните с того, что вам сейчас нужно.'
const count = (t: string) => t.replace(/\s/g, '').length

export default function FormatsTabs() {
  const { hash } = useLocation()
  const fromHash = IDS.find((id) => hash === `format-${id}`)
  const [active, setActive] = useState<FormatId>(fromHash ?? 'mentor')
  // Переход по ссылке /#format-… (например, из схемы экосистемы) открывает нужную вкладку
  useEffect(() => { if (fromHash) setActive(fromHash) }, [fromHash])

  const f = FORMATS[active]

  // Анимация секции: заголовок и текст по буквам (вслед за прокруткой), переключатель поднимается снизу;
  // когда карточки входят в экран (is-in) — левая выезжает слева, правая справа, затем по очереди
  // появляются сообщения диалога или шаги. Если секция снова ушла вниз за экран — появление повторится.
  const sectionRef = useRef<HTMLElement>(null)
  const panelWrap = useRef<HTMLDivElement>(null)
  useScrollParts(sectionRef)
  const visualRef = useRef<HTMLDivElement>(null)
  const shown = useInView(panelWrap, 0.2)
  // правая карточка (диалог / шаги) — по своему входу в экран: на телефоне она ниже левой,
  // и анимация не должна отыграть раньше, чем до неё долистали
  const visualIn = useInView(visualRef, 0.3)
  // диалог стартует, когда в экран вошёл верх диалога (метка в 160px от верха) — сообщения заполняют его сверху вниз
  // метка лежит внутри вкладки «Хочу работать над собой» и пересоздаётся при переключении вкладок —
  // поэтому храним сам элемент в состоянии: наблюдение переподключается к новой метке
  const [chatEnd, setChatEnd] = useState<HTMLSpanElement | null>(null)
  const chatIn = useInViewEl(chatEnd, 0, '0px 0px -8% 0px')

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

  // Диалог появляется как в мессенджере: новое сообщение возникает внизу и выталкивает прошлые вверх.
  // Высоту блока задаёт невидимая полная копия диалога — блок не растягивается во время показа.
  const [msgCount, setMsgCount] = useState<number>(DIALOG.length)
  useEffect(() => {
    if (active !== 'mentor' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMsgCount(DIALOG.length)
      return
    }
    // пока до диалога не долистали — он пуст (высоту держит невидимая копия)
    if (!chatIn) { setMsgCount(0); return }
    setMsgCount(0)
    let n = 0
    let t = window.setTimeout(function tick() {
      n += 1
      setMsgCount(n)
      if (n < DIALOG.length) t = window.setTimeout(tick, 400) // между сообщениями — 0,4 с
    }, 250) // первое сообщение — через 0,25 с после появления карточки
    return () => window.clearTimeout(t)
  }, [chatIn, active])

  const cta = active === 'mentor'
    ? <a href={LINKS.bot} target="_blank" rel="noreferrer" className="btn btn-primary">{f.cta} <Arrow /></a>
    : <Link to="/#contacts" className="btn btn-primary">{f.cta} <Arrow /></Link>


  return (
    <section className="section" id="formats" ref={sectionRef}>
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-label mono">Форматы работы</span>
          <h2 className="sl" data-sp aria-label={TITLE} style={{ ['--n' as string]: count(TITLE) }}>
            <span aria-hidden="true">{letters(TITLE, 0)}</span>
          </h2>
          <p className="sub sl" data-sp aria-label={SUB} style={{ ['--n' as string]: count(SUB) }}>
            <span aria-hidden="true">{letters(SUB, 0)}</span>
          </p>
        </div>

        <div className="ft-seg-row sp-rise" data-sp>
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

        <div className={`ft-reveal${shown ? ' is-in' : ''}`} ref={panelWrap}>
        <article className="ft-panel" id="ft-panel" role="tabpanel" aria-labelledby={`ft-tab-${active}`} key={active}>
          <div className="ft-main ft-info">
            <div className="ft-top">
              <span className="ft-eyebrow"><b className="gt">{f.name}</b><span>{f.kind}</span></span>
              <Link to={`/#${f.caseId}`} className="ft-case-chip" aria-label={f.caseLabel}>Пример <Arrow size={14} /></Link>
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

          <div className={`ft-visual${visualIn ? ' is-in' : ''}`} ref={visualRef}>
            {active === 'mentor' ? (
              <>
                <span className="ft-visual-label">Пример диалога</span>
                <div className="ft-chat-box">
                  <span className="ft-chat-end" ref={setChatEnd} aria-hidden="true" />
                  {/* невидимая полная копия — держит высоту блока */}
                  <div className="ft-chat is-ghost" aria-hidden="true">
                    {DIALOG.map((m, i) => (
                      <div key={i} className="ft-msg-wrap"><div className="ft-msg-in">
                      <div className={`ft-msg ${m.from}`}>
                        <span className="ft-avatar" aria-hidden="true">
                          {m.from === 'user'
                            ? <SolarIcon name="user" size={18} />
                            : <span className="ft-avatar-mark"><img src={asset('/logo.svg')} alt="" /></span>}
                        </span>
                        <p className={`ft-bubble ${m.from}`}>{m.text}</p>
                      </div>
                      </div></div>
                    ))}
                  </div>
                  <div className="ft-chat is-live">
                    {DIALOG.slice(0, msgCount).map((m, i) => (
                      // обёртка раскрывается по высоте снизу — прошлые сообщения плавно поднимаются
                      <GrowWrap key={i}><div className="ft-msg-in">
                      <div className={`ft-msg ${m.from}`}>
                        <span className="ft-avatar" aria-hidden="true">
                          {m.from === 'user'
                            ? <SolarIcon name="user" size={18} />
                            : <span className="ft-avatar-mark"><img src={asset('/logo.svg')} alt="" /></span>}
                        </span>
                        <p className={`ft-bubble ${m.from}`}>{m.text}</p>
                      </div>
                      </div></GrowWrap>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="ft-visual-label">{f.stepsLabel}</span>
                <ol className="ft-steps">
                  {f.steps.map(([t, d], i) => <li key={t} style={{ ['--i' as string]: i }}><b>{t}</b><span>{d}</span></li>)}
                </ol>
              </>
            )}
          </div>
        </article>
        </div>

        {/* На телефоне переход к сотрудничеству — внизу секции (вверху он скрыт) */}
        <Link to="/#brands" className="ft-brand is-bottom">
          <span><span className="ft-brand-k">Мы бренд</span>Сотрудничество</span>
          <span className="go"><Arrow /></span>
        </Link>
      </div>
    </section>
  )
}

/** true, когда элемент входит в экран; сбрасывается, когда он снова целиком ниже экрана — появление повторится */
function useInView(ref: React.RefObject<HTMLElement>, threshold: number, rootMargin = '0px') {
  return useInViewEl(ref.current, threshold, rootMargin, ref)
}

/** То же по самому элементу: если элемент пересоздан, наблюдение переключается на новый */
function useInViewEl(node: HTMLElement | null, threshold: number, rootMargin = '0px', ref?: React.RefObject<HTMLElement>) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref?.current ?? node
    if (!el) { setInView(false); return }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setInView(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true)
      else if (e.boundingClientRect.top > window.innerHeight) setInView(false)
    }, { threshold, rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [node, ref, threshold, rootMargin])
  return inView
}

/** Новое сообщение в чате: место под него плавно раскрывается по высоте, соседние сообщения сдвигаются без рывков.
 *  Высота считается от реального размера, а отрицательные поля обёртки (запас под свечение аватара) растут вместе с ней,
 *  поэтому в первый кадр сообщение занимает ровно 0 px. */
function GrowWrap({ children }: { children: React.ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const w = el.current
    if (!w || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const h = w.offsetHeight
    const m = getComputedStyle(w).marginTop
    const a = w.animate(
      [{ height: '0px', marginTop: '0px', marginBottom: '0px' }, { height: `${h}px`, marginTop: m, marginBottom: m }],
      { duration: 450, easing: 'cubic-bezier(.22, 1, .36, 1)' },
    )
    return () => a.cancel()
  }, [])
  return <div ref={el} className="ft-msg-wrap">{children}</div>
}
