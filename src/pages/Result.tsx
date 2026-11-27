import { Link } from '../router'
import { LINKS, RESULT_MANAGER as R } from '../content'
import { Arrow } from '../components/ui/Icons'
import { TiltCard } from '../components/ui/TiltCard'
import { SolarIcon } from '../components/ui/SolarIcon'

export default function Result({ demo = false }: { demo?: boolean }) {
  return (
    <section className="result res-anim">
      {/* res-anim — появление результата: карточка персонажа «проявляется» со вспышкой,
          фото плавно отъезжает, затем роль и пункты; справа по очереди — «Что дальше» */}
      <div className="wrap">
        <Link to="/" className="back-link" style={{ marginBottom: 20 }}>
          <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><Arrow size={14} /></span>На главную
        </Link>

        {demo && (
          <div className="demo-banner" role="note">
            <span className="mono">Пример</span>
            Демонстрационный пример — это не ваш расчёт
          </div>
        )}

        {/* Слева карточка персонажа (сверху изображение, снизу описание роли), справа — «Что дальше» */}
        <div className="res-layout">
        <TiltCard className="res-card">
          <figure className="res-photo">
            {/* персонаж скрыт: изображение размыто, имени нет — сам персонаж открывается в боте */}
            <img src={R.character.img} alt="Персонаж скрыт — его можно узнать в боте с AI-ментором" width="753" height="1000" />
            {/* плашка с замком по центру — ведёт в бота */}
            <a className="res-lock" href={LINKS.bot} target="_blank" rel="noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4.5" y="10.5" width="15" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />
              </svg>
              Персонаж откроется в боте
            </a>
          </figure>
          <div className="res-info">
            <div className="res-head">
              <span className="res-kicker">{demo ? 'Пример роли' : 'Ваша роль'}</span>
              <h1><span className="gt">{R.role}</span></h1>
            </div>
            {/* Таблица: «Талант» — строкой на всю ширину, ниже две колонки */}
            <dl className="res-list">
              {R.items.map((it, i) => (
                <div key={it.k} className={i === 0 ? 'res-item is-main' : 'res-item'}>
                  <dt><SolarIcon name={it.ico} size={16} className="res-ico" />{it.k}</dt>
                  <dd>{it.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </TiltCard>

        <div className="next">
          <div>
            <span className="mono">Что дальше</span>
            <h2>Познакомьтесь со своим персонажем</h2>
            <p>Роль — это вклад в команду. Персонаж — её игровой образ для личной работы — открывается в боте с ИИ-ментором. Результат с сайта в бот не передаётся автоматически.</p>
          </div>
          <div className="next-actions">
            <a href={LINKS.bot} target="_blank" rel="noreferrer" className="btn btn-primary">Узнать персонажа в боте <Arrow /></a>
            <span className="btn-note" style={{ marginTop: 0 }}>В боте потребуется заново ввести данные</span>
            <div className="alt">
              <Link to="/#contacts" className="btn btn-ghost">Написать нам</Link>
              <Link to="/#formats" className="btn btn-ghost">Форматы работы</Link>
            </div>
            {demo && <Link to="/raschet" className="text-link" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Рассчитать свою роль <Arrow size={14} /></Link>}
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
