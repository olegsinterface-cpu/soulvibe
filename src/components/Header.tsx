import { useEffect, useRef, useState } from 'react'
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

  // Полоса прогресса прокрутки над шапкой: ширина = доля прочитанной страницы (обновляется раз в кадр)
  const progress = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progress.current?.style.setProperty('--p', String(p))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    // высота страницы меняется при переходах и догрузке картинок — пересчитываем
    const ro = new ResizeObserver(on)
    ro.observe(document.body)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  // Открытое меню закрывается нажатием в любом месте вне шапки и меню, а также клавишей Esc
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header ref={headerRef} className={`header${scrolled || open ? ' scrolled' : ''}`}>
      <span className="scroll-progress" ref={progress} aria-hidden="true" />
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
          {NAV.map((n) => (
            <Link key={n.id} to={`/#${n.id}`} className="m-item" onClick={close}>
              {n.label}
            </Link>
          ))}
          <div className="m-actions">
            <Link to="/#contacts" className="btn btn-ghost" onClick={close}>Написать нам</Link>
          </div>
        </div>
      </div>
    </header>
  )
}
