import { useMemo } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronRight,
  Copy,
  GripVertical,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react'
import type { Block, Project } from '../lib/types'
import { blockSummary, catalogEntry } from './blockCatalog'
import { BlockEditor } from './editors/BlockEditor'

interface CardProps {
  block: Block
  index: number
  expanded: boolean
  project: Project
  onSelect: () => void
  onChange: (b: Block) => void
  onDuplicate: () => void
  onDelete: () => void
}

function BlockCard({ block, index, expanded, project, onSelect, onChange, onDuplicate, onDelete }: CardProps) {
  const entry = catalogEntry(block.type)
  const Icon = entry.icon
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`block-shell overflow-hidden rounded-xl border bg-ink-850 ${
        isDragging
          ? 'z-20 border-mc-emerald/60 opacity-90 shadow-2xl'
          : expanded
            ? 'border-ink-600 shadow-panel'
            : 'border-ink-750 hover:border-ink-600'
      }`}
    >
      <div className={`flex items-center gap-1.5 px-2 py-2 ${expanded ? 'border-b border-ink-750 bg-ink-900/60' : ''}`}>
        <button
          className="cursor-grab touch-none rounded p-1 text-ink-600 transition hover:bg-ink-800 hover:text-ink-300 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>

        <button className="flex min-w-0 flex-1 items-center gap-2.5 py-1 text-left" onClick={onSelect}>
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
            style={{ background: `${entry.accent}1f`, color: entry.accent }}
          >
            <Icon size={14} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2">
              <span className="truncate text-[13px] font-medium text-ink-100">{entry.name}</span>
              <span className="shrink-0 font-mono text-[10px] text-ink-600">{String(index + 1).padStart(2, '0')}</span>
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-ink-500">{blockSummary(block)}</span>
          </span>
          <ChevronRight size={14} className={`shrink-0 text-ink-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        <div className="flex items-center gap-0.5">
          <button className="icon-btn" onClick={onDuplicate} title="Duplicate block">
            <Copy size={13} />
          </button>
          <button className="icon-btn hover:bg-mc-redstone/15 hover:text-mc-redstone" onClick={onDelete} title="Delete block">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="animate-fade-up bg-ink-850 px-3 py-3.5">
          <BlockEditor block={block} onChange={onChange} meta={project.meta} />
        </div>
      )}
    </div>
  )
}

interface Props {
  project: Project
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (blocks: Block[]) => void
  onAdd: () => void
  onMarkdownMode: () => void
  onOpenBannerStudio: () => void
  onDeleteBlock: (id: string) => void
}

export function Canvas({ project, selectedId, onSelect, onChange, onAdd, onMarkdownMode, onOpenBannerStudio, onDeleteBlock }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const stats = useMemo(() => ({ blocks: project.blocks.length }), [project.blocks])

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = project.blocks.findIndex((b) => b.id === active.id)
    const newIndex = project.blocks.findIndex((b) => b.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onChange(arrayMove(project.blocks, oldIndex, newIndex))
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-blueprint">
      <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-ink-800 bg-ink-900/70 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          <Layers size={12} className="text-mc-diamond" />
          {stats.blocks} blocks
        </div>
        <span className="hidden text-ink-700 sm:inline">·</span>
        <span className="hidden text-[11px] text-ink-500 sm:inline">drag to reorder</span>
        <div className="flex w-full items-center gap-1.5 sm:ml-auto sm:w-auto">
          <button className="btn btn-ghost whitespace-nowrap text-xs" onClick={onOpenBannerStudio} title="Generate a banner image">
            <Wand2 size={13} /> Banner<span className="hidden sm:inline"> studio</span>
          </button>
          <button className="btn btn-ghost whitespace-nowrap text-xs" onClick={onMarkdownMode} title="Edit the generated markdown">
            Markdown
          </button>
          <button className="btn btn-primary ml-auto whitespace-nowrap text-xs sm:ml-0" onClick={onAdd}>
            <Plus size={14} /> Add block
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-[720px] space-y-2 pb-24">
          {project.blocks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/50 px-6 py-16 text-center">
              <Sparkles className="mx-auto mb-3 text-ink-600" size={24} />
              <p className="text-sm font-medium text-ink-300">Your description is empty</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-500">
                Start from a template or drop in a block. Every block is a real Markdown snippet you can copy straight into Modrinth or CurseForge.
              </p>
              <button className="btn btn-primary mx-auto mt-4" onClick={onAdd}>
                <Plus size={14} /> Add your first block
              </button>
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={project.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {project.blocks.map((block, index) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  index={index}
                  project={project}
                  expanded={selectedId === block.id}
                  onSelect={() => onSelect(selectedId === block.id ? null : block.id)}
                  onChange={(next) => onChange(project.blocks.map((b) => (b.id === next.id ? next : b)))}
                  onDuplicate={() => {
                    const copy = { ...block, id: `${block.id}_copy_${Math.random().toString(36).slice(2, 7)}` }
                    const blocks = [...project.blocks]
                    blocks.splice(index + 1, 0, copy)
                    onChange(blocks)
                  }}
                  onDelete={() => onDeleteBlock(block.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {project.blocks.length > 0 && (
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-700 py-3 text-xs text-ink-500 transition hover:border-mc-emerald/40 hover:bg-mc-emerald/5 hover:text-mc-emerald"
              onClick={onAdd}
            >
              <Plus size={14} /> Add block
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
