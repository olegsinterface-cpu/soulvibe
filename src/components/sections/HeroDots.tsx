import { useEffect, useRef } from 'react'
import './hero-dots.css'

/* Фон hero: «светодиодный экран» — сетка точек, по которой бегут световые волны.
   Шейдер на чистом WebGL. Для каждой ячейки считается «высота воды»: течение, закручивающее поле;
   две системы гребней (направление первой медленно поворачивается); кольца ряби от двух плывущих
   источников; по гребням пробегают блики, отдельные точки тихо мерцают. От высоты зависят размер,
   яркость и цвет точки. Цвета — серо-белые с лёгким
   уходом в палитру, либо (accent) полностью в акцентных #1787B3 → #BDFFFF; всё приглушено. На мышь не реагирует.
   Пауза вне экрана и в свёрнутой вкладке; при «уменьшении движения» — один статичный кадр. */

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uCell;
uniform float uAccent; // 1 — точки в акцентных цветах, 0 — прежние серо-белые

// value noise + fbm
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 cell = floor(frag / uCell);
  vec2 local = fract(frag / uCell) - 0.5;

  // координаты центра ячейки в «пространстве волн»
  // масштаб узора: меньше коэффициент — крупнее волны и очаги
  vec2 q0 = (cell * uCell) / uRes.y * 0.55;
  float t = uTime * 0.35;
  float aspect = uRes.x / uRes.y * 0.55;

  // 1. Течение: поле координат медленно «закручивается» — гребни изгибаются и дрейфуют, как вода
  vec2 q = q0 + 0.12 * vec2(sin(q0.y * 3.1 + t * 0.5), cos(q0.x * 2.4 - t * 0.37));
  q += 0.06 * vec2(fbm(q0 * 1.6 + t * 0.05), fbm(q0 * 1.6 - t * 0.04 + 3.7)) ;

  // 2. Зыбь: две системы гребней под разными углами; направление первой медленно поворачивается
  float ang = 0.62 + 0.18 * sin(t * 0.11);
  vec2 dir1 = vec2(cos(ang), -sin(ang));
  float bend = sin(q.x * 2.1 + t * 0.6) * 0.18 + sin(q.y * 1.7 - t * 0.4) * 0.12;
  // 3. Рябь: два «источника» плывут по экрану; от них расходятся кольца, которые
  //    не рисуют пятна, а сдвигают фазу гребней — волны изгибаются вокруг источников
  vec2 c1 = vec2(aspect * (0.22 + 0.12 * sin(t * 0.13)), 0.55 * (0.30 + 0.12 * cos(t * 0.17)));
  vec2 c2 = vec2(aspect * (0.80 + 0.10 * cos(t * 0.11)), 0.55 * (0.72 + 0.10 * sin(t * 0.15)));
  float d1 = length(q - c1), d2 = length(q - c2);
  float rip = sin(d1 * 18.0 - t * 2.0) * exp(-d1 * 2.0) + sin(d2 * 16.0 - t * 1.8 + 1.0) * exp(-d2 * 2.2);

  // гребни — узкие светлые линии (степень делает их тонкими), впадины между ними тёмные
  float ph1 = dot(q, dir1) * 9.0 + bend * 7.0 + rip * 1.4 - t;
  float ph2 = (q.x * 0.35 + q.y) * 5.5 - bend * 4.0 - rip * 0.8 + t * 0.7 + 1.3;
  float r1 = pow(0.5 + 0.5 * sin(ph1), 7.0);
  float r2 = pow(0.5 + 0.5 * sin(ph2), 5.0);
  // где-то волны выше, где-то тише — огибающая из шума даёт глубину
  float env = 0.45 + 0.75 * fbm(q * 1.3 + vec2(t * 0.05, -t * 0.03));
  float v = clamp((r1 * 0.85 + r2 * 0.5) * env, 0.0, 1.0);

  // 4. Блики: по гребням пробегают световые «искры», движущиеся вдоль волны
  float along = dot(q, vec2(-dir1.y, dir1.x));
  float glint = pow(0.5 + 0.5 * sin(along * 4.0 - t * 1.6 + ph2 * 0.3), 12.0) * r1;

  // 5. Мерцание: отдельные точки на гребнях тихо вспыхивают и гаснут
  float seed = hash(cell);
  float tw = 0.5 + 0.5 * sin(t * (1.5 + seed * 2.5) + seed * 40.0);
  float twinkle = step(0.93, seed) * tw * smoothstep(0.3, 0.8, v);

  float e = clamp(v + glint * 0.6 + twinkle * 0.35, 0.0, 1.0);

  // точка: радиус и яркость растут со значением
  float r = mix(0.1, 0.44, e);
  float d = length(local);
  float dotMask = 1.0 - smoothstep(r - 0.08, r, d);

  // цвет: серый во впадинах → серо-голубой (#1787B3) на склонах → голубой-белый (#BDFFFF) на гребнях и бликах
  vec3 deep = vec3(0.09, 0.53, 0.70);
  vec3 cyan = vec3(0.74, 1.0, 1.0);
  vec3 grey = mix(vec3(0.42), deep, smoothstep(0.15, 0.55, e) * 0.6);
  grey = mix(grey, mix(cyan, vec3(1.0), 0.45), smoothstep(0.6, 1.0, e));
  // акцентный вариант: впадины — #1787B3, к гребням переходит в #BDFFFF, белого нет
  vec3 acc = mix(deep, cyan, smoothstep(0.25, 0.75, e));
  vec3 col = mix(grey, acc, uAccent);

  float v2 = e;
  // общая приглушённость: максимум яркости невысокий
  float alpha = dotMask * mix(0.02 + 0.04 * uAccent, 0.2 + 0.7 * uAccent, mix(v2 * v2, v2, uAccent * 0.5)); // сильно приглушено, чтобы не мешать тексту
  gl_FragColor = vec4(col * alpha, alpha);
}
`

/** className — дополнительный класс для другой маски (например, в блоке расчёта) */
/** accent — точки в акцентных цветах (#1787B3 → #BDFFFF) вместо серо-белых */
export default function HeroDots({ className = '', accent = false }: { className?: string; accent?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true })
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src); gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uCell = gl.getUniformLocation(prog, 'uCell')
    gl.uniform1f(gl.getUniformLocation(prog, 'uAccent'), accent ? 1 : 0)

    let dpr = 1
    const resize = () => {
      const r = host.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, r.width < 640 ? 1.5 : 2) // на телефоне — меньше пикселей на кадр, точки крупные, разницы не видно
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr)
      canvas.style.width = `${r.width}px`; canvas.style.height = `${r.height}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      // шаг сетки точек — около 9 css-пикселей (на телефоне чуть крупнее)
      gl.uniform1f(uCell, (r.width < 640 ? 10 : 9) * dpr)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    const draw = (now: number) => {
      gl.uniform1f(uTime, (now - start) / 1000 + 20)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    // Рисуем, только когда фон реально виден: он в пределах экрана, вкладка открыта
    // и hero не закрыт целиком следующей секцией (класс is-covered ставит главная, см. useHeroScroll).
    // Прилипший hero браузер считает видимым, даже когда «Экосистема» полностью его закрыла.
    let raf = 0, running = false, inView = false
    const section = host.closest('section')
    const covered = () => !!section?.classList.contains('is-covered')
    const loop = (now: number) => { draw(now); raf = requestAnimationFrame(loop) }
    const play = () => { if (!running && !reduced) { running = true; raf = requestAnimationFrame(loop) } }
    const stop = () => { running = false; cancelAnimationFrame(raf) }
    const sync = () => (inView && !document.hidden && !covered() ? play() : stop())

    resize(); draw(performance.now())
    const ro = new ResizeObserver(() => { resize(); if (!running) draw(performance.now()) })
    ro.observe(host)
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync() })
    io.observe(host)
    const mo = new MutationObserver(sync)
    if (section) mo.observe(section, { attributes: true, attributeFilter: ['class'] })
    document.addEventListener('visibilitychange', sync)
    return () => {
      stop(); ro.disconnect(); io.disconnect(); mo.disconnect()
      document.removeEventListener('visibilitychange', sync)
      // контекст не сбрасываем: в режиме разработки эффект запускается дважды на том же canvas
    }
  }, [accent])

  return <canvas ref={ref} className={`hero-dots ${className}`.trim()} aria-hidden="true" />
}
