/**
 * Поиск города рождения для поля с подсказками на странице расчёта.
 *
 * ДЛЯ РАЗРАБОТЧИКОВ. Сейчас `searchCities` работает на небольшом тестовом списке (MOCK_CITIES),
 * чтобы было видно поведение поля. Чтобы подключить GeoNames, замените тело `searchCities`
 * запросом к своему серверу (рекомендуется: логин GeoNames не попадает в код страницы,
 * лимиты и кэш — на сервере) или напрямую к GeoNames. Интерфейс функции менять не нужно —
 * компонент поля (`components/CityField.tsx`) работает с любым источником, который возвращает City[].
 *
 * Пример запроса к GeoNames (веб-сервис search, нужен username зарегистрированного аккаунта):
 *   GET https://<host>/searchJSON?name_startsWith=<запрос>&featureClass=P&orderby=population
 *       &maxRows=8&lang=ru&style=FULL&username=<username>
 * Ответ: { geonames: [{ geonameId, name, adminName1, countryName, lat, lng, timezone: { timeZoneId } }] }
 * — сопоставление с City см. в `fromGeoNames` ниже.
 *
 * Что именно отправлять в расчёт (только название / geonameId / координаты / часовой пояс) —
 * согласовать с бэкендом. В форме выбранный город хранится целиком (Values.cityPick).
 */

export type City = {
  /** geonameId из GeoNames; в тестовом списке — условный id с префиксом mock- */
  id: string
  /** название города */
  name: string
  /** регион / область (adminName1) — помогает различать одноимённые города */
  region?: string
  country: string
  lat: number
  lng: number
  /** часовой пояс IANA, например Europe/Moscow */
  timezone?: string
}

/** Подпись под названием: «Регион, Страна» */
export const cityMeta = (c: City) => [c.region, c.country].filter(Boolean).join(', ')

/** Сопоставление ответа GeoNames (style=FULL) с City */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromGeoNames(g: any): City {
  return {
    id: String(g.geonameId),
    name: g.name,
    region: g.adminName1 || undefined,
    country: g.countryName,
    lat: Number(g.lat),
    lng: Number(g.lng),
    timezone: g.timezone?.timeZoneId,
  }
}

/** Тестовый список — только для макета, координаты приблизительные */
const MOCK_CITIES: City[] = [
  { id: 'mock-moscow', name: 'Москва', country: 'Россия', lat: 55.7558, lng: 37.6173, timezone: 'Europe/Moscow' },
  { id: 'mock-spb', name: 'Санкт-Петербург', country: 'Россия', lat: 59.9386, lng: 30.3141, timezone: 'Europe/Moscow' },
  { id: 'mock-novosibirsk', name: 'Новосибирск', region: 'Новосибирская область', country: 'Россия', lat: 55.0415, lng: 82.9346, timezone: 'Asia/Novosibirsk' },
  { id: 'mock-novorossiysk', name: 'Новороссийск', region: 'Краснодарский край', country: 'Россия', lat: 44.7239, lng: 37.7708, timezone: 'Europe/Moscow' },
  { id: 'mock-novomoskovsk', name: 'Новомосковск', region: 'Тульская область', country: 'Россия', lat: 54.0105, lng: 38.2846, timezone: 'Europe/Moscow' },
  { id: 'mock-novokuznetsk', name: 'Новокузнецк', region: 'Кемеровская область', country: 'Россия', lat: 53.7596, lng: 87.1216, timezone: 'Asia/Novokuznetsk' },
  { id: 'mock-yekaterinburg', name: 'Екатеринбург', region: 'Свердловская область', country: 'Россия', lat: 56.8519, lng: 60.6122, timezone: 'Asia/Yekaterinburg' },
  { id: 'mock-kazan', name: 'Казань', region: 'Республика Татарстан', country: 'Россия', lat: 55.7887, lng: 49.1221, timezone: 'Europe/Moscow' },
  { id: 'mock-nn', name: 'Нижний Новгород', region: 'Нижегородская область', country: 'Россия', lat: 56.3287, lng: 44.002, timezone: 'Europe/Moscow' },
  { id: 'mock-krasnodar', name: 'Краснодар', region: 'Краснодарский край', country: 'Россия', lat: 45.0448, lng: 38.976, timezone: 'Europe/Moscow' },
  { id: 'mock-krasnoyarsk', name: 'Красноярск', region: 'Красноярский край', country: 'Россия', lat: 56.0153, lng: 92.8932, timezone: 'Asia/Krasnoyarsk' },
  { id: 'mock-samara', name: 'Самара', region: 'Самарская область', country: 'Россия', lat: 53.2001, lng: 50.15, timezone: 'Europe/Samara' },
  { id: 'mock-rostov', name: 'Ростов-на-Дону', region: 'Ростовская область', country: 'Россия', lat: 47.2313, lng: 39.7233, timezone: 'Europe/Moscow' },
  { id: 'mock-ufa', name: 'Уфа', region: 'Республика Башкортостан', country: 'Россия', lat: 54.7431, lng: 55.9678, timezone: 'Asia/Yekaterinburg' },
  { id: 'mock-omsk', name: 'Омск', region: 'Омская область', country: 'Россия', lat: 54.9924, lng: 73.3686, timezone: 'Asia/Omsk' },
  { id: 'mock-sochi', name: 'Сочи', region: 'Краснодарский край', country: 'Россия', lat: 43.6028, lng: 39.7342, timezone: 'Europe/Moscow' },
  { id: 'mock-vladivostok', name: 'Владивосток', region: 'Приморский край', country: 'Россия', lat: 43.1056, lng: 131.874, timezone: 'Asia/Vladivostok' },
  { id: 'mock-minsk', name: 'Минск', country: 'Беларусь', lat: 53.9, lng: 27.5667, timezone: 'Europe/Minsk' },
  { id: 'mock-almaty', name: 'Алматы', country: 'Казахстан', lat: 43.25, lng: 76.9167, timezone: 'Asia/Almaty' },
  { id: 'mock-tbilisi', name: 'Тбилиси', country: 'Грузия', lat: 41.6941, lng: 44.8337, timezone: 'Asia/Tbilisi' },
]

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').trim()

/**
 * Найти города по началу названия. Возвращает до 8 вариантов.
 * `signal` — чтобы отменять устаревшие запросы, когда человек продолжает печатать.
 * TODO(разработчики): заменить тестовый поиск запросом к своему серверу или GeoNames (см. шапку файла).
 */
export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  await new Promise<void>((resolve, reject) => {
    const t = window.setTimeout(resolve, 350) // имитация сетевой задержки
    signal?.addEventListener('abort', () => { window.clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')) })
  })
  const q = norm(query)
  return MOCK_CITIES.filter((c) => norm(c.name).startsWith(q) || norm(c.name).split(/[\s-]/).some((w) => w.startsWith(q))).slice(0, 8)
}
