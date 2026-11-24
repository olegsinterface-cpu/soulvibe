import { useEffect, useId, useRef, useState } from 'react'
import { cityMeta, searchCities, type City } from '../lib/cities'

type Props = {
  value: string
  picked: City | null
  error?: string
  disabled?: boolean
  onChange: (text: string) => void
  onPick: (city: City | null) => void
}

type State = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

const MIN_CHARS = 2
const DEBOUNCE_MS = 250

/**
 * «Город рождения» с подсказками (combobox по WAI-ARIA).
 * Поведение: от 2 символов — запрос подсказок с задержкой 250 мс, устаревшие запросы отменяются;
 * список листается стрелками, Enter выбирает, Esc закрывает; ввод текста сбрасывает выбранный город —
 * отправить форму можно только с городом, выбранным из списка. Источник подсказок — `lib/cities.ts`.
 */
export default function CityField({ value, picked, error, disabled, onChange, onPick }: Props) {
  const uid = useId()
  const listId = `${uid}-list`
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [items, setItems] = useState<City[]>([])
  const [active, setActive] = useState(-1)
  const listRef = useRef<HTMLUListElement>(null)

  // запрос подсказок — только пока человек печатает (город ещё не выбран)
  useEffect(() => {
    const q = value.trim()
    if (picked || q.length < MIN_CHARS) { setState('idle'); setItems([]); return }
    const ctrl = new AbortController()
    setState('loading')
    const t = window.setTimeout(() => {
      searchCities(q, ctrl.signal)
        .then((res) => { setItems(res); setActive(res.length ? 0 : -1); setState(res.length ? 'ready' : 'empty') })
        .catch((e) => { if (e?.name !== 'AbortError') { setItems([]); setState('error') } })
    }, DEBOUNCE_MS)
    return () => { window.clearTimeout(t); ctrl.abort() }
  }, [value, picked])

  // активный пункт всегда в зоне видимости списка
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (c: City) => {
    onPick(c)
    onChange(c.name)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return
      e.preventDefault()
      setOpen(true)
      setActive((i) => (e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length))
    } else if (e.key === 'Enter' && open && state === 'ready' && active >= 0) {
      e.preventDefault() // Enter выбирает город, а не отправляет форму
      choose(items[active])
    } else if (e.key === 'Escape' && open) {
      e.preventDefault()
      setOpen(false)
    }
  }

  const showList = open && state !== 'idle'
  const describedBy = error ? `${uid}-err` : undefined

  return (
    <div className="field">
      <div className={`float city-field${showList ? ' is-open' : ''}`}>
        <input
          id="city" name="city" className="input" autoComplete="off" spellCheck={false}
          placeholder="Начните вводить название" value={value} disabled={disabled}
          role="combobox" aria-autocomplete="list" aria-expanded={showList} aria-controls={listId}
          aria-activedescendant={showList && state === 'ready' && active >= 0 ? `${uid}-opt-${active}` : undefined}
          aria-invalid={!!error} aria-describedby={describedBy}
          onChange={(e) => { if (picked) onPick(null); onChange(e.target.value); setOpen(true) }}
          onFocus={() => { if (!picked) setOpen(true) }}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        <label htmlFor="city">Город рождения<em>*</em></label>

        {showList && (
          <ul className="city-list" id={listId} role="listbox" aria-label="Подсказки городов" ref={listRef}>
            {state === 'loading' && <li className="city-note" role="presentation"><span className="spinner" />Ищем города…</li>}
            {state === 'empty' && <li className="city-note" role="presentation">Ничего не нашли — проверьте название</li>}
            {state === 'error' && <li className="city-note" role="presentation">Не удалось загрузить подсказки — попробуйте ещё раз</li>}
            {state === 'ready' && items.map((c, i) => (
              <li
                key={c.id} id={`${uid}-opt-${i}`} data-i={i} role="option" aria-selected={i === active}
                className={`city-opt${i === active ? ' is-active' : ''}`}
                // mousedown вместо click — иначе поле теряет фокус и список закрывается раньше выбора
                onMouseDown={(e) => { e.preventDefault(); choose(c) }}
                onMouseEnter={() => setActive(i)}
              >
                <b>{c.name}</b>
                {cityMeta(c) && <span>{cityMeta(c)}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* выбранный город — подпись с регионом и страной, чтобы было видно, какой именно */}
      {picked && !error && <p className="help">{cityMeta(picked)}</p>}
      {error && <p className="err" id={`${uid}-err`}>{error}</p>}
    </div>
  )
}
