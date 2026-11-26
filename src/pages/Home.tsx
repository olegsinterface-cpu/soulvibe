import { useEffect, useRef, useState, type ReactNode } from 'react'
import { letters, useLetterGradient, useScrollParts } from '../components/ui/letters'
import { Link, asset } from '../router'
import { CHARACTERS, HERO, LINKS, ROLE_CARD, ROLE_TABLE, TERMS } from '../content'
import { Arrow, ArrowDown } from '../components/Icons'
import EcosystemBeams from '../components/EcosystemBeams'
import HeroDots from '../components/HeroDots'
import RoleFan from '../components/RoleFan'
import FormatsTabs from '../components/FormatsTabs'
import CasesCarousel, { type CaseCard } from '../components/CasesCarousel'
import { TiltCard } from '../components/ui/TiltCard'
import TalentMap from '../components/TalentMap'
import Principles, { type Principle } from '../components/Principles'

/** Заголовок секции: название блока над заголовком. `n` — порядковый номер, на странице не показывается */
function SecHead({ label, title, sub }: { n?: string; label: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="sec-head">
      <span className="sec-label mono">{label}</span>
      <h2>{title}</h2>
      {sub && <p className="sub">{sub}</p>}
    </div>
  )
}

/* ---------------- 01 Hero ---------------- */
/* Прогресс прокрутки первого экрана (0 → 1) — в CSS-переменную --hp:
   слои hero уходят с разной скоростью и мягко гаснут */
function useHeroScroll(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const h = el.offsetHeight || 1
      const p = Math.min(1, Math.max(0, window.scrollY / h))
      el.style.setProperty('--hp', p.toFixed(4))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [ref])
}

const TITLE_START = HERO.title.reduce<number[]>((acc, _l, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + HERO.title[i - 1].replace(/\s/g, '').length)
  return acc
}, [])

