import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * Bouton carré ne contenant qu'une icône (Lucide), utilisé dans la topbar et
 * les actions discrètes. `label` alimente aria-label pour l'accessibilité.
 */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
}

export function IconButton({ label, className = '', children, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex h-9.5 w-9.5 items-center justify-center rounded-xl text-navy-500 transition-colors duration-150
        hover:bg-navy-100 hover:text-navy-800 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
