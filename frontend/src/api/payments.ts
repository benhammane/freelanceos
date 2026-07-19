import { http } from './http'

export interface CreateIntentResponse {
  clientSecret: string
  publishableKey: string
  montant: number
  devise: string
  factureId: number
}

export const paymentsApi = {
  /** Crée l'intention de paiement Stripe pour une facture (montant calculé côté serveur). */
  createIntent: (invoiceId: number, email?: string) =>
    http
      .post<CreateIntentResponse>('/api/payments/create-intent', { invoiceId, email })
      .then((res) => res.data),

  /** Demande au backend de re-vérifier le statut du paiement auprès de Stripe. */
  sync: (intentId: string) =>
    http.post<{ status: string }>(`/api/payments/${intentId}/sync`).then((res) => res.data),
}
