import type { ReactNode } from 'react'
import { Link } from '../../router'
import './shiny-button.css'

interface ShinyButtonProps {
  children: ReactNode
  /** Внутренний адрес — кнопка становится ссылкой */
  to?: string
  onClick?: () => void
  className?: string
}

export function ShinyButton({ children, to, onClick, className = '' }: ShinyButtonProps) {
  const cls = `shiny-cta ${className}`.trim()
  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        <span>{children}</span>
      </Link>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      <span>{children}</span>
    </button>
  )
}
