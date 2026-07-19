import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Inbox, Search } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  /** Valeur utilisée pour le tri lorsque la colonne est cliquée ; si absent, la colonne n'est pas triable. */
  sortValue?: (item: T) => string | number
}

/**
 * Tableau générique premium (style Notion/Stripe) avec recherche texte libre
 * et tri par colonne, réutilisé sur les pages Clients, Projets et Factures.
 * `getSearchText` fournit la chaîne dans laquelle chercher.
 */
export function DataTable<T>({
  columns,
  data,
  getSearchText,
  getRowKey,
  emptyMessage = 'Aucun résultat',
  onRowClick,
}: {
  columns: Column<T>[]
  data: T[]
  getSearchText: (item: T) => string
  getRowKey: (item: T) => string | number
  emptyMessage?: string
  onRowClick?: (item: T) => void
}) {
  const [recherche, setRecherche] = useState('')
  const [tri, setTri] = useState<{ colonne: string; asc: boolean } | null>(null)

  const donneesFiltrees = useMemo(() => {
    let resultat = data
    if (recherche.trim()) {
      const q = recherche.trim().toLowerCase()
      resultat = resultat.filter((item) => getSearchText(item).toLowerCase().includes(q))
    }
    if (tri) {
      const colonne = columns.find((c) => c.key === tri.colonne)
      if (colonne?.sortValue) {
        resultat = [...resultat].sort((a, b) => {
          const va = colonne.sortValue!(a)
          const vb = colonne.sortValue!(b)
          const cmp = va < vb ? -1 : va > vb ? 1 : 0
          return tri.asc ? cmp : -cmp
        })
      }
    }
    return resultat
  }, [data, recherche, tri, columns, getSearchText])

  function handleTri(colonne: Column<T>) {
    if (!colonne.sortValue) return
    setTri((prev) =>
      prev?.colonne === colonne.key ? { colonne: colonne.key, asc: !prev.asc } : { colonne: colonne.key, asc: true },
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-200/80 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
      {/* Barre de recherche */}
      <div className="flex items-center justify-between gap-3 border-b border-navy-100 p-3 dark:border-navy-800">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="h-9.5 w-full rounded-xl border border-navy-200 bg-navy-50 pl-9 pr-3 text-sm text-navy-700 outline-none transition-all placeholder:text-navy-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/12 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100 dark:focus:bg-navy-800"
          />
        </div>
        <span className="hidden shrink-0 text-xs font-medium text-navy-400 sm:block">
          {donneesFiltrees.length} élément{donneesFiltrees.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 dark:border-navy-800">
              {columns.map((colonne) => {
                const actif = tri?.colonne === colonne.key
                return (
                  <th
                    key={colonne.key}
                    className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-400 ${
                      colonne.sortValue ? 'cursor-pointer select-none transition-colors hover:text-navy-800 dark:hover:text-navy-200' : ''
                    }`}
                    onClick={() => handleTri(colonne)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {colonne.header}
                      {actif && (tri!.asc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100 dark:divide-navy-800/70">
            {donneesFiltrees.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center">
                  <Inbox className="mx-auto mb-3 h-8 w-8 text-navy-300 dark:text-navy-600" />
                  <p className="text-sm text-navy-400">{emptyMessage}</p>
                </td>
              </tr>
            )}
            {donneesFiltrees.map((item) => (
              <tr
                key={getRowKey(item)}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-navy-50 dark:hover:bg-navy-800/50' : ''
                }`}
              >
                {columns.map((colonne) => (
                  <td key={colonne.key} className="whitespace-nowrap px-4 py-3 text-navy-700 dark:text-navy-200">
                    {colonne.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
