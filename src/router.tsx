import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react'

/* Подпуть сайта: локально пусто, на GitHub Pages — «/<репозиторий>».
   Внутри приложения адреса пишем от корня («/raschet»), подпуть добавляется здесь. */
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Адрес файла из public с учётом подпути: asset('/logo.svg') */
export const asset = (p: string) => BASE + p

/** Внутренний адрес → настоящий адрес в браузере */
export const withBase = (to: string) => (to.startsWith('/') ? BASE + to : to)

function current() {
  const p = window.location.pathname
  const path = BASE && p.startsWith(BASE) ? p.slice(BASE.length) || '/' : p
  return { path, hash: window.location.hash.slice(1), search: window.location.search }
}

export function navigate(to: string) {
  const url = new URL(withBase(to), window.location.origin)
  const samePage = url.pathname === window.location.pathname
  window.history.pushState({}, '', url.pathname + url.search + url.hash)
  window.dispatchEvent(new Event('sv:navigate'))
  if (samePage && url.hash) scrollToHash(url.hash.slice(1))
  else if (!url.hash) window.scrollTo({ top: 0 })
}

export function scrollToHash(id: string) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id)
    if (!el) return
    // секция начинается с большого внутреннего отступа сверху — пропускаем его, чтобы содержимое
    // встало сразу под шапкой (с небольшим воздухом), а не ниже пустой полосы
    const header = document.querySelector('.header')?.getBoundingClientRect().height ?? 72
    const pad = parseFloat(getComputedStyle(el).paddingTop) || 0
    const top = el.getBoundingClientRect().top + window.scrollY + pad - header - 32
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  })
}

export function useLocation() {
  const [loc, setLoc] = useState(current)
  useEffect(() => {
    const on = () => setLoc(current())
    window.addEventListener('popstate', on)
    window.addEventListener('sv:navigate', on)
    return () => {
      window.removeEventListener('popstate', on)
      window.removeEventListener('sv:navigate', on)
    }
  }, [])
  return loc
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={withBase(to)} onClick={handle} {...rest} />
}
