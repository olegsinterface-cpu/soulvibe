import { SolarIcon } from './ui/SolarIcon'
import { useId } from 'react'

export function Arrow({ size = 16 }: { size?: number }) {
  return <SolarIcon name="arrowRight" size={size} className="arr" />
}

export function ArrowDown({ size = 16 }: { size?: number }) {
  return <SolarIcon name="arrowDown" size={size} />
}

export function Logo() {
  const id = useId()
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".5" stopColor="#BDFFFF" />
          <stop offset="1" stopColor="#1787B3" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill={`url(#${id})`} />
      <path d="M8 18c3.5-6 12.5-6 16 0" stroke="#1D1F21" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="12" r="2.4" fill="#1D1F21" />
    </svg>
  )
}

/** Общий знак роли «Управленец» и персонажа «Королева / Король» */
export function Emblem({ className = 'emblem' }: { className?: string }) {
  const id = useId()
  return (
    <svg className={className} viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".5" stopColor="#BDFFFF" />
          <stop offset="1" stopColor="#3FB6E6" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="76" fill="none" stroke="rgba(255,255,255,.18)" />
      <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,.12)" strokeDasharray="2 5" />
      <circle cx="80" cy="80" r="44" fill="rgba(63,182,230,.12)" stroke={`url(#${id})`} strokeWidth="1.5" />
      <path d="M56 92 L60 66 L72 78 L80 58 L88 78 L100 66 L104 92 Z" fill={`url(#${id})`} />
      <rect x="56" y="97" width="48" height="5" rx="2.5" fill={`url(#${id})`} />
      <circle cx="80" cy="4" r="3" fill="#BDFFFF" />
      <circle cx="80" cy="156" r="3" fill="#3FB6E6" />
    </svg>
  )
}

/** Абстрактный силуэт персонажа в короне (без детализации образа) */
export function Silhouette() {
  const id = useId()
  return (
    <svg className="silhouette" viewBox="0 0 180 220" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".45" stopColor="#BDFFFF" />
          <stop offset="1" stopColor="#1787B3" stopOpacity=".2" />
        </linearGradient>
      </defs>
      <ellipse cx="90" cy="200" rx="80" ry="12" fill="rgba(63,182,230,.18)" />
      <path d="M90 70c16 0 28 13 28 30s-12 32-28 32-28-15-28-32 12-30 28-30Z" fill={`url(#${id})`} />
      <path d="M30 210c4-44 28-70 60-70s56 26 60 70Z" fill={`url(#${id})`} opacity=".85" />
      <path d="M66 62 L70 40 L80 52 L90 32 L100 52 L110 40 L114 62 Z" fill="#BDFFFF" />
      <rect x="66" y="64" width="48" height="4" rx="2" fill="#BDFFFF" />
    </svg>
  )
}
