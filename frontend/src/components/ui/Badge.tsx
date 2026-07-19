import type { ReactNode } from 'react'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'

/*
 * Badge / pastille de statut premium (style Linear).
 * Un léger point coloré optionnel (`dot`) renforce la lisibilité du statut.
 */
const TONE_STYLES: Record<Tone, { badge: string; dot: string }> = {
  success: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
    dot: 'bg-amber-500',
  },
  danger: {
    badge: 'bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
    dot: 'bg-red-500',
  },
  info: {
    badge: 'bg-cyan-50 text-cyan-700 ring-cyan-600/15 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-500/20',
    dot: 'bg-cyan-500',
  },
  brand: {
    badge: 'bg-cyan-50 text-cyan-700 ring-cyan-600/15 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-500/20',
    dot: 'bg-cyan-500',
  },
  neutral: {
    badge: 'bg-navy-100 text-navy-600 ring-navy-500/15 dark:bg-navy-800 dark:text-navy-300 dark:ring-navy-400/15',
    dot: 'bg-navy-400',
  },
}

export function Badge({
  tone = 'neutral',
  dot = false,
  children,
}: {
  tone?: Tone
  dot?: boolean
  children: ReactNode
}) {
  const style = TONE_STYLES[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />}
      {children}
    </span>
  )
}
