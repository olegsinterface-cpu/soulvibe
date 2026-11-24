import { useEffect, useRef, useState, type FormEvent } from 'react'
import HeroDots from '../components/HeroDots'
import { Link, navigate } from '../router'
import { LINKS } from '../content'
import { Arrow } from '../components/Icons'
import TalentMap from '../components/TalentMap'
import { letters } from '../components/ui/letters'
import CityField from '../components/CityField'
import type { City } from '../lib/cities'

type Sex = '' | 'f' | 'm'
// city — текст в поле, cityPick — город, выбранный из подсказок (его данные и уходят в расчёт)
type Values = { sex: Sex; name: string; birth: string; time: string; noTime: boolean; city: string; cityPick: City | null; consent: boolean }
type Errors = Partial<Record<keyof Values, string>>
type Status = 'input' | 'loading' | 'unavailable'
type Outcome = 'success' | 'unavailable'

const EMPTY: Values = { sex: '', name: '', birth: '', time: '', noTime: false, city: '', cityPick: null, consent: false }

function maskDate(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`
}

function maskTime(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 4)
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`
}

function validate(v: Values): Errors {
  const e: Errors = {}
  if (!v.sex) e.sex = 'Выберите пол'
  if (!v.name.trim()) e.name = 'Укажите имя'
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
  // время — по желанию; если указано, проверяем формат
  if (!v.noTime && v.time) {
    const t = v.time.match(/^(\d{2}):(\d{2})$/)
    if (!t || +t[1] > 23 || +t[2] > 59) e.time = 'Проверьте время: нужен формат ЧЧ:ММ, например 08:30'
  }
  if (!v.city.trim()) e.city = 'Укажите город рождения'
  else if (!v.cityPick) e.city = 'Выберите город из подсказок'
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
      const first = document.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]:not(:disabled)`)
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

  const SAMPLE_CITY: City = { id: 'mock-moscow', name: 'Москва', country: 'Россия', lat: 55.7558, lng: 37.6173, timezone: 'Europe/Moscow' }
  const sample: Values = { sex: 'f', name: 'Анна', birth: '14.03.1990', time: '08:30', noTime: false, city: 'Москва', cityPick: SAMPLE_CITY, consent: true }

  const applyPreset = (key: string) => {
    window.clearTimeout(timer.current)
    setPreset(key)
    if (key === 'input') { setV(EMPTY); setErrors({}); setStatus('input'); setOutcome('success') }
    if (key === 'errors') {
      const bad: Values = { sex: '', name: '', birth: '31.02.19', time: '25:70', noTime: false, city: 'Мск', cityPick: null, consent: false }
      setV(bad); setErrors(validate(bad)); setStatus('input')
    }
    if (key === 'loading') { setV(sample); setErrors({}); setStatus('loading') }
    if (key === 'unavailable') { setV(sample); setErrors({}); setStatus('unavailable'); setOutcome('success') }
    if (key === 'success') { setOutcome('success'); setV(sample); run(sample, 'success') }
  }

  const busy = status === 'loading'

  return (
    <>
    {/* calc-anim — появление страницы: левая панель выезжает слева, форма справа, затем по очереди содержимое */}
    <section className="calc calc-anim">
      <div className="wrap calc-grid">
        <aside className="calc-side">
          {/* фон — те же волны из точек, что в hero */}
          <HeroDots className="in-calc" />
          <Link to="/" className="back-link"><span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><Arrow size={14} /></span>На главную</Link>
          <span className="calc-free">Бесплатно</span>
          <h1 aria-label="Расчёт таланта"><span aria-hidden="true">{letters('Расчёт таланта', 0)}</span></h1>
          <p className="lead">На сайте вы получите свою роль и её описание. Персонажа можно узнать в боте с ИИ-ментором.</p>
          <div className="calc-steps">
            <div className="calc-step on"><span className="n">1</span>Узнать роль<small>здесь, на сайте</small></div>
            <div className="calc-step"><span className="n">2</span>Познакомиться с персонажем<small>в боте, по желанию</small></div>
            <div className="calc-step"><span className="n">3</span>Работать с ИИ-ментором<small>в боте</small></div>
          </div>
        </aside>

        <div className="form-card">
          <h2>Ваши данные для расчёта</h2>
          <p className="hint">Все поля, кроме времени рождения, обязательны.</p>

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
            {/* Пол — переключатель из двух вариантов, бегунок встаёт под выбранный */}
            <div className="field">
              <div
                className={`sex-seg${v.sex ? ` is-${v.sex}` : ''}`} role="radiogroup" aria-label="Пол"
                aria-invalid={!!errors.sex} aria-describedby={errors.sex ? 'sex-err' : undefined}
              >
                <span className="sex-seg-thumb" aria-hidden="true" />
                {([['f', 'Женский'], ['m', 'Мужской']] as const).map(([val, label]) => (
                  <label key={val} className="sex-seg-opt">
                    <input type="radio" name="sex" value={val} checked={v.sex === val} disabled={busy} onChange={() => set('sex', val)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.sex && <p className="err" id="sex-err">{errors.sex}</p>}
            </div>
            <div className="field">
              <div className="float">
                <input
                  id="name" name="name" className="input" autoComplete="given-name"
                  placeholder="Имя" value={v.name} disabled={busy}
                  aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-err' : undefined}
                  onChange={(e) => set('name', e.target.value)}
                />
                <label htmlFor="name">Имя<em>*</em></label>
              </div>
              {errors.name && <p className="err" id="name-err">{errors.name}</p>}
            </div>
            <div className="field">
              <div className="float">
                <input
                  id="birth" name="birth" className="input" inputMode="numeric" autoComplete="bday"
                  placeholder="ДД.ММ.ГГГГ" value={v.birth} disabled={busy}
                  aria-invalid={!!errors.birth} aria-describedby={errors.birth ? 'birth-err' : undefined}
                  onChange={(e) => set('birth', maskDate(e.target.value))}
                />
                <label htmlFor="birth">Дата рождения<em>*</em></label>
              </div>
              {errors.birth && <p className="err" id="birth-err">{errors.birth}</p>}
            </div>
            {/* Время — по желанию; справа кнопка-галочка «Не знаю» отключает поле */}
            <div className="field">
              <div className="time-row">
                <div className="float">
                  <input
                    id="time" name="time" className="input" inputMode="numeric" autoComplete="off"
                    placeholder="ЧЧ:ММ" value={v.noTime ? '' : v.time} disabled={busy || v.noTime}
                    aria-invalid={!!errors.time} aria-describedby={errors.time ? 'time-err' : undefined}
                    onChange={(e) => set('time', maskTime(e.target.value))}
                  />
                  <label htmlFor="time">Время рождения</label>
                </div>
                <label className={`chip-check${v.noTime ? ' is-on' : ''}`}>
                  <input
                    type="checkbox" name="noTime" checked={v.noTime} disabled={busy}
                    onChange={(e) => { set('noTime', e.target.checked); if (e.target.checked) setErrors((p) => ({ ...p, time: undefined })) }}
                  />
                  <svg className="chip-tick" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Не знаю
                </label>
              </div>
              {errors.time && <p className="err" id="time-err">{errors.time}</p>}
            </div>
            {/* Город — с подсказками (сейчас тестовый список, разработчики подключат GeoNames: см. lib/cities.ts) */}
            <CityField
              value={v.city} picked={v.cityPick} error={errors.city} disabled={busy}
              onChange={(t) => set('city', t)}
              onPick={(c) => set('cityPick', c)}
            />

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
                <Link to="/primer" className="btn btn-ghost">Посмотреть пример результата</Link>
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

    {/* Карта талантов — по схеме заказчика */}
    <section className="tmap-sec">
      <div className="wrap">
        <TalentMap />
      </div>
    </section>
    </>
  )
}
