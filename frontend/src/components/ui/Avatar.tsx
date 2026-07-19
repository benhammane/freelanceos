/**
 * Avatar à initiales : dérive 1 à 2 lettres depuis un nom/email et applique
 * une couleur de fond stable (déterministe) dérivée de la chaîne, pour que le
 * même utilisateur garde toujours la même couleur.
 */
const PALETTE = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
]

function initiales(nom: string): string {
  const parts = nom.trim().split(/[\s@.]+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function couleur(nom: string): string {
  let hash = 0
  for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

const TAILLES = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
}

export function Avatar({ nom, size = 'md' }: { nom: string; size?: keyof typeof TAILLES }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${couleur(nom)} ${TAILLES[size]}`}
      aria-hidden="true"
    >
      {initiales(nom)}
    </span>
  )
}
