import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  ArrowRight,
  FolderKanban,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { dashboardApi } from '../api/dashboard'
import { clientsApi } from '../api/clients'
import { projectsApi } from '../api/projects'
import { invoicesApi } from '../api/invoices'
import { messageErreur } from '../api/http'
import type { DashboardSummary } from '../types/dashboard'
import type { Client } from '../types/client'
import type { Project } from '../types/project'
import { LABELS_STATUT_PROJET } from '../types/project'
import type { Invoice } from '../types/invoice'
import { COULEUR_STATUT_INVOICE, LABELS_STATUT_INVOICE } from '../types/invoice'
import { Card } from '../components/ui/Card'
import { PrioriteBadge } from '../components/ui/PrioriteBadge'

/* Objectif de chiffre d'affaires mensuel par défaut (widget de progression). */
const OBJECTIF_MENSUEL = 5000

const eur = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const eur2 = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    Promise.all([dashboardApi.getSummary(), clientsApi.findAll(), projectsApi.findAll(), invoicesApi.findAll()])
      .then(([s, c, p, i]) => {
        setSummary(s)
        setClients(c)
        setProjects(p)
        setInvoices(i)
      })
      .catch((err) => toast.error(messageErreur(err)))
      .finally(() => setChargement(false))
  }, [])

  // Série de CA payé sur les 6 derniers mois, calculée à partir des factures.
  const serieCA = useMemo(() => revenusParMois(invoices, 6), [invoices])
  const tendanceCA = useMemo(() => {
    if (serieCA.length < 2) return null
    const actuel = serieCA[serieCA.length - 1].total
    const precedent = serieCA[serieCA.length - 2].total
    if (precedent === 0) return actuel > 0 ? 100 : null
    return Math.round(((actuel - precedent) / precedent) * 100)
  }, [serieCA])

  const projetsRecents = useMemo(() => [...projects].sort((a, b) => b.id - a.id).slice(0, 5), [projects])
  const facturesRecentes = useMemo(() => [...invoices].sort((a, b) => b.id - a.id).slice(0, 5), [invoices])
  const nbImpayees = useMemo(
    () => invoices.filter((i) => i.statut === 'ENVOYE' || i.statut === 'EN_RETARD').length,
    [invoices],
  )

  if (chargement) {
    return <DashboardSkeleton />
  }

  const caMois = summary?.chiffreAffairesMois ?? 0
  const progression = Math.min(100, Math.round((caMois / OBJECTIF_MENSUEL) * 100))

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-navy-800 dark:text-navy-100">
          Bonjour 👋
        </h2>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Voici un aperçu de votre activité freelance aujourd'hui.
        </p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          tone="brand"
          label="Clients"
          value={String(summary?.nombreClients ?? 0)}
          hint="clients enregistrés"
        />
        <StatCard
          icon={FolderKanban}
          tone="violet"
          label="Projets en cours"
          value={String(summary?.projetsEnCours ?? 0)}
          hint={`sur ${projects.length} projet${projects.length > 1 ? 's' : ''} au total`}
        />
        <StatCard
          icon={Wallet}
          tone="emerald"
          label="CA du mois"
          value={`${eur(caMois)} €`}
          hint="factures payées ce mois"
          trend={tendanceCA}
        />
        <StatCard
          icon={AlertTriangle}
          tone="amber"
          label="Factures impayées"
          value={`${eur(summary?.montantFacturesImpayees ?? 0)} €`}
          hint={`${nbImpayees} facture${nbImpayees > 1 ? 's' : ''} en attente`}
        />
      </div>

      {/* Graphique CA + objectif */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-navy-800 dark:text-navy-100">Chiffre d'affaires</h3>
              <p className="text-xs text-navy-400">Factures payées, 6 derniers mois</p>
            </div>
          </div>
          <RevenueChart data={serieCA} />
        </Card>

        <Card className="flex flex-col p-5">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-500" />
            <h3 className="text-sm font-semibold text-navy-800 dark:text-navy-100">Objectif mensuel</h3>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <ProgressRing valeur={progression} />
            <div className="mt-4 text-center">
              <p className="text-sm text-navy-500 dark:text-navy-400">
                <span className="font-semibold text-navy-800 dark:text-navy-100">{eur(caMois)} €</span> / {eur(OBJECTIF_MENSUEL)} €
              </p>
              <p className="mt-1 text-xs text-navy-400">Objectif de chiffre d'affaires</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Activité récente */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHeader titre="Projets récents" lien="/projets" />
          {projetsRecents.length === 0 ? (
            <EmptyRow message="Aucun projet pour le moment." />
          ) : (
            <ul className="divide-y divide-navy-100 dark:divide-navy-800/70">
              {projetsRecents.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/projets/${p.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-navy-50 dark:hover:bg-navy-800/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy-800 dark:text-navy-100">{p.titre}</p>
                      <p className="truncate text-xs text-navy-400">{p.clientNom}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <PrioriteBadge priorite={p.priorite} />
                      <span className="hidden text-xs text-navy-400 sm:inline">{LABELS_STATUT_PROJET[p.statut]}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <SectionHeader titre="Dernières factures" lien="/factures" />
          {facturesRecentes.length === 0 ? (
            <EmptyRow message="Aucune facture pour le moment." />
          ) : (
            <ul className="divide-y divide-navy-100 dark:divide-navy-800/70">
              {facturesRecentes.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-800 dark:text-navy-100">{f.numero}</p>
                    <p className="truncate text-xs text-navy-400">{f.clientNom}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COULEUR_STATUT_INVOICE[f.statut]}`}>
                      {LABELS_STATUT_INVOICE[f.statut]}
                    </span>
                    <span className="w-24 text-right text-sm font-medium text-navy-700 dark:text-navy-200">
                      {eur2(f.montantTTC)} €
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Clients récents */}
      <Card className="p-5">
        <SectionHeader titre="Clients récents" lien="/clients" />
        {clients.length === 0 ? (
          <EmptyRow message="Aucun client pour le moment." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {[...clients]
              .sort((a, b) => b.id - a.id)
              .slice(0, 8)
              .map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 py-1 pl-1 pr-3 text-sm text-navy-700 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-200"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-semibold text-white">
                    {c.nom.slice(0, 2).toUpperCase()}
                  </span>
                  {c.nom}
                </span>
              ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 *  Sous-composants
 * ------------------------------------------------------------------------- */

const TONES: Record<string, string> = {
  brand: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
}

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  hint,
  trend,
}: {
  icon: LucideIcon
  tone: keyof typeof TONES
  label: string
  value: string
  hint: string
  trend?: number | null
}) {
  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        {trend != null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              trend >= 0
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
            }`}
          >
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-navy-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-navy-600 dark:text-navy-300">{label}</p>
      <p className="mt-1 text-xs text-navy-400">{hint}</p>
    </Card>
  )
}

function RevenueChart({ data }: { data: { label: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1)
  return (
    <div className="flex h-44 items-end justify-between gap-2 sm:gap-4">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="group relative w-full rounded-t-lg bg-gradient-to-t from-cyan-500/80 to-cyan-400 transition-all duration-300 hover:from-cyan-600 hover:to-cyan-500"
              style={{ height: `${Math.max(4, (d.total / max) * 100)}%` }}
            >
              <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy-900 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-navy-700">
                {eur(d.total)} €
              </span>
            </div>
          </div>
          <span className="text-[11px] font-medium text-navy-400">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function ProgressRing({ valeur }: { valeur: number }) {
  const rayon = 52
  const circonference = 2 * Math.PI * rayon
  const offset = circonference - (valeur / 100) * circonference
  return (
    <div className="relative mx-auto h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={rayon} fill="none" strokeWidth="10" className="stroke-navy-100 dark:stroke-navy-800" />
        <circle
          cx="60"
          cy="60"
          r={rayon}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-cyan-500 transition-all duration-700 ease-out"
          strokeDasharray={circonference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-navy-800 dark:text-navy-100">{valeur}%</span>
        <span className="text-[11px] text-navy-400">atteint</span>
      </div>
    </div>
  )
}

function SectionHeader({ titre, lien }: { titre: string; lien: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-navy-800 dark:text-navy-100">{titre}</h3>
      <Link
        to={lien}
        className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400"
      >
        Voir tout
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

function EmptyRow({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-navy-400">{message}</p>
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-navy-100 dark:bg-navy-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-navy-100 dark:bg-navy-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-2xl bg-navy-100 dark:bg-navy-800 lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-2xl bg-navy-100 dark:bg-navy-800" />
      </div>
    </div>
  )
}

/**
 * Agrège le CA (factures de type FACTURE au statut PAYE) par mois sur les
 * `nbMois` derniers mois. Purement dérivé des données réelles côté client.
 */
function revenusParMois(invoices: Invoice[], nbMois: number): { label: string; total: number }[] {
  const maintenant = new Date()
  const buckets: { label: string; total: number; cle: string }[] = []

  for (let i = nbMois - 1; i >= 0; i--) {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1)
    buckets.push({
      cle: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
      total: 0,
    })
  }

  for (const inv of invoices) {
    if (inv.type !== 'FACTURE' || inv.statut !== 'PAYE') continue
    const d = new Date(inv.dateEmission)
    const cle = `${d.getFullYear()}-${d.getMonth()}`
    const bucket = buckets.find((b) => b.cle === cle)
    if (bucket) bucket.total += inv.montantTTC
  }

  return buckets.map(({ label, total }) => ({ label, total }))
}
