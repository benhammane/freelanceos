import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { closestCorners, DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface KanbanColumnDef<S extends string> {
  id: S
  label: string
}

/**
 * Tableau Kanban générique (réutilisé pour le board Projets et le board
 * Tâches). @dnd-kit fonctionne par "capteurs" (sensors) qui détectent le
 * geste de glisser-déposer, et par des zones "droppable" (colonnes) /
 * éléments "sortable" (cartes). On garde une copie locale groupée par
 * colonne (`colonnes`) pour un rendu fluide pendant le drag, et on ne
 * prévient le parent (via onMove) qu'une fois le geste terminé, pour qu'il
 * persiste le changement côté API.
 */
export function KanbanBoard<T, S extends string>({
  columns,
  items,
  getId,
  getStatut,
  renderCard,
  onMove,
}: {
  columns: KanbanColumnDef<S>[]
  items: T[]
  getId: (item: T) => number
  getStatut: (item: T) => S
  renderCard: (item: T) => ReactNode
  onMove: (id: number, statut: S, position: number) => void
}) {
  const [colonnes, setColonnes] = useState<Record<S, T[]>>(() => grouperParColonne(items, columns, getStatut))

  useEffect(() => {
    setColonnes(grouperParColonne(items, columns, getStatut))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const [itemActif, setItemActif] = useState<T | null>(null)

  function trouverColonne(id: number): S | undefined {
    return columns.find((col) => colonnes[col.id]?.some((item) => getId(item) === id))?.id
  }

  function handleDragStart(event: DragStartEvent) {
    const id = Number(event.active.id)
    const colonne = trouverColonne(id)
    const item = colonne ? colonnes[colonne].find((i) => getId(i) === id) : null
    setItemActif(item ?? null)
  }

  /**
   * Pendant le survol : si la carte passe au-dessus d'une AUTRE colonne que
   * la sienne, on la déplace visuellement tout de suite (sans encore
   * appeler l'API) pour un retour visuel immédiat.
   */
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const activeId = Number(active.id)
    const colonneSource = trouverColonne(activeId)
    if (!colonneSource) return

    const colonneCible = resoudreColonneCible(over.id, colonneSource)
    if (!colonneCible || colonneCible === colonneSource) return

    setColonnes((prev) => {
      const item = prev[colonneSource].find((i) => getId(i) === activeId)
      if (!item) return prev
      return {
        ...prev,
        [colonneSource]: prev[colonneSource].filter((i) => getId(i) !== activeId),
        [colonneCible]: [...prev[colonneCible], item],
      }
    })
  }

  function resoudreColonneCible(overId: string | number, colonneSource: S): S | undefined {
    const colonneDirecte = columns.find((c) => c.id === overId)
    if (colonneDirecte) return colonneDirecte.id
    return trouverColonne(Number(overId)) ?? colonneSource
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setItemActif(null)
    if (!over) return

    const activeId = Number(active.id)
    const colonneSource = trouverColonne(activeId)
    if (!colonneSource) return
    const colonneCible = resoudreColonneCible(over.id, colonneSource)
    if (!colonneCible) return

    setColonnes((prev) => {
      const itemsCible = [...prev[colonneCible]]
      const ancienIndex = itemsCible.findIndex((i) => getId(i) === activeId)
      const overIndex = itemsCible.findIndex((i) => getId(i) === Number(over.id))

      let nouvelOrdre = itemsCible
      let indexFinal = overIndex >= 0 ? overIndex : itemsCible.length - 1

      if (ancienIndex >= 0 && overIndex >= 0) {
        nouvelOrdre = arrayMove(itemsCible, ancienIndex, overIndex)
      }
      if (indexFinal < 0) indexFinal = 0

      onMove(activeId, colonneCible, indexFinal)
      return { ...prev, [colonneCible]: nouvelOrdre }
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((colonne) => (
          <KanbanColumn key={colonne.id} id={colonne.id} label={colonne.label} count={colonnes[colonne.id]?.length ?? 0}>
            <SortableContext items={(colonnes[colonne.id] ?? []).map((i) => getId(i))} strategy={verticalListSortingStrategy}>
              {(colonnes[colonne.id] ?? []).map((item) => (
                <SortableCard key={getId(item)} id={getId(item)}>
                  {renderCard(item)}
                </SortableCard>
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay>{itemActif ? <div className="rotate-1">{renderCard(itemActif)}</div> : null}</DragOverlay>
    </DndContext>
  )
}

function grouperParColonne<T, S extends string>(
  items: T[],
  columns: KanbanColumnDef<S>[],
  getStatut: (item: T) => S,
): Record<S, T[]> {
  const groupes = {} as Record<S, T[]>
  columns.forEach((c) => {
    groupes[c.id] = []
  })
  items.forEach((item) => {
    groupes[getStatut(item)]?.push(item)
  })
  return groupes
}

function KanbanColumn({ id, label, count, children }: { id: string; label: string; count: number; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-2xl border transition-colors ${
        isOver
          ? 'border-cyan-400 bg-cyan-50/60 dark:border-cyan-500/50 dark:bg-cyan-500/10'
          : 'border-navy-200/70 bg-navy-100/50 dark:border-navy-800 dark:bg-navy-900/50'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-200">{label}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-navy-400 shadow-xs dark:bg-navy-800 dark:text-navy-400">{count}</span>
      </div>
      <div className="flex min-h-[80px] flex-col gap-2 px-3 pb-3">{children}</div>
    </div>
  )
}

function SortableCard({ id, children }: { id: number; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}
