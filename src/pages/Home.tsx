import type { ReactNode } from 'react'
import { Link } from '../router'
import { CASES, CHARACTERS, DIALOG, HERO, LINKS, ROLE_CARD, ROLE_TABLE, TERMS } from '../content'
import { Arrow, ArrowDown } from '../components/Icons'
import EcosystemBeams from '../components/EcosystemBeams'
import RoleFan from '../components/RoleFan'
import { SolarIcon } from '../components/ui/SolarIcon'
import { TextAnimate, textAnimateEnd } from '../components/ui/TextAnimate'

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
  // Последовательность появления: подпись → заголовок по символам → описание по словам → кнопки
  const kicker = 'Методология · игровая философия · форматы'
  const starts: number[] = []
  let t = 0.15
  HERO.title.forEach((l) => { starts.push(t); t = textAnimateEnd(l, { delay: t }) - 0.3 })
  const leadStart = t
  const leadEnd = textAnimateEnd(HERO.lead, { by: 'word', delay: leadStart, stagger: 0.012 })
  const fade = (d: number) => ({ animationDelay: `${d.toFixed(2)}s` })

  return (
    <section className="hero" id="top">
      <div className="wrap hero-center">
        <div className="hero-text">
          <div className="hero-kicker mono">
            <span className="pulse ta-fade" />
            <TextAnimate by="word" delay={0.05}>{kicker}</TextAnimate>
          </div>
          <h1 aria-label={HERO.title.join(' ')}>
            {HERO.title.map((l, i) => (
              <span key={i} aria-hidden="true">
                <TextAnimate delay={starts[i]} gradient={i === 1}>{l}</TextAnimate>
              </span>
            ))}
          </h1>
          <TextAnimate as="p" className="hero-lead" by="word" delay={leadStart} stagger={0.012}>{HERO.lead}</TextAnimate>
          <div className="hero-actions">
            <Link to="/#ecosystem" className="btn btn-primary ta-fade" style={fade(leadEnd - 0.5)}>
              Исследовать экосистему <ArrowDown />
            </Link>
            <Link to="/#contacts" className="btn btn-ghost ta-fade" style={fade(leadEnd - 0.4)}>Обсудить задачу</Link>
          </div>
          <div className="hero-terms ta-fade" style={fade(leadEnd - 0.2)}>
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

/* ---------------- 04 Formats ---------------- */
function Fact({ k, children, cls = '' }: { k: string; children: ReactNode; cls?: string }) {
  return (
    <div className={`fact ${cls}`}>
      <span className="mono">{k}</span>
      <p>{children}</p>
    </div>
  )
}

function Formats() {
  return (
    <section className="section" id="formats">
      <div className="wrap">
        <SecHead
          n="04"
          label="Форматы работы"
          title="Выберите формат под свою задачу"
          sub="Каждый формат опирается на одну методологию. Сначала — какую задачу он решает, потом — как называется."
        />
        <div className="choose">
          <span className="mono">Ваш ход:</span>
          <Link to="/#format-mentor" className="choice"><span className="k">1</span>Хочу работать над собой</Link>
          <Link to="/#format-soulmind" className="choice"><span className="k">2</span>Есть идея</Link>
          <Link to="/#format-dreamteam" className="choice"><span className="k">3</span>Нужна сильная команда</Link>
          <Link to="/#brands" className="choice"><span className="k">4</span>Мы бренд</Link>
        </div>

        {/* ИИ-ментор */}
        <article className="format" id="format-mentor">
          <div>
            <span className="format-for"><span className="mono">Для кого · личная работа и развитие</span></span>
            <h3>Каждый день настраиваться, выполнять задание дня и замечать своё состояние</h3>
            <div className="format-name"><b className="gt">ИИ-ментор</b><span className="mono">Telegram-бот · рабочее название</span></div>
            <div className="facts">
              <Fact k="Задача">Помочь применять свой талант в обычных днях, а не только узнать о нём.</Fact>
              <Fact k="Содержание">Персонаж, настройка и задание на день, наблюдение за состоянием, диалог 24/7.</Fact>
              <Fact k="Результат">Вы лучше понимаете своё состояние и шаг за шагом пробуете действовать через сильную сторону.</Fact>
              <Fact k="Следующий шаг">Открыть бота и узнать своего персонажа.</Fact>
              <Fact k="Доступность и условия" cls="wide cond">Telegram, круглосуточно. Бот можно открыть и без расчёта на сайте. Условия доступа — в боте.</Fact>
            </div>
            <div className="format-actions">
              <div className="cta-group">
                <a href={LINKS.bot} target="_blank" rel="noreferrer" className="btn btn-primary">Узнать персонажа в боте <Arrow /></a>
                <span className="btn-note">В боте потребуется заново ввести данные</span>
              </div>
            </div>
            <div className="format-case"><Link to="/#case-alena" className="text-link">Смотреть кейс: Алёна <Arrow size={14} /></Link></div>
          </div>
          <div className="demo">
            <div className="demo-top">
              <span className="who"><span className="av" />ИИ-ментор</span>
              <span className="demo-badge">Пример диалога · демонстрация</span>
            </div>
            <div className="demo-body">
              {DIALOG.map((m, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  {'part' in m && <div className="demo-part">{m.part}</div>}
                  <div className={`bubble ${m.from}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="demo-foot">Иллюстрация того, как устроен диалог. Не скриншот реальной переписки.</div>
          </div>
        </article>

        {/* SoulMind */}
        <article className="format" id="format-soulmind">
          <div>
            <span className="format-for"><span className="mono">Для кого · идея, индивидуально или с командой</span></span>
            <h3>Посмотреть на идею с разных сторон и выйти с вариантами, как её реализовать</h3>
            <div className="format-name"><b className="gt">SoulMind</b><span className="mono">игра для идей</span></div>
            <div className="facts">
              <Fact k="Задача">Разобрать идею или запрос, пока они ещё не превратились в план.</Fact>
              <Fact k="Результат">Несколько продуманных вариантов реализации и понимание, с чего начать.</Fact>
              <Fact k="Следующий шаг">Написать нам: про индивидуальное участие или игру для команды.</Fact>
              <Fact k="Формат">Онлайн и офлайн.</Fact>
              <Fact k="Доступность и условия" cls="wide cond">Индивидуальное участие или отдельная игра для вашей команды. Условия обсуждаем при обращении.</Fact>
            </div>
            <div className="format-actions">
              <div className="row">
                <Link to="/#contacts" className="btn btn-primary">Участвовать в SoulMind</Link>
                <Link to="/#contacts" className="btn btn-ghost">Организовать игру для команды</Link>
              </div>
            </div>
            <div className="format-case"><Link to="/#case-soulmind" className="text-link">Смотреть кейс: SoulMind <Arrow size={14} /></Link></div>
          </div>
          <div className="scenes">
            <span className="mono" style={{ marginBottom: 8 }}>Три сцены игры</span>
            {[
              ['Идея или запрос', 'Вы приносите идею, задачу или вопрос.'],
              ['Разные позиции', 'Идею рассматривают с позиций разных ролей.'],
              ['Варианты реализации', 'Собираете несколько путей, как двигаться дальше.'],
            ].map(([t, d], i) => (
              <div key={t} style={{ display: 'contents' }}>
                {i > 0 && <div className="scene-arrow" />}
                <div className="scene">
                  <span className="num">0{i + 1}</span>
                  <div><b>{t}</b><p>{d}</p></div>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Dream Team */}
        <article className="format" id="format-dreamteam">
          <div>
            <span className="format-for"><span className="mono">Для кого · собственники и руководители</span></span>
            <h3>Собрать команду, в которой каждый понимает свою роль и вклад в общий результат</h3>
            <div className="format-name"><b className="gt">Dream Team</b><span className="mono">программа для команд</span></div>
            <div className="facts">
              <Fact k="Задача">Наладить взаимодействие в команде вокруг конкретной задачи бизнеса.</Fact>
              <Fact k="Результат">Общее понимание ролей и договорённости о совместной работе.</Fact>
              <Fact k="Следующий шаг" cls="wide">Написать нам и описать задачу команды. Расчёт и бот до обращения не нужны.</Fact>
              <Fact k="Доступность и условия" cls="wide cond">Длительность и число встреч согласуем под задачу.</Fact>
            </div>
            <div className="format-actions">
              <Link to="/#contacts" className="btn btn-primary">Обсудить задачу команды <Arrow /></Link>
            </div>
            <div className="format-case"><Link to="/#case-dreamteam" className="text-link">Смотреть кейс: Dream Team <Arrow size={14} /></Link></div>
          </div>
          <div className="steps4">
            <span className="mono" style={{ marginBottom: 16 }}>Как устроена программа</span>
            {[
              ['Запрос', 'Обсуждаем задачу команды.'],
              ['Роли участников', 'Определяем роли и то, как они дополняют друг друга.'],
              ['Встречи и тренинги', 'Работаем с командой в игровом формате.'],
              ['Результаты', 'Фиксируем договорённости и изменения в работе.'],
            ].map(([t, d], i) => (
              <div className="step4" key={t}>
                <span className="dot">0{i + 1}</span>
                <div><b>{t}</b><p>{d}</p></div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

/* ---------------- 05 Philosophy ---------------- */
function Philosophy() {
  return (
    <section className="section" id="philosophy">
      <div className="wrap">
        <SecHead n="05" label="Игровая философия" title="Смотреть на жизнь как на игру" sub="Это авторский взгляд, который объединяет все форматы SoulVibe." />
        <div className="philo">
          <div className="philo-main curtain tall">
            <div>
              <span className="mono">Философия</span>
              <h3>Игра — это не легкомыслие, а способ увидеть правила, ходы и выбор</h3>
            </div>
            <p>Когда смотришь на ситуацию как на игру, проще пробовать новое поведение: менять ход, а не себя целиком. Персонаж и состояние — два инструмента этого подхода.</p>
          </div>
          <div className="philo-cards">
            <div className="pcard">
              <span className="ico">
                <SolarIcon name="crown" size={22} />
              </span>
              <div>
                <h4>Персонаж</h4>
                <p>Игровой образ для личной работы. Через него легче пробовать действовать своей сильной стороной.</p>
              </div>
            </div>
            <div className="pcard">
              <span className="ico">
                <SolarIcon name="pulse" size={22} />
              </span>
              <div>
                <h4>Состояние</h4>
                <p>То, с чем вы входите в день. Его можно замечать и настраивать — не ждать, что оно изменится само.</p>
              </div>
            </div>
            <div className="pcard">
              <span className="ico">
                <SolarIcon name="route" size={22} />
              </span>
              <div>
                <h4>Выбор хода</h4>
                <p>Каждый день есть несколько вариантов действий. Игра помогает выбирать осознанно и замечать результат.</p>
              </div>
            </div>
            <p className="philo-sep">Философия — основа подхода. Как она работает в продуктах — в разделе «Форматы работы», что получилось у участников — в «Примерах».</p>
          </div>
        </div>

        <div className="brands" id="brands">
          <div>
            <span className="mono">Приглашение брендам</span>
            <h3>Брендам, которым близки идеи персонажа и состояния</h3>
            <p className="muted">Если ваш продукт помогает человеку чувствовать себя в своём образе, давайте обсудим, какой может быть коллаборация.</p>
            <div className="tags"><span>Украшения</span><span>Ароматы</span><span>Одежда</span><span>Другие направления</span></div>
          </div>
          <div className="brands-side">
            <span className="status-pill">Направление открыто для обсуждения</span>
            <Link to="/#contacts" className="btn btn-primary">Обсудить коллаборацию <Arrow /></Link>
            <small>Формат и условия определяем вместе — готовой программы пока нет.</small>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 06 Cases ---------------- */
function CaseText({ c, children }: { c: { tag: string; title: string; request: string; actions: string; result: string; quote?: string }; children: ReactNode }) {
  return (
    <div>
      <span className="case-tag"><span className="mono">{c.tag}</span></span>
      <h3>{c.title}</h3>
      <dl>
        <div><dt>Запрос</dt><dd>{c.request}</dd></div>
        <div><dt>Действия</dt><dd>{c.actions}</dd></div>
        <div><dt>Результат</dt><dd className="res">{c.result}</dd></div>
      </dl>
      {c.quote && <blockquote>«{c.quote}»</blockquote>}
      {children}
    </div>
  )
}

function Cases() {
  return (
    <section className="section" id="cases">
      <div className="wrap">
        <SecHead n="06" label="Примеры и отзывы" title="Три примера — три формата" sub="Опыт конкретных участников. Мы описываем, что происходило, без обобщений и обещаний." />
        <div className="cases">
          <article className="case" id="case-alena">
            <CaseText c={CASES.alena}>
              <Link to="/raschet" className="btn btn-primary">Рассчитать свою роль <Arrow /></Link>
            </CaseText>
            <div className="case-viz">
              <span className="mono vt">Путь участницы</span>
              <div className="flow3">
                <div className="st"><span className="mono">01 · Запрос</span><b>Понять, на чём строить своё дело</b></div>
                <span className="ar">→</span>
                <div className="st"><span className="mono">02 · Действия</span><b>Роль и ежедневная работа с ИИ-ментором</b></div>
                <span className="ar">→</span>
                <div className="st last"><span className="mono">03 · Результат</span><b>Идея собственного бренда</b><span className="status-soon">● готовится к запуску</span></div>
              </div>
            </div>
          </article>

          <article className="case" id="case-soulmind">
            <CaseText c={CASES.soulmind}>
              <Link to="/#contacts" className="btn btn-primary">Участвовать в SoulMind <Arrow /></Link>
            </CaseText>
            <div className="case-viz">
              <span className="mono vt">Две стадии идеи</span>
              <div className="stages">
                <div className="stage">
                  <span className="mono">До игры</span>
                  <SolarIcon name="hospital" size={48} strokeWidth={1.2} />
                  <b>Офлайн-клиника</b>
                </div>
                <div className="stage-ar"><Arrow size={20} /></div>
                <div className="stage next">
                  <span className="mono">После игры</span>
                  <SolarIcon name="laptop" size={48} strokeWidth={1.2} />
                  <b>Онлайн-платформа</b>
                </div>
              </div>
            </div>
          </article>

          <article className="case" id="case-dreamteam">
            <CaseText c={CASES.dreamteam}>
              <Link to="/#contacts" className="btn btn-primary">Обсудить задачу команды <Arrow /></Link>
            </CaseText>
            <div className="case-viz">
              <span className="mono vt">Последовательность программы</span>
              <div className="track">
                {[
                  ['Запрос', 'согласованная работа команды'],
                  ['Роли', 'роли участников'],
                  ['Встречи', 'три встречи и тренинги за месяц'],
                  ['Результаты', 'договорённости об ответственности'],
                ].map(([t, d], i) => (
                  <div className="tk" key={t}>
                    <span className="dot">0{i + 1}</span>
                    <div><b>{t}</b><p>{d}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 07 About ---------------- */
function About() {
  return (
    <section className="section" id="about">
      <div className="wrap">
        <SecHead n="07" label="О проекте" title="Кто стоит за SoulVibe" />
        <div className="about">
          <div className="author-photo curtain"><span className="mono">Фото автора · будет предоставлено</span></div>
          <div>
            <h3>Имя автора</h3>
            <p className="role mono">Автор методологии SoulVibe</p>
            <p className="desc">Краткое описание подхода автора: откуда появилась методология, как она связывает талант, роль и персонажа и почему в её основе — игровая философия.</p>
            <div className="team">
              <div className="team-av" aria-hidden="true"><span /><span /><span /></div>
              <div>
                <b>Команда</b>
                <p>Корпоративные программы — SoulMind для команд и Dream Team — проводят сотрудники SoulVibe, которые работают по методологии.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 08 Contacts ---------------- */
function Contacts() {
  return (
    <section className="section" id="contacts">
      <div className="wrap">
        <div className="contact curtain tall">
          <div>
            <span className="mono">Контакты</span>
            <h2>Напишите нам…</h2>
            <p>…по любому формату: личная работа, SoulMind, Dream Team или коллаборация. Расскажите о задаче — ответим и предложим следующий шаг.</p>
          </div>
          <div className="contact-actions">
            <a href={LINKS.telegram} target="_blank" rel="noreferrer" className="btn btn-primary">Написать в Telegram <Arrow /></a>
            <a href={LINKS.email} className="btn btn-dark">Написать по электронной почте <Arrow /></a>
            <small>Откроется мессенджер или почта — сообщение не отправится автоматически.</small>
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
      <Formats />
      <Philosophy />
      <Cases />
      <About />
      <Contacts />
    </>
  )
}
