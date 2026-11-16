import './edge-glow.css'

/** Запустить вспышку границы в точке (x, y) внутри элемента с классом .edge-glow */
export function triggerEdgeGlow(el: HTMLElement | null, x?: number, y?: number) {
  if (!el) return
  if (x !== undefined) el.style.setProperty('--hit-x', `${x}px`)
  if (y !== undefined) el.style.setProperty('--hit-y', `${y}px`)
  el.classList.remove('is-hit')
  void el.offsetWidth // перезапуск CSS-анимации
  el.classList.add('is-hit')
}
