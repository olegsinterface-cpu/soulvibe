import type { ReactNode } from 'react'
import { Link } from '../router'
import { CHARACTERS, HERO, LINKS, ROLE_CARD, ROLE_TABLE, TERMS } from '../content'
import { Arrow, ArrowDown } from '../components/Icons'
import EcosystemBeams from '../components/EcosystemBeams'
import HeroDots from '../components/HeroDots'
import RoleFan from '../components/RoleFan'
import FormatsTabs from '../components/FormatsTabs'
import CasesCarousel, { type CaseCard } from '../components/CasesCarousel'
import { SolarIcon } from '../components/ui/SolarIcon'
import { TiltCard } from '../components/ui/TiltCard'

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
function Hero() {
  return (
    <section className="hero" id="top">
      <HeroDots />
      <div className="wrap hero-center">
        <div className="hero-text">
          <h1>
            {HERO.title.map((l, i) => (
              <span key={i}>{i === 1 ? <span className="gt">{l}</span> : l}</span>
            ))}
          </h1>
          <p className="hero-lead">{HERO.lead}</p>
          <div className="hero-actions">
            <Link to="/#ecosystem" className="btn btn-primary">
              Исследовать экосистему <ArrowDown />
            </Link>
            <Link to="/#contacts" className="btn btn-ghost">Обсудить задачу</Link>
          </div>
          <div className="hero-terms">
            {TERMS.map((t) => (
              <div key={t.term}>
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
  return (
    <section className="section" id="ecosystem">
      <div className="wrap">
        <SecHead
          n="02"
          label="Экосистема"
          title={<>Одна основа — <span className="gt">три направления</span></>}
          sub="Направления не нужно проходить по порядку: каждое самостоятельно и открыто для своей задачи — личной, командной или партнёрской."
        />

        <EcosystemBeams />

        <div className="jumps">
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
    <div className="brands" id="brands">
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
const PRINCIPLES = [
  { icon: 'crown', title: 'Персонаж', text: 'Игровой образ для личной работы. Через него легче пробовать действовать своей сильной стороной.' },
  { icon: 'pulse', title: 'Состояние', text: 'То, с чем вы входите в день. Его можно замечать и настраивать — не ждать, что оно изменится само.' },
  { icon: 'route', title: 'Выбор хода', text: 'Каждый день есть несколько вариантов действий. Игра помогает выбирать осознанно и замечать результат.' },
] as const

function PhilosophyAir() {
  return (
    <>
      <section className="section philo-air" id="philosophy">
        <div className="wrap">
          <div className="pa-head">
            <span className="sec-label mono">Игровая философия</span>
            <h2>Смотреть на жизнь как на игру</h2>
          </div>
          {/* Три принципа — карточками в ряд */}
          <div className="pa-principles">
            {PRINCIPLES.map((x) => (
              <TiltCard className="pa-item" key={x.title}>
                {/* Текст поверх живого градиента; карточка наклоняется за курсором */}
                <div className="pa-panel">
                  <div className="pa-top">
                    <h4>{x.title}</h4>
                    <SolarIcon name={x.icon} size={28} className="pa-top-ico" />
                  </div>
                  <p>{x.text}</p>
                </div>
                <div className="pa-glow" aria-hidden="true" />
              </TiltCard>
            ))}
          </div>
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

function Cases() {
  return (
    <section className="section" id="cases">
      <div className="wrap">
        <div className="sec-head">
          <h2>Примеры и отзывы</h2>
        </div>
        <CasesCarousel items={CASE_CARDS} />
      </div>
    </section>
  )
}

/* ---------------- 07 About ----------------
   Данные — из вайрфрейма: автор Юлия Дмитриева, создатель SoulVibe.
   Фото и биография — заглушки до согласованных материалов. */
function About() {
  return (
    <section className="section" id="about">
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-label mono">О проекте</span>
          <h2>Кто стоит за SoulVibe</h2>
        </div>
        <div className="about">
          {/* Наклон за курсором — как у карточек «Игровой философии» */}
          <TiltCard className="author-photo">
            <span role="img" aria-label="Фотография автора — будет предоставлена">Фотография автора</span>
          </TiltCard>
          <div className="about-body">
            <div className="about-person">
              <h3>Юлия Дмитриева</h3>
              <span className="about-role">Создатель SoulVibe</span>
            </div>
            <div className="about-bio">Место для согласованной краткой биографии и описания опыта</div>
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
function Contacts() {
  const telegramLabel = LINKS.telegram.replace(/^https?:\/\//, '')
  return (
    <section className="section" id="contacts">
      <div className="wrap">
      <div className="contacts-card">
        <div className="contacts-head">
          <h2>Напишите нам</h2>
        </div>
        <div className="contacts-links">
          <a href={LINKS.telegram} target="_blank" rel="noreferrer" className="contact-link">
            <span>
              <b>Написать в Telegram</b>
              <small>{telegramLabel}</small>
            </span>
            <span className="go"><Arrow size={18} /></span>
          </a>
          <a href={LINKS.email} className="contact-link">
            <span>
              <b>Написать по электронной почте</b>
              <small>{LINKS.emailLabel}</small>
            </span>
            <span className="go"><Arrow size={18} /></span>
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
