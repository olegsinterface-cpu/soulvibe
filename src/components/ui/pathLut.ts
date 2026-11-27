/**
 * Точки на SVG-линии по расстоянию от начала — из заранее рассчитанной таблицы.
 *
 * Импульсы в схемах каждый кадр берут две точки на линии (хвост и голову), чтобы повернуть градиент.
 * `getPointAtLength` каждый раз проходит линию заново — для десятка линий 60 раз в секунду это заметная работа.
 * Здесь линия один раз размечается с шагом `step` пикселей, а дальше точка берётся из таблицы
 * с линейной интерполяцией между соседними отметками. За концами линии — продолжение по касательной,
 * чтобы градиент не сжимался на входе и выходе импульса.
 */
export function pathLut(path: SVGPathElement, len = path.getTotalLength(), step = 2) {
  const n = Math.max(2, Math.ceil(len / step) + 1)
  const xs = new Float32Array(n), ys = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const p = path.getPointAtLength(Math.min(len, (i / (n - 1)) * len))
    xs[i] = p.x; ys[i] = p.y
  }
  const seg = len / (n - 1)
  return (d: number) => {
    if (d <= 0) {
      // назад от начала — по направлению первого участка
      const k = seg ? d / seg : 0
      return { x: xs[0] + (xs[1] - xs[0]) * k, y: ys[0] + (ys[1] - ys[0]) * k }
    }
    if (d >= len) {
      const k = seg ? (d - len) / seg : 0
      return { x: xs[n - 1] + (xs[n - 1] - xs[n - 2]) * k, y: ys[n - 1] + (ys[n - 1] - ys[n - 2]) * k }
    }
    const f = d / seg
    const i = Math.min(n - 2, Math.floor(f))
    const t = f - i
    return { x: xs[i] + (xs[i + 1] - xs[i]) * t, y: ys[i] + (ys[i + 1] - ys[i]) * t }
  }
}
