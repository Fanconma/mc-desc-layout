import { useMemo, useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { BLOCK_CATALOG } from './blockCatalog'
import type { BlockType } from '../lib/types'

const ORDER: Array<'Intro' | 'Content' | 'Media' | 'Info' | 'Closing'> = ['Intro', 'Content', 'Media', 'Info', 'Closing']

export function LibraryPanel({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? BLOCK_CATALOG.filter((c) => `${c.name} ${c.description} ${c.category}`.toLowerCase().includes(q))
      : BLOCK_CATALOG
    return ORDER.map((cat) => ({ cat, items: filtered.filter((c) => c.category === cat) })).filter((g) => g.items.length)
  }, [query])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-ink-800 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <Sparkles size={14} className="text-mc-emerald" /> Block library
        </h2>
        <p className="mt-0.5 text-[11px] leading-snug text-ink-500">Click a block to add it to the end of your description.</p>
        <div className="relative mt-2.5">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            className="field-sm w-full pl-8"
            placeholder="Search blocks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {groups.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-500">No blocks match “{query}”.</p>}
        {groups.map((group) => (
          <div key={group.cat} className="mb-4">
            <h3 className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-600">{group.cat}</h3>
            <div className="space-y-1">
              {group.items.map((entry) => {
                const Icon = entry.icon
                return (
                  <button
                    key={entry.type}
                    onClick={() => onAdd(entry.type)}
                    className="group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition hover:border-ink-700 hover:bg-ink-850"
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg transition group-hover:scale-105"
                      style={{ background: `${entry.accent}1a`, color: entry.accent }}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium text-ink-200 group-hover:text-white">{entry.name}</span>
                      <span className="block truncate text-[11px] text-ink-500">{entry.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-ink-800 bg-ink-900/60 px-4 py-3">
        <p className="text-[11px] leading-relaxed text-ink-500">
          <span className="font-semibold text-ink-300">Tip:</span> everything here compiles to plain Markdown with a sprinkle of allowed HTML — no lock-in, no proprietary format.
        </p>
      </div>
    </div>
  )
}
