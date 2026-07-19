import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

/*
 * Bouton premium multi-variantes.
 * Les variantes primary/secondary/danger/ghost existaient déjà : leurs noms
 * sont conservés pour ne rien casser dans les pages. On ajoute `outline`,
 * les tailles, l'état `loading` et le support d'icônes (gauche/droite).
 */
const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    'bg-cyan-500 text-white shadow-sm hover:bg-cyan-600 active:bg-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-500/30',
  secondary:
    'bg-white text-navy-700 border border-navy-200 shadow-xs hover:bg-navy-50 hover:border-navy-300 dark:bg-navy-800 dark:text-navy-100 dark:border-navy-700 dark:hover:bg-navy-700',
  outline:
    'bg-transparent text-navy-700 border border-navy-300 hover:bg-navy-50 hover:border-navy-400 dark:text-navy-200 dark:border-navy-700 dark:hover:bg-navy-800',
  ghost:
    'bg-transparent text-navy-600 hover:bg-navy-100 hover:text-navy-800 dark:text-navy-300 dark:hover:bg-navy-800 dark:hover:text-navy-100',
  danger:
    'bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500/30',
}

const SIZE_STYLES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-[10px]',
  md: 'h-9.5 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex select-none items-center justify-center font-medium transition-all duration-150 ease-out
        disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none
        ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
