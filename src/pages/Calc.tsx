import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, navigate } from '../router'
import { LINKS } from '../content'
import { Arrow } from '../components/Icons'

type Values = { birth: string; email: string; tg: string; consent: boolean }
type Errors = Partial<Record<keyof Values, string>>
type Status = 'input' | 'loading' | 'unavailable'
type Outcome = 'success' | 'unavailable'

const EMPTY: Values = { birth: '', email: '', tg: '', consent: false }

function maskDate(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`
}

function validate(v: Values): Errors {
  const e: Errors = {}
  const m = v.birth.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!v.birth) e.birth = 'Укажите дату рождения'
  else if (!m) e.birth = 'Проверьте дату: нужен формат ДД.ММ.ГГГГ'
  else {
    const [d, mo, y] = [+m[1], +m[2], +m[3]]
    const dt = new Date(y, mo - 1, d)
    const real = dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d
    if (!real) e.birth = 'Такой даты нет — проверьте день и месяц'
    else if (y < 1900 || dt > new Date()) e.birth = 'Проверьте год рождения'
  }
  if (!v.email) e.email = 'Укажите email'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = 'Введите email в формате name@example.com'
  if (!v.tg) e.tg = 'Укажите Telegram'
  else if (!/^@[A-Za-z0-9_]{5,32}$/.test(v.tg)) e.tg = 'Укажите Telegram в формате @username (от 5 символов: латиница, цифры, _)'
  if (!v.consent) e.consent = 'Без согласия на обработку данных отправить форму нельзя'
  return e
}

const PRESETS: Record<string, { label: string }> = {
  input: { label: '1. Ввод' },
  errors: { label: '2. Ошибки полей' },
  loading: { label: '3. Выполняется расчёт' },
  unavailable: { label: '4. Сервис недоступен' },
  success: { label: '5. Успех → результат' },
}

export default function Calc() {
  const [v, setV] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('input')
  const [outcome, setOutcome] = useState<Outcome>('success')
  const [preset, setPreset] = useState('input')
  const [panel, setPanel] = useState(() => window.innerWidth > 720)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    setV((p) => ({ ...p, [k]: val }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  const run = (values: Values, out: Outcome) => {
    const e = validate(values)
    setErrors(e)
    if (Object.keys(e).length) {
      const first = document.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)
      first?.focus()
      return
    }
    setStatus('loading')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (out === 'success') navigate('/rezultat')
      else setStatus('unavailable')
    }, 1800)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    run(v, outcome)
  }

  const sample: Values = { birth: '14.03.1990', email: 'name@example.com', tg: '@username', consent: true }

  const applyPreset = (key: string) => {
    window.clearTimeout(timer.current)
    setPreset(key)
    if (key === 'input') { setV(EMPTY); setErrors({}); setStatus('input'); setOutcome('success') }
    if (key === 'errors') {
      const bad = { birth: '31.02.19', email: 'name@', tg: 'username', consent: false }
      setV(bad); setErrors(validate(bad)); setStatus('input')
    }
    if (key === 'loading') { setV(sample); setErrors({}); setStatus('loading') }
    if (key === 'unavailable') { setV(sample); setErrors({}); setStatus('unavailable'); setOutcome('success') }
    if (key === 'success') { setOutcome('success'); setV(sample); run(sample, 'success') }
  }

  const busy = status === 'loading'

  return (
    <section className="calc">
      <div className="wrap calc-grid">
        <aside className="calc-side curtain">
          <Link to="/" className="back-link"><span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><Arrow size={14} /></span>На главную</Link>
          <span className="status-pill calc-free">Бесплатно</span>
          <h1>Расчёт таланта</h1>
          <p className="lead">На сайте вы получите свою роль и её описание. Персонажа можно узнать в боте с ИИ-ментором.</p>
          <div className="calc-steps">
            <div className="calc-step on"><span className="n">1</span>Узнать роль<small>здесь, на сайте</small></div>
            <div className="calc-step"><span className="n">2</span>Познакомиться с персонажем<small>в боте, по желанию</small></div>
            <div className="calc-step"><span className="n">3</span>Работать с ИИ-ментором<small>в боте</small></div>
          </div>
        </aside>

        <div className="form-card">
          <h2>Ваши данные для расчёта</h2>
          <p className="hint">Все поля обязательны.</p>

          {status === 'unavailable' && (
            <div className="alert" role="alert">
              <span className="i">!</span>
              <div>
                <b>Не удалось выполнить расчёт</b>
                <p>Сервис сейчас недоступен. Введённые данные сохранены в форме — попробуйте ещё раз чуть позже. Роль покажем только после успешного расчёта.</p>
                <div className="row">
                  <button className="btn btn-primary" onClick={() => run(v, outcome)}>Повторить</button>
                  <Link to="/#contacts" className="btn btn-ghost">Написать нам</Link>
                </div>
              </div>
            </div>
          )}

          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="birth">Дата рождения<em>*</em></label>
              <input
                id="birth" name="birth" className="input" inputMode="numeric" autoComplete="bday"
                placeholder="ДД.ММ.ГГГГ" value={v.birth} disabled={busy}
                aria-invalid={!!errors.birth} aria-describedby={errors.birth ? 'birth-err' : 'birth-help'}
                onChange={(e) => set('birth', maskDate(e.target.value))}
              />
              {errors.birth ? <p className="err" id="birth-err">{errors.birth}</p> : <p className="help" id="birth-help">Например, 14.03.1990</p>}
            </div>
            <div className="field">
              <label htmlFor="email">Email<em>*</em></label>
              <input
                id="email" name="email" type="email" className="input" autoComplete="email"
                placeholder="name@example.com" value={v.email} disabled={busy}
                aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-err' : undefined}
                onChange={(e) => set('email', e.target.value.trim())}
              />
              {errors.email && <p className="err" id="email-err">{errors.email}</p>}
            </div>
            <div className="field">
              <label htmlFor="tg">Telegram<em>*</em></label>
              <input
                id="tg" name="tg" className="input" autoComplete="off" autoCapitalize="none"
                placeholder="@username" value={v.tg} disabled={busy}
                aria-invalid={!!errors.tg} aria-describedby={errors.tg ? 'tg-err' : 'tg-help'}
                onChange={(e) => set('tg', e.target.value.trim())}
              />
              {errors.tg ? <p className="err" id="tg-err">{errors.tg}</p> : <p className="help" id="tg-help">Формат: @username — имя пользователя из настроек Telegram</p>}
            </div>

            <div className="why">
              Зачем нужны контакты: мы сохраняем email и Telegram вместе с результатом расчёта и можем написать вам о форматах SoulVibe. Подробнее — в документе об обработке персональных данных.
              {/* TODO: формулировка по фактической обработке данных — согласовать с юристом */}
            </div>

            <div className="field">
              <label className="check" htmlFor="consent" style={{ fontWeight: 400, marginBottom: 0 }}>
                <input
                  id="consent" name="consent" type="checkbox" checked={v.consent} disabled={busy}
                  aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-err' : undefined}
                  onChange={(e) => set('consent', e.target.checked)}
                />
                <span>Я согласен(на) на обработку персональных данных в соответствии с <a href={LINKS.privacy} target="_blank" rel="noreferrer">документом об обработке данных</a></span>
              </label>
              {errors.consent && <p className="err" id="consent-err">{errors.consent}</p>}
            </div>

            <div className="submit-row">
              <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
                {busy ? <><span className="spinner" />Считаем…</> : <>Узнать свою роль <Arrow /></>}
              </button>
              {busy ? (
                <span className="loading-note" role="status"><span className="bar" />Обычно это занимает несколько секунд</span>
              ) : (
                <Link to="/primer" className="text-link">Посмотреть пример результата</Link>
              )}
            </div>
          </form>

          <div className="form-foot">
            <span>Есть вопрос по командному формату или сотрудничеству?</span>
            <Link to="/#contacts">Написать нам</Link>
          </div>
        </div>
      </div>

      {panel ? (
        <div className="review" aria-label="Панель макета">
          <header>
            <span className="mono" style={{ color: 'var(--accent)' }}>Состояния формы · макет</span>
            <button onClick={() => setPanel(false)} aria-label="Скрыть панель">×</button>
          </header>
          <div className="opts">
            {Object.entries(PRESETS).map(([k, p]) => (
              <button key={k} className={preset === k ? 'on' : ''} onClick={() => applyPreset(k)}>{p.label}</button>
            ))}
          </div>
          <label className="check" style={{ marginTop: 10, fontSize: 12 }}>
            <input type="checkbox" checked={outcome === 'unavailable'} onChange={(e) => setOutcome(e.target.checked ? 'unavailable' : 'success')} />
            <span>Имитировать ошибку сервиса при отправке</span>
          </label>
          <small>Панель для просмотра макета, на сайте её не будет.</small>
        </div>
      ) : (
        <button className="btn btn-ghost review-min" onClick={() => setPanel(true)}>Состояния</button>
      )}
    </section>
  )
}
