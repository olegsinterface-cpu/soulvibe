import { useEffect } from 'react'
import { scrollToHash, useLocation } from './router'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Calc from './pages/Calc'
import Result from './pages/Result'

export default function App() {
  const { path, hash } = useLocation()

  useEffect(() => {
    if (hash) scrollToHash(hash)
  }, [path, hash])

  // Для ховера кнопок и плашек-ссылок: координаты курсора внутри кнопки → переменные --mx/--my (свет растекается из этой точки)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const btn = (e.target as Element | null)?.closest?.('.btn, .jump, .contact-link') as HTMLElement | null
      if (!btn) return
      const r = btn.getBoundingClientRect()
      btn.style.setProperty('--mx', `${e.clientX - r.left}px`)
      btn.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onMove, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onMove)
    }
  }, [])

  let page
  if (path.startsWith('/raschet')) page = <Calc />
  else if (path.startsWith('/primer')) page = <Result demo />
  else if (path.startsWith('/rezultat')) page = <Result />
  else page = <Home />

  return (
    <>
      <Header />
      <main>{page}</main>
      <Footer />
    </>
  )
}
