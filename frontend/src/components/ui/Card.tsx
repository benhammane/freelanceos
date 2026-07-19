import type { HTMLAttributes } from 'react'

/*
 * Carte de surface premium : fond blanc (ardoise en sombre), bordure fine,
 * rayon généreux, ombre très légère. `hover` ajoute une élévation animée au
 * survol (utile pour les cartes cliquables du dashboard).
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({ hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-navy-200/80 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900
        ${hover ? 'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md' : ''} ${className}`}
      {...props}
    />
  )
}
