import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { messageErreur } from './http'
import type { ApiError } from '../types/common'

function erreurAxios(data: ApiError, status = 400): AxiosError<ApiError> {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  })
}

describe('messageErreur', () => {
  it("renvoie le message brut quand il n'y a pas de détail de validation", () => {
    const err = erreurAxios({
      timestamp: '2026-07-19T10:00:00Z',
      status: 404,
      error: 'Not Found',
      message: 'Client introuvable avec l\'id : 42',
      details: [],
    })

    expect(messageErreur(err)).toBe("Client introuvable avec l'id : 42")
  })

  it('concatène le message et les détails de validation quand ils existent', () => {
    const err = erreurAxios({
      timestamp: '2026-07-19T10:00:00Z',
      status: 400,
      error: 'Bad Request',
      message: 'Validation échouée',
      details: ['nom: obligatoire', 'email: format invalide'],
    })

    expect(messageErreur(err)).toBe('Validation échouée — nom: obligatoire, email: format invalide')
  })

  it('renvoie un message générique pour une erreur qui ne vient pas de axios', () => {
    expect(messageErreur(new Error('boom'))).toBe('Une erreur inattendue est survenue')
  })
})
