// Aligné sur InvoiceResponseDto / InvoiceRequestDto / InvoiceLineDto côté backend.

export type TypeInvoice = 'DEVIS' | 'FACTURE'

export const LABELS_TYPE_INVOICE: Record<TypeInvoice, string> = {
  DEVIS: 'Devis',
  FACTURE: 'Facture',
}

export type StatutInvoice = 'BROUILLON' | 'ENVOYE' | 'PAYE' | 'EN_RETARD'

export const STATUTS_INVOICE: StatutInvoice[] = ['BROUILLON', 'ENVOYE', 'PAYE', 'EN_RETARD']

export const LABELS_STATUT_INVOICE: Record<StatutInvoice, string> = {
  BROUILLON: 'Brouillon',
  ENVOYE: 'Envoyé',
  PAYE: 'Payé',
  EN_RETARD: 'En retard',
}

export const COULEUR_STATUT_INVOICE: Record<StatutInvoice, string> = {
  BROUILLON: 'bg-navy-100 text-navy-600 ring-1 ring-inset ring-navy-500/15 dark:bg-navy-800 dark:text-navy-300 dark:ring-navy-400/15',
  ENVOYE: 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/15 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-500/20',
  PAYE: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
  EN_RETARD: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
}

export interface InvoiceLine {
  description: string
  quantite: number
  prixUnitaire: number
}

export interface Invoice {
  id: number
  numero: string
  type: TypeInvoice
  clientId: number
  clientNom: string
  projectId: number | null
  projectTitre: string | null
  lignes: InvoiceLine[]
  montantHT: number
  tauxTVA: number
  montantTTC: number
  statut: StatutInvoice
  dateEmission: string
  dateEcheance: string | null
}

export interface InvoiceInput {
  type: TypeInvoice
  clientId: number
  projectId: number | ''
  lignes: InvoiceLine[]
  tauxTVA: number
  statut: StatutInvoice
  dateEmission: string
  dateEcheance: string
}
