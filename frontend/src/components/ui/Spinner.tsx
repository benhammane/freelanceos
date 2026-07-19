import { Loader2 } from 'lucide-react'

/** Indicateur de chargement circulaire, réutilisé dans les boutons et les pages. */
export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
}
