import { Fragment, useEffect } from 'react'

/* Заголовок по буквам — эффект Moving Letters #12 (только появление, без ухода и повтора):
   буква выезжает справа на 40px и проявляется, 1.2s, easeOutExpo, задержка 0.5s + 30ms на букву по всему заголовку.
   Буквы слова — в неразрывной обёртке, пробелы между обёртками, чтобы строка переносилась только между словами. */
export function letters(text: string, start: number) {
  let n = start
  return text.split(' ').map((word, wi) => (
    <Fragment key={wi}>
      {wi > 0 && ' '}
      <span className="ha-word">
        {[...word].map((ch, ci) => <span key={ci} className="ha-ch" style={{ ['--c' as string]: n++ }}>{ch}</span>)}
      </span>
    </Fragment>
  ))
}

/* Градиентная строка по буквам: обрезка фона по тексту (background-clip) пропадает у движущихся букв,
   поэтому каждой букве задаём цвет того же радиального градиента (#BDFFFF в центре → белый к краям) */
export function useLetterGradient(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // считаем по offset-координатам — на них не влияют сдвиги букв во время анимации
    const paint = () => {
      el.querySelectorAll<HTMLElement>('.gt').forEach((line) => {
        const chars = line.querySelectorAll<HTMLElement>('.ha-ch')
        if (!chars.length) return
        const first = chars[0], last = chars[chars.length - 1]
        const left = first.offsetLeft, right = last.offsetLeft + last.offsetWidth
        const top = Math.min(...[...chars].map((c) => c.offsetTop))
        const bottom = Math.max(...[...chars].map((c) => c.offsetTop + c.offsetHeight))
        const cx0 = (left + right) / 2, cy0 = (top + bottom) / 2
        const hw = Math.max(1, Math.abs(right - left) / 2), hh = Math.max(1, (bottom - top) / 2)
        chars.forEach((ch) => {
          const cx = ch.offsetLeft + ch.offsetWidth / 2 - cx0
          const cy = ch.offsetTop + ch.offsetHeight / 2 - cy0
          const d = Math.min(1, Math.hypot(cx / hw, cy / hh))
          ch.style.color = `rgb(${Math.round(189 + 66 * d)}, 255, 255)`
        })
      })
    }
    paint()
    document.fonts?.ready.then(paint)
    window.addEventListener('resize', paint)
    return () => window.removeEventListener('resize', paint)
  }, [ref])
}

/* Буквы и блоки, привязанные к прокрутке: каждому элементу с data-sp задаются
   --en (0 → 1, пока он входит снизу) и --ex (0 → 1, пока уходит вверх) */
/* Буквы и блоки, привязанные к прокрутке: каждому элементу с data-sp задаются
   --en (0 → 1, пока он входит снизу) и --ex (0 → 1, пока уходит вверх) */
export function useScrollParts(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = ref.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const parts = [...root.querySelectorAll<HTMLElement>('[data-sp]')]
    const clamp = (v: number) => Math.min(1, Math.max(0, v))
    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      for (const el of parts) {
        const top = el.getBoundingClientRect().top
        el.style.setProperty('--en', clamp((vh * 0.95 - top) / (vh * 0.35)).toFixed(4))
        // момент ухода можно сдвинуть: data-sp-x — где начинать (доля высоты окна от верха), data-sp-len — длина
        const xs = Number(el.dataset.spX ?? 0.18), xl = Number(el.dataset.spLen ?? 0.3)
        el.style.setProperty('--ex', clamp((vh * xs - top) / (vh * xl)).toFixed(4))
      }
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [ref])
}

