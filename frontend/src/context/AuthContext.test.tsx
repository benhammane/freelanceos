import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import type { LoginResponse } from '../types/auth'

const CLE_STOCKAGE_SESSION = 'freelanceos.session'

const reponseLogin: LoginResponse = {
  token: 'jwt-de-test',
  role: 'ADMIN',
  email: 'admin@freelanceos.local',
  clientId: null,
  clientNom: null,
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('démarre sans session quand le localStorage est vide', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.session).toBeNull()
  })

  it('reprend la session déjà stockée au montage', () => {
    localStorage.setItem(CLE_STOCKAGE_SESSION, JSON.stringify(reponseLogin))
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.session).toEqual(reponseLogin)
  })

  it('connecter() met à jour le contexte ET persiste dans le localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    act(() => {
      result.current.connecter(reponseLogin)
    })

    expect(result.current.session).toEqual(reponseLogin)
    expect(JSON.parse(localStorage.getItem(CLE_STOCKAGE_SESSION)!)).toEqual(reponseLogin)
  })

  it('deconnecter() efface le contexte ET le localStorage', () => {
    localStorage.setItem(CLE_STOCKAGE_SESSION, JSON.stringify(reponseLogin))
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    act(() => {
      result.current.deconnecter()
    })

    expect(result.current.session).toBeNull()
    expect(localStorage.getItem(CLE_STOCKAGE_SESSION)).toBeNull()
  })
})
