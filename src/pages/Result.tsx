import { Link } from '../router'
import { LINKS, RESULT_MANAGER as R } from '../content'
import { Arrow, Emblem } from '../components/Icons'

export default function Result({ demo = false }: { demo?: boolean }) {
  return (
    <section className="result">
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

        <div className="result-hero curtain">
          <div>
            <span className="mono">{demo ? 'Пример роли' : 'Ваша роль'}</span>
            <h1>{R.role}</h1>
            <p className="talent"><b>Талант:</b> {R.talent}</p>
          </div>
          <div className="emblem-wrap"><Emblem className="emblem" /></div>
        </div>

        <div className="result-grid">
          <div className="rcard">
            <span className="mono">Сильные стороны</span>
            <h2>На что можно опираться</h2>
            <ul>
              {R.strengths.map((s, i) => (
                <li key={s}><span>0{i + 1}</span>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rcard">
            <span className="mono">Вклад в команду</span>
            <h2>Что роль даёт совместной работе</h2>
            <p>{R.contribution}</p>
          </div>
        </div>

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
    </section>
  )
}