function Hero() {
  const ref = useRef<HTMLElement>(null)
  useHeroScroll(ref)
  useLetterGradient(ref)
  return (
    <section className="hero hero-anim" id="top" ref={ref}>
      <HeroDots accent />
      <div className="wrap hero-center">
        <div className="hero-text">
          <h1 aria-label={HERO.title.join(' ')}>
            {HERO.title.map((l, i) => (
              <span key={i} className="ha-line" aria-hidden="true">
                {i === 1 ? <span className="gt">{letters(l, TITLE_START[i])}</span> : letters(l, TITLE_START[i])}
              </span>
            ))}
          </h1>
          {/* Подзаголовок — тем же эффектом по буквам, одновременно с заголовком */}
          <p className="hero-lead" aria-label={HERO.lead}><span aria-hidden="true">{letters(HERO.lead, 0)}</span></p>
          <div className="hero-actions">
            <span className="btn-wow">
              <Link to="/#ecosystem" className="btn btn-primary">
                Исследовать экосистему <ArrowDown />
              </Link>
            </span>
            <Link to="/#contacts" className="btn btn-ghost">Обсудить задачу</Link>
          </div>
          <div className="hero-terms">
            {TERMS.map((t, i) => (
              <div key={t.term} style={{ ['--i' as string]: i }}>
                <b>{t.term}</b>
                <p>{t.def}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 02 Ecosystem tree ---------------- */
function Ecosystem() {
  const ref = useRef<HTMLElement>(null)
  useScrollParts(ref)
  useLetterGradient(ref)
  const t1 = 'Одна основа —'
  const t2 = 'три направления'
  const sub = 'Направления не нужно проходить по порядку: каждое самостоятельно и открыто для своей задачи — личной, командной или партнёрской.'
  const n1 = t1.replace(/\s/g, '').length
  return (
    <section className="section" id="ecosystem" ref={ref}>
      <div className="wrap">
        {/* Заголовок и текст по буквам: появляются при входе секции и уходят при прокрутке дальше */}
        <div className="sec-head">
          <span className="sec-label mono">Экосистема</span>
          <h2 className="sl" data-sp aria-label={`${t1} ${t2}`} style={{ ['--n' as string]: n1 + t2.replace(/\s/g, '').length }}>
            <span aria-hidden="true">{letters(t1, 0)} <span className="gt">{letters(t2, n1)}</span></span>
          </h2>
          <p className="sub sl" data-sp aria-label={sub} style={{ ['--n' as string]: sub.replace(/\s/g, '').length }}>
            <span aria-hidden="true">{letters(sub, 0)}</span>
          </p>
        </div>

        <EcosystemBeams />

        {/* Переходы: при уходе вверх разлетаются в стороны и гаснут */}
        <div className="jumps" data-sp>
          <Link to="/#format-mentor" className="jump">
            <div><span className="mono">для себя</span><b>Личный формат</b></div>
            <span className="go"><Arrow /></span>
          </Link>
          <Link to="/#format-soulmind" className="jump">
            <div><span className="mono">для идеи и команды</span><b>Программы для идей и команд</b></div>
            <span className="go"><Arrow /></span>
          </Link>
          <Link to="/#brands" className="jump">
            <div><span className="mono">для брендов</span><b>Сотрудничество</b></div>
            <span className="go"><Arrow /></span>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 03 Role & character ---------------- */
function RoleCharacter() {
  return (
    <section className="section" id="role">
      <div className="wrap">
        <SecHead
          n="03"
          label="Роль и персонаж"
          title="Роль — для команды, персонаж — для личной работы"
          sub="На сайте вы узнаёте свою роль. Персонаж — её игровой образ — открывается в боте с ИИ-ментором. Ниже — один пример такого соответствия."
        />
        <div className="terms3">
          {['Персонаж', 'Роль', 'Талант'].map((k) => TERMS.find((t) => t.term === k)!).map((t) => (
            <div className="term" key={t.term}>
              <h3>{t.term}</h3>
              <p>{t.def}</p>
            </div>
          ))}
        </div>

        <div className="char-show">
          {CHARACTERS.map((c) => (
            <figure className="char-frame" key={c.name}>
              <div className="char-photo">
                <img src={c.img} alt={c.alt} loading="lazy" width="753" height="1000" />
                <figcaption>{c.name}</figcaption>
              </div>
            </figure>
          ))}
          <div className="char-info">
            <b className="char-info-head">{ROLE_CARD.role}</b>
            <div className="char-info-body">
              <p>{ROLE_CARD.lead}</p>
              <p>{ROLE_CARD.text}</p>
            </div>
          </div>
        </div>

        <div className="match-table" role="table" aria-label="Соответствие: Управленец и Королева / Король">
          <div className="mt-row mt-head" role="row">
            <div role="columnheader"><span className="visually-hidden">Параметр</span></div>
            <div role="columnheader"><span className="sw" />Управленец · команда</div>
            <div role="columnheader"><span className="sw" />Королева / Король · личное</div>
          </div>
          {ROLE_TABLE.map((r) => (
            <div className="mt-row" role="row" key={r.row}>
              <div className="rh" role="rowheader">{r.row}</div>
              <div role="cell"><span className="cell-label">Управленец</span>{r.role}</div>
              <div role="cell"><span className="cell-label">Королева / Король</span>{r.character}</div>
            </div>
          ))}
        </div>
        <p className="pair-note">Это единственный пример, который мы показываем публично. Ваша роль может быть другой — узнать её можно в бесплатном расчёте.</p>
      </div>
    </section>
  )
}

/* Блок «Приглашение брендам» — в конце секции философии */
function Brands() {
  return (
    <div className="brands sp-rise" id="brands" data-sp>
      <div>
        <h3>Брендам, которым близки идеи персонажа и состояния</h3>
        <p className="muted">Если ваш продукт помогает человеку чувствовать себя в своём образе, давайте обсудим, какой может быть коллаборация.</p>
        <div className="tags"><span>Украшения</span><span>Ароматы</span><span>Одежда</span><span>Другие направления</span></div>
      </div>
      <div className="brands-side">
        <span className="status-pill">Направление открыто для обсуждения</span>
        <Link to="/#contacts" className="btn btn-primary">Обсудить коллаборацию <Arrow /></Link>
      </div>
    </div>
  )
}

/* ---------------- 05 Philosophy ----------------
   Под заголовком — три принципа карточками.
   Бренды — в той же секции, сразу под принципами. */
const PRINCIPLES: readonly Principle[] = [
  // pos — где иллюстрация: снизу (текст сверху) или сверху (текст снизу)
  { title: 'Персонаж', text: 'Игровой образ для личной работы. Через него легче пробовать действовать своей сильной стороной.', img: '/philosophy/ill1.png', pos: 'bottom' },
  { title: 'Состояние', text: 'То, с чем вы входите в день. Его можно замечать и настраивать — не ждать, что оно изменится само.', img: '/philosophy/ill2.png', pos: 'top' },
  { title: 'Выбор хода', text: 'Каждый день есть несколько вариантов действий. Игра помогает выбирать осознанно и замечать результат.', img: '/philosophy/ill3.png', pos: 'corner' },
] as const

const SHIFTS = [
  { from: 'от «я»', to: 'к «мы»' },
  { from: 'от должностей', to: 'к природным ролям' },
  { from: 'от универсальных решений', to: 'к персонализации' },
  { from: 'от жёсткой иерархии', to: 'к живым системам и партнёрствам' },
]

const PA_TITLE = 'В центре — идея. Вокруг — шесть ролей'
const PA_NOTE = 'Когда каждый берёт на себя ту часть работы, в которой силён, команда может провести идею от замысла до масштаба'
const nChars = (t: string) => t.replace(/\s/g, '').length

function PhilosophyAir() {
  const ref = useRef<HTMLElement>(null)
  useScrollParts(ref)
  return (
    <>
      <section className="section philo-air" id="philosophy" ref={ref}>
        <div className="wrap">
          <div className="pa-head">
            <span className="sec-label mono">Игровая философия</span>
            {/* Заголовок и подпись под картой — по буквам, вслед за прокруткой */}
            <h2 className="sl" data-sp aria-label={PA_TITLE} style={{ ['--n' as string]: nChars(PA_TITLE) }}>
              <span aria-hidden="true">{letters(PA_TITLE, 0)}</span>
            </h2>
          </div>
          {/* Карта талантов — та же, что на странице расчёта, но без пути идеи */}
          <div className="pa-map">
            <TalentMap withPath={false} />
            <p className="pa-map-note sl" data-sp aria-label={PA_NOTE} style={{ ['--n' as string]: nChars(PA_NOTE) }}>
              <span aria-hidden="true">{letters(PA_NOTE, 0)}</span>
            </p>
            {/* Сдвиги: от старого (зачёркнуто) к новому */}
            {/* Сдвиги и карточки — поднимаются снизу по очереди, вслед за прокруткой */}
            <div className="pa-shifts sp-stagger" data-sp>
              {SHIFTS.map((x, i) => (
                <div className="pa-shift" key={x.to} style={{ ['--i' as string]: i }}>
                  <s>{x.from}</s>
                  <b>{x.to}</b>
                </div>
              ))}
            </div>
          </div>
          {/* Три принципа — карточками в ряд, у каждой свой жест (контур, дыхание, маршрут) */}
          <Principles items={PRINCIPLES} />
          <Brands />
        </div>
      </section>
    </>
  )
}

/* ---------------- 06 Cases ----------------
   Тексты кейсов — из макета заказчика (вайрфрейм кейсов). */
const CASE_CARDS: CaseCard[] = [
  {
    id: 'case-alena', label: 'Личный продукт · Алёна, 36 лет', title: 'Освободить время для своего дела',
    rows: [
      ['Задача', 'За домашними делами и заботой о детях Алёна откладывала своё дело.'],
      ['Что делали', 'Три месяца работала с методом SoulVibe и образом Королевы, училась делегировать.'],
      ['Результат', 'Привлекла помощь по быту, начала вести блог и готовится к запуску бренда натуральной косметики.'],
    ],
    quote: { text: 'Я поняла, что Королева не обязана делать всё сама. Отпустила быт, научилась делегировать, начала вести блог, и у меня скоро запуск моего бренда косметики', by: 'Алёна' },
    cta: { text: 'Познакомиться с ИИ-ментором', href: LINKS.bot },
  },
  {
    id: 'case-soulmind', label: 'SoulMind · история одной игры', title: 'От офлайн-клиники к онлайн-платформе',
    rows: [
      ['Задача', 'Рассмотреть идею клиники улучшения качества жизни.'],
      ['Что делали', 'Обсуждали ресурсы и затраты офлайн-модели с разных позиций.'],
      ['Результат', 'Появилась концепция онлайн-платформы со специалистами из разных регионов. Участники увидели возможности для партнёрства.'],
    ],
    stages: [{ k: 'Исходная идея', v: 'Офлайн-клиника' }, { k: 'Предложенная модель', v: 'Онлайн-платформа' }],
    cta: { text: 'Обсудить участие в SoulMind', to: '/#contacts' },
  },
  {
    id: 'case-dreamteam', label: 'Dream Team · финтех-команда', title: 'Увидеть сильные стороны ядра команды',
    rows: [
      ['Задача', 'Разобраться с мотивацией ключевых людей и позиционированием компании.'],
      ['Что делали', 'Определили роли участников и провели три встречи в течение месяца.'],
      ['Результат', 'Карта сильных сторон команды, миссия и позиционирование, новая продуктовая идея и понимание риска ухода ключевого участника.'],
    ],
    quote: { text: 'Я по-новому узнал ключевых людей, что ими движет и как вести каждого, узнал, что мог потерять одного из них. Появились новые идеи, которые я уже взял в работу', by: 'Антон, основатель w3g.group' },
    cta: { text: 'Обсудить задачу своей команды', to: '/#contacts' },
  },
]

const CASES_TITLE = 'Примеры и отзывы'

function Cases() {
  const ref = useRef<HTMLElement>(null)
  useScrollParts(ref)
  return (
    <section className="section" id="cases" ref={ref}>
      <div className="wrap">
        <div className="sec-head">
          <h2 className="sl" data-sp aria-label={CASES_TITLE} style={{ ['--n' as string]: nChars(CASES_TITLE) }}>
            <span aria-hidden="true">{letters(CASES_TITLE, 0)}</span>
          </h2>
        </div>
        <CasesCarousel items={CASE_CARDS} />
      </div>
    </section>
  )
}

/* ---------------- 07 About ----------------
   Данные — из вайрфрейма: автор Юлия Дмитриева, создатель SoulVibe.
   Биография и методология — тексты заказчика; фото — заглушка. */
const ABOUT_TITLE = 'Кто стоит за SoulVibe'
const ABOUT_QUOTE = 'Я верю, что человек раскрывается через понимание своей природы, состояние игры и осознанное взаимодействие с технологиями.'

function About() {
  const ref = useRef<HTMLElement>(null)
  const block = useRef<HTMLDivElement>(null)
  useScrollParts(ref)
  // Появление блока: фото раскрывается снизу вверх, справа по очереди — имя, роль, регалии, цитата
  // (по буквам), методология и строка о команде. Если блок снова ушёл вниз за экран — повторится.
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = block.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setShown(true)
      else if (e.boundingClientRect.top > window.innerHeight) setShown(false)
    }, { rootMargin: '0px 0px -20% 0px' }) // старт, когда верх блока поднялся на пятую часть экрана — фото ещё в кадре
    io.observe(el)
    return () => io.disconnect()
  }, [])
  // фото проявляется только после загрузки — иначе оно «выскакивает», догрузившись посреди анимации
  const photo = useRef<HTMLImageElement>(null)
  const [photoReady, setPhotoReady] = useState(false)
  useEffect(() => { if (photo.current?.complete) setPhotoReady(true) }, [])
  return (
    <section className="section" id="about" ref={ref}>
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-label mono">О проекте</span>
          <h2 className="sl" data-sp aria-label={ABOUT_TITLE} style={{ ['--n' as string]: nChars(ABOUT_TITLE) }}>
            <span aria-hidden="true">{letters(ABOUT_TITLE, 0)}</span>
          </h2>
        </div>
        <div className={`about about-reveal${shown ? ' is-in' : ''}`} ref={block}>
          {/* Наклон за курсором — как у карточек «Игровой философии» */}
          <TiltCard className={`author-photo${photoReady ? ' is-loaded' : ''}`}>
            <img ref={photo} src={asset('/author.jpg')} alt="Юлия Дмитриева, создатель SoulVibe" width="1166" height="1400" decoding="async" onLoad={() => setPhotoReady(true)} />
          </TiltCard>
          <div className="about-body">
            <div className="about-person">
              <h3>Юлия Дмитриева</h3>
              <span className="about-role">Создатель SoulVibe</span>
            </div>
            {/* Биография: регалии и личное убеждение */}
            <p className="about-creds">Coach ICI, магистратура по психологии, исследования сознания в МГУ.</p>
            {/* Цитата: обычные кавычки, приглушённые */}
            <blockquote className="about-quote" aria-label={`«${ABOUT_QUOTE}»`} style={{ ['--n' as string]: nChars(ABOUT_QUOTE) }}>
              <span aria-hidden="true"><span className="q">«</span>{letters(ABOUT_QUOTE, 0)}<span className="q">»</span></span>
            </blockquote>
            {/* На чём основана методология */}
            <div className="about-method">
              <h4>На чём основана методология SoulVibe</h4>
              <p>Создавая SoulVibe, я объединила свой интерес к исследованиям сознания с изучением архетипов Юнга, «Книги перемен» и Human Design. В работе с человеком я использую ИИ, чтобы подбирать практики с учётом его сильных сторон.</p>
              <p>В моей методологии роль описывает вклад человека в команду, а персонаж помогает исследовать тот же талант в повседневной жизни. Через игровые задания человек пробует новые действия и замечает, что меняется.</p>
            </div>
            <p className="about-team">Корпоративные программы проводят сотрудники команды SoulVibe.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 08 Contacts ----------------
   По ТЗ: «Напишите нам…» и две кнопки — Telegram и email; клик не отправляет сообщение сам.
   Адреса — заглушки из LINKS до получения настоящих. */
const CONTACTS_TITLE = 'Напишите нам'

function Contacts() {
  const telegramLabel = LINKS.telegram.replace(/^https?:\/\//, '')
  const ref = useRef<HTMLElement>(null)
  const card = useRef<HTMLDivElement>(null)
  useScrollParts(ref)
  // Появление: заголовок по буквам вслед за прокруткой; ссылки по очереди выезжают справа,
  // круги со стрелкой «выскакивают». Если блок снова ушёл вниз за экран — повторится.
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = card.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setShown(true)
      else if (e.boundingClientRect.top > window.innerHeight) setShown(false)
    }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section className="section" id="contacts" ref={ref}>
      <div className="wrap">
      <div className={`contacts-card contacts-reveal${shown ? ' is-in' : ''}`} ref={card}>
        <div className="contacts-head">
          <h2 className="sl" data-sp aria-label={CONTACTS_TITLE} style={{ ['--n' as string]: nChars(CONTACTS_TITLE) }}>
            <span aria-hidden="true">{letters(CONTACTS_TITLE, 0)}</span>
          </h2>
        </div>
        <div className="contacts-links">
          <a href={LINKS.telegram} target="_blank" rel="noreferrer" className="contact-link">
            <span>
              <b>Написать в Telegram</b>
              <small>{telegramLabel}</small>
            </span>
            <span className="go"><Arrow /></span>
          </a>
          <a href={LINKS.email} className="contact-link">
            <span>
              <b>Написать по электронной почте</b>
              <small>{LINKS.emailLabel}</small>
            </span>
            <span className="go"><Arrow /></span>
          </a>
        </div>
      </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <Ecosystem />
      {/* Вариант секции: ?role=1 — прежний (блоки), по умолчанию — веер карточек */}
      {new URLSearchParams(window.location.search).get('role') === '1' ? <RoleCharacter /> : <RoleFan />}
      <FormatsTabs />
      <PhilosophyAir />
      <Cases />
      <About />
      <Contacts />
    </>
  )
}
