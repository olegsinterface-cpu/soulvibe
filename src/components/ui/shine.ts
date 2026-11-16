/**
 * Световой блик — общий для кнопки «Расчёт таланта» (ShinyButton) и импульсов энергии в схеме.
 * Профиль вдоль блика: прозрачно → edge → mid → core (центр) → mid → edge → прозрачно.
 */
export const SHINE = {
  edge: '#1787B3', // --shiny-cta-highlight
  mid: '#BDFFFF', // --shiny-cta-highlight-subtle
  core: '#FFFFFF', // --gradient-shine
} as const

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/**
 * Цвет и прозрачность блика в точке u ∈ [0, 1] вдоль его длины (0.5 — центр).
 */
export function shineAt(u: number) {
  const d = Math.abs(u - 0.5) * 2 // 0 — центр, 1 — край
  const edge = hex(SHINE.edge)
  const mid = hex(SHINE.mid)
  const core = hex(SHINE.core)
  const rgb = d < 0.35 ? mix(core, mid, smooth(0, 0.35, d)) : mix(mid, edge, smooth(0.35, 0.85, d))
  const alpha = 1 - smooth(0.55, 1, d)
  return { color: `rgb(${rgb.join(',')})`, opacity: alpha }
}
