import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrioriteBadge } from './PrioriteBadge'

describe('PrioriteBadge', () => {
  it.each([
    ['BASSE', 'Basse'],
    ['MOYENNE', 'Moyenne'],
    ['HAUTE', 'Haute'],
  ] as const)('affiche le libellé français pour la priorité %s', (priorite, libelleAttendu) => {
    render(<PrioriteBadge priorite={priorite} />)
    expect(screen.getByText(libelleAttendu)).toBeInTheDocument()
  })
})
