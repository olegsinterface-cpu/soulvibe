import { Link, asset } from '../../router'
import { LINKS, NAV } from '../../content'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo"><img src={asset('/logo.svg')} alt="SoulVibe" className="logo-img" /></Link>
            <p>Экосистема раскрытия талантов и командного взаимодействия. В основе всех форматов — общая методология и игровая философия.</p>
          </div>
          <div>
            <h5 className="mono">Разделы</h5>
            <ul>
              {NAV.filter((n) => n.id !== 'contacts').map((n) => (
                <li key={n.id}><Link to={`/#${n.id}`}>{n.label}</Link></li>
              ))}
              <li><Link to="/raschet">Расчёт таланта</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="mono">Связь</h5>
            <ul>
              <li><a href={LINKS.telegram} target="_blank" rel="noreferrer">Telegram</a></li>
              <li><a href={LINKS.email}>{LINKS.emailLabel}</a></li>
              <li><a href={LINKS.bot} target="_blank" rel="noreferrer">Бот с ИИ-ментором</a></li>
            </ul>
          </div>
          <div>
            <h5 className="mono">Документы</h5>
            <ul>
              <li><a href={LINKS.privacy}>Обработка персональных данных</a></li>
              <li><a href={LINKS.terms}>Условия использования</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>SoulVibe, 2026</span>
          <span>Сообщения отправляются только вами — сайт ничего не пишет автоматически.</span>
        </div>
      </div>
    </footer>
  )
}
