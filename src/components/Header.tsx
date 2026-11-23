import { useEffect, useState } from 'react'
import { Link, asset } from '../router'
import { NAV } from '../content'
import { ShinyButton } from './ui/ShinyButton'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const close = () => setOpen(false)

  return (
    <header className={`header${scrolled || open ? ' scrolled' : ''}`}>
      <div className="wrap">
        <div className="header-in">
          <Link to="/" className="logo" onClick={close} aria-label="SoulVibe — на главную">
            <img src={asset('/logo.svg')} alt="SoulVibe" className="logo-img" />
          </Link>
          <nav className="nav" aria-label="Разделы">
            {NAV.map((n) => (
              <Link key={n.id} to={`/#${n.id}`}>{n.label}</Link>
            ))}
          </nav>
          <ShinyButton to="/raschet" onClick={close}>Расчёт таланта</ShinyButton>
          <button
            className="burger"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
        <div id="mobile-menu" className={`mobile-menu${open ? ' open' : ''}`}>
          {NAV.map((n, i) => (
            <Link key={n.id} to={`/#${n.id}`} className="m-item" onClick={close}>
              {n.label}
              <span className="mono">0{i + 2}</span>
            </Link>
          ))}
          <div className="m-actions">
            <Link to="/raschet" className="btn btn-primary" onClick={close}>Расчёт таланта</Link>
            <Link to="/#contacts" className="btn btn-ghost" onClick={close}>Написать нам</Link>
          </div>
        </div>
      </div>
    </header>
  )
}
