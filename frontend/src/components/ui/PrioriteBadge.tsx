import type { Priorite } from '../../types/common'
import { LABELS_PRIORITE } from '../../types/common'
import { Badge } from './Badge'

/** Associe chaque priorité à une tonalité de badge cohérente dans toute l'app. */
const TONE_PAR_PRIORITE = {
  BASSE: 'neutral',
  MOYENNE: 'warning',
  HAUTE: 'danger',
} as const

export function PrioriteBadge({ priorite }: { priorite: Priorite }) {
  return (
    <Badge tone={TONE_PAR_PRIORITE[priorite]} dot>
      {LABELS_PRIORITE[priorite]}
    </Badge>
  )
}
